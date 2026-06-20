package handlers

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/foxyselabs/gateway/internal/middleware"
)

type ChatHandler struct {
	DB            *pgxpool.Pool
	AgentServiceURL string
}

type chatStreamReq struct {
	ThreadID    string         `json:"thread_id"`
	Content     string         `json:"content"`
	Model       string         `json:"model,omitempty"`
	Provider    string         `json:"provider,omitempty"`
}

// Stream proxies the request to the Python agent and relays SSE events back
// to the browser. It also persists the user message + final assistant message
// to the threads/messages tables.
func (h *ChatHandler) Stream(c *gin.Context) {
	uid, _ := middleware.UserID(c)

	var req chatStreamReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	if strings.TrimSpace(req.Content) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content is required"})
		return
	}

	// Resolve thread: create if missing, otherwise verify ownership
	threadID, err := h.resolveThread(c, uid, req.ThreadID, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not resolve thread"})
		return
	}

	// Persist user message
	userMsgID := uuid.New()
	now := time.Now()
	if _, err := h.DB.Exec(c, `
		INSERT INTO messages (id, thread_id, role, content, created_at)
		VALUES ($1, $2, 'user', $3, $4)
	`, userMsgID, threadID, req.Content, now); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not persist user message"})
		return
	}
	h.bumpThread(c, threadID, now)

	// Load user settings (default provider/model) for fallback
	defaultProvider, defaultModel := h.userDefaults(c, uid)

	provider := req.Provider
	if provider == "" {
		provider = defaultProvider
	}
	model := req.Model
	if model == "" {
		model = defaultModel
	}

	// Load conversation history (last 50 messages) for context
	history, err := h.loadHistory(c, threadID, 50)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load history"})
		return
	}

	// Build request to agent
	agentBody, _ := json.Marshal(map[string]any{
		"thread_id":    threadID.String(),
		"user_id":      uid.String(),
		"messages":     history,
		"provider":     provider,
		"model":        model,
		"system_prompt": "You are Foxyse, a helpful AI Agent. Be concise, accurate, and friendly.",
	})

	// Call agent
	httpClient := &http.Client{Timeout: 0} // streaming
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

	// Persist assistant message
	asstMsgID := uuid.New()
	asstCreated := time.Now()
	var (
		asstContent  strings.Builder
		finalModel   string
		promptToks   int
		complToks    int
	)

	// Stream events
	scanner := bufio.NewScanner(resp.Body)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)

	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		// Forward line to client
		if _, err := c.Writer.Write(line); err != nil {
			break
		}
		if _, err := c.Writer.Write([]byte("\n")); err != nil {
			break
		}
		if flusher != nil {
			flusher.Flush()
		}

		// Parse SSE event lines to accumulate assistant content
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
				case "thread.end":
					if m, ok := ev["model"].(string); ok {
						finalModel = m
					}
				case "usage":
					if v, ok := ev["prompt_tokens"].(float64); ok {
						promptToks = int(v)
					}
					if v, ok := ev["completion_tokens"].(float64); ok {
						complToks = int(v)
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
	h.bumpThread(c, threadID, time.Now())
}

func (h *ChatHandler) resolveThread(c *gin.Context, userID uuid.UUID, threadIDStr, firstMessage string) (uuid.UUID, error) {
	if threadIDStr != "" {
		id, err := uuid.Parse(threadIDStr)
		if err != nil {
			return uuid.Nil, fmt.Errorf("invalid thread id")
		}
		// verify ownership
		var owner uuid.UUID
		err = h.DB.QueryRow(c, `SELECT user_id FROM threads WHERE id = $1`, id).Scan(&owner)
		if err != nil {
			return uuid.Nil, err
		}
		if owner != userID {
			return uuid.Nil, fmt.Errorf("forbidden")
		}
		return id, nil
	}
	// create new
	id := uuid.New()
	title := firstMessage
	if len(title) > 80 {
		title = title[:80]
	}
	_, err := h.DB.Exec(c, `
		INSERT INTO threads (id, user_id, title, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
	`, id, userID, title)
	return id, err
}

func (h *ChatHandler) bumpThread(c *gin.Context, threadID uuid.UUID, t time.Time) {
	_, _ = h.DB.Exec(c, `UPDATE threads SET updated_at = $1 WHERE id = $2`, t, threadID)
}

func (h *ChatHandler) userDefaults(c *gin.Context, userID uuid.UUID) (provider, model string) {
	provider = "openai"
	model = "gpt-4o-mini"
	_ = h.DB.QueryRow(c, `SELECT default_provider, default_model FROM users WHERE id = $1`, userID).Scan(&provider, &model)
	return
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

func nullableString(s string) any {
	if s == "" {
		return nil
	}
	return s
}
