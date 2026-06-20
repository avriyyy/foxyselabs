package handlers

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ = context.Background
var _ = errors.New
var _ = pgx.ErrNoRows

type ChatHandler struct {
	DB              *pgxpool.Pool
	AgentServiceURL string
}

type chatStreamReq struct {
	ThreadID     string `json:"thread_id"`
	Content      string `json:"content"`
	WorkspaceDir string `json:"workspace"`
}

func (h *ChatHandler) Stream(c *gin.Context) {
	// Bootstrap the first user as the owner (self-hosted single-owner mode).
	threadsH := &ThreadsHandler{DB: h.DB}
	uid, isAdmin, ok := threadsH.bootstrapUser(c)
	if !ok {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "setup_required",
			"message": "No admin user configured. Visit /api/admin/setup first.",
		})
		return
	}

	var req chatStreamReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	if strings.TrimSpace(req.Content) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content is required"})
		return
	}

	// Resolve or create thread
	threadID, workspacePath, err := h.resolveThread(c, uid, req.ThreadID, req.Content, req.WorkspaceDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not resolve thread: " + err.Error()})
		return
	}

	// Access check: verify user can access this workspace
	if !h.userCanAccessWorkspace(c, uid, workspacePath, isAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"error": "no access to workspace"})
		return
	}
	_ = isAdmin

	// Persist user message
	userMsgID := uuid.New()
	if _, err := h.DB.Exec(c, `
		INSERT INTO messages (id, thread_id, role, content, created_at)
		VALUES ($1, $2, 'user', $3, $4)
	`, userMsgID, threadID, req.Content, time.Now()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not persist user message"})
		return
	}
	h.bumpThread(c, threadID)

	// Load history
	history, err := h.loadHistory(c, threadID, 50)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load history"})
		return
	}

	// Build agent request — single prompt with full history reconstructed
	// by the agent from previous messages.
	prompt := buildPromptFromHistory(history, req.Content)

	agentBody, _ := json.Marshal(map[string]any{
		"thread_id":  threadID.String(),
		"user_id":    uid.String(),
		"content":    prompt,
		"workspace":  workspacePath,
	})

	httpClient := &http.Client{Timeout: 0}
	agentReq, err := http.NewRequestWithContext(c, "POST", h.AgentServiceURL+"/v1/chat/stream", bytes.NewReader(agentBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not build agent request"})
		return
	}
	agentReq.Header.Set("Content-Type", "application/json")
	agentReq.Header.Set("Accept", "text/event-stream")

	resp, err := httpClient.Do(agentReq)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "agent unreachable: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		c.JSON(http.StatusBadGateway, gin.H{
			"error":  "agent returned " + resp.Status,
			"detail": string(body),
		})
		return
	}

	// Set SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no")
	c.Writer.WriteHeader(http.StatusOK)
	flusher, _ := c.Writer.(http.Flusher)

	asstMsgID := uuid.New()
	asstCreated := time.Now()
	var (
		asstContent strings.Builder
		finalModel  string
		promptToks  int
		complToks   int
	)

	scanner := bufio.NewScanner(resp.Body)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)
	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		if _, err := c.Writer.Write(line); err != nil {
			break
		}
		if _, err := c.Writer.Write([]byte("\n")); err != nil {
			break
		}
		if flusher != nil {
			flusher.Flush()
		}

		s := string(line)
		if strings.HasPrefix(s, "data: ") {
			payload := strings.TrimPrefix(s, "data: ")
			var ev map[string]any
			if err := json.Unmarshal([]byte(payload), &ev); err == nil {
				switch ev["type"] {
				case "message.assistant":
					if d, ok := ev["delta"].(string); ok {
						asstContent.WriteString(d)
					}
				case "usage":
					if v, ok := ev["prompt_tokens"].(float64); ok {
						promptToks = int(v)
					}
					if v, ok := ev["completion_tokens"].(float64); ok {
						complToks = int(v)
					}
					if m, ok := ev["model"].(string); ok {
						finalModel = m
					}
				}
			}
		}
	}

	// Persist assistant message
	finalContent := asstContent.String()
	if finalContent == "" {
		finalContent = "(no response)"
	}
	_, _ = h.DB.Exec(c, `
		INSERT INTO messages (id, thread_id, role, content, model_used, prompt_tokens, completion_tokens, created_at)
		VALUES ($1, $2, 'assistant', $3, $4, $5, $6, $7)
	`, asstMsgID, threadID, finalContent, nullableString(finalModel), promptToks, complToks, asstCreated)
	h.bumpThread(c, threadID)
}

func (h *ChatHandler) resolveThread(c *gin.Context, userID uuid.UUID, threadIDStr, firstMessage, requestedWorkspace string) (uuid.UUID, string, error) {
	if threadIDStr != "" {
		id, err := uuid.Parse(threadIDStr)
		if err != nil {
			return uuid.Nil, "", fmt.Errorf("invalid thread id")
		}
		var (
			owner         uuid.UUID
			workspacePath string
		)
		err = h.DB.QueryRow(c, `SELECT user_id, workspace_path FROM threads WHERE id = $1`, id).Scan(&owner, &workspacePath)
		if err != nil {
			return uuid.Nil, "", err
		}
		if owner != userID {
			return uuid.Nil, "", fmt.Errorf("forbidden")
		}
		return id, workspacePath, nil
	}
	// Create new
	id := uuid.New()
	title := firstMessage
	if len(title) > 80 {
		title = title[:80]
	}
	wsPath := requestedWorkspace
	if wsPath == "" {
		wsPath = fmt.Sprintf("/data/workspaces/%s", userID.String())
	}
	_, err := h.DB.Exec(c, `
		INSERT INTO threads (id, user_id, title, workspace_path, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
	`, id, userID, title, wsPath)
	return id, wsPath, err
}

func (h *ChatHandler) bumpThread(c *gin.Context, threadID uuid.UUID) {
	_, _ = h.DB.Exec(c, `UPDATE threads SET updated_at = $1 WHERE id = $2`, time.Now(), threadID)
}

type historyMsg struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func (h *ChatHandler) loadHistory(c *gin.Context, threadID uuid.UUID, limit int) ([]historyMsg, error) {
	rows, err := h.DB.Query(c, `
		SELECT role, content FROM (
			SELECT role, content, created_at FROM messages
			WHERE thread_id = $1
			ORDER BY created_at DESC
			LIMIT $2
		) sub ORDER BY created_at ASC
	`, threadID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]historyMsg, 0)
	for rows.Next() {
		var role, content string
		if err := rows.Scan(&role, &content); err != nil {
			continue
		}
		out = append(out, historyMsg{Role: role, Content: content})
	}
	return out, nil
}

// buildPromptFromHistory: reconstruct a single prompt for Claude Code's
// stateless --print mode. Claude Code will receive the full conversation
// in the prompt itself.
func buildPromptFromHistory(history []historyMsg, newMessage string) string {
	if len(history) == 0 {
		return newMessage
	}
	var b strings.Builder
	for _, m := range history {
		switch m.Role {
		case "user":
			b.WriteString("[USER] ")
		case "assistant":
			b.WriteString("[ASSISTANT] ")
		case "tool":
			b.WriteString("[TOOL RESULT] ")
		}
		b.WriteString(m.Content)
		b.WriteString("\n\n")
	}
	b.WriteString("[USER] ")
	b.WriteString(newMessage)
	return b.String()
}

func (h *ChatHandler) userCanAccessWorkspace(c *gin.Context, userID uuid.UUID, workspacePath string, isAdmin bool) bool {
	if isAdmin {
		return true
	}
	var count int
	err := h.DB.QueryRow(c, `
		SELECT COUNT(*) FROM workspace_access
		WHERE user_id = $1 AND workspace_path = $2 AND can_read = TRUE
	`, userID, workspacePath).Scan(&count)
	if err != nil {
		return false
	}
	// Default: every user can access their own /data/workspaces/{user_id}/
	if count == 0 && strings.HasPrefix(workspacePath, fmt.Sprintf("/data/workspaces/%s", userID.String())) {
		return true
	}
	return count > 0
}

func nullableString(s string) any {
	if s == "" {
		return nil
	}
	return s
}

// Sandbox file proxy: forwards to the agent. The agent's sandbox
// manager is the only thing that knows about live containers.
func (h *ChatHandler) ListFiles(c *gin.Context) {
	threadID := c.Param("id")
	// Pass-through query (path)
	q := c.Request.URL.RawQuery
	target := h.AgentServiceURL + "/v1/sandboxes/" + threadID + "/files"
	if q != "" {
		target += "?" + q
	}
	h.proxyAgent(c, target)
}

func (h *ChatHandler) ReadFile(c *gin.Context) {
	threadID := c.Param("id")
	q := c.Request.URL.RawQuery
	target := h.AgentServiceURL + "/v1/sandboxes/" + threadID + "/files/content"
	if q != "" {
		target += "?" + q
	}
	h.proxyAgent(c, target)
}

func (h *ChatHandler) proxyAgent(c *gin.Context, target string) {
	req, err := http.NewRequestWithContext(c, "GET", target, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "build request: " + err.Error()})
		return
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "agent unreachable: " + err.Error()})
		return
	}
	defer resp.Body.Close()
	for k, v := range resp.Header {
		for _, vv := range v {
			c.Writer.Header().Add(k, vv)
		}
	}
	c.Writer.WriteHeader(resp.StatusCode)
	_, _ = io.Copy(c.Writer, resp.Body)
}
