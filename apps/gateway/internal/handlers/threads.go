package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ThreadsHandler struct {
	DB *pgxpool.Pool
}

type threadDTO struct {
	ID            string  `json:"id"`
	UserID        string  `json:"user_id"`
	Title         *string `json:"title"`
	WorkspacePath string  `json:"workspace_path"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
	ArchivedAt    *string `json:"archived_at,omitempty"`
}

type createThreadReq struct {
	Title         *string `json:"title"`
	WorkspacePath *string `json:"workspace_path"`
}

// listUsers: returns users — admin sees all, regular users see themselves only.
func (h *ThreadsHandler) List(c *gin.Context) {
	uid, isAdmin, ok := currentUser(c)
	if !ok {
		uid, isAdmin, _ = h.bootstrapUser(c)
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	var rows pgx.Rows
	var err error
	if isAdmin {
		rows, err = h.DB.Query(c, `
			SELECT id, user_id, title, workspace_path, created_at, updated_at, archived_at
			FROM threads
			ORDER BY updated_at DESC
			LIMIT $1 OFFSET $2
		`, limit, offset)
	} else {
		rows, err = h.DB.Query(c, `
			SELECT id, user_id, title, workspace_path, created_at, updated_at, archived_at
			FROM threads
			WHERE user_id = $1
			ORDER BY updated_at DESC
			LIMIT $2 OFFSET $3
		`, uid, limit, offset)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	defer rows.Close()

	out := make([]threadDTO, 0)
	for rows.Next() {
		var (
			id, userID             uuid.UUID
			title                  *string
			workspacePath          string
			createdAt, updatedAt   time.Time
			archivedAt             *time.Time
		)
		if err := rows.Scan(&id, &userID, &title, &workspacePath, &createdAt, &updatedAt, &archivedAt); err != nil {
			continue
		}
		var archStr *string
		if archivedAt != nil {
			s := archivedAt.Format(time.RFC3339)
			archStr = &s
		}
		out = append(out, threadDTO{
			ID:            id.String(),
			UserID:        userID.String(),
			Title:         title,
			WorkspacePath: workspacePath,
			CreatedAt:     createdAt.Format(time.RFC3339),
			UpdatedAt:     updatedAt.Format(time.RFC3339),
			ArchivedAt:    archStr,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func (h *ThreadsHandler) Create(c *gin.Context) {
	uid, isAdmin, ok := currentUser(c)
	if !ok {
		uid, isAdmin, _ = h.bootstrapUser(c)
	}
	_ = isAdmin

	var req createThreadReq
	_ = c.ShouldBindJSON(&req)

	id := uuid.New()
	now := time.Now()
	wsPath := "/data/workspaces/default"
	if req.WorkspacePath != nil {
		wsPath = *req.WorkspacePath
	}

	_, err := h.DB.Exec(c, `
		INSERT INTO threads (id, user_id, title, workspace_path, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $5)
	`, id, uid, req.Title, wsPath, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create thread"})
		return
	}
	c.JSON(http.StatusCreated, threadDTO{
		ID:            id.String(),
		UserID:        uid.String(),
		Title:         req.Title,
		WorkspacePath: wsPath,
		CreatedAt:     now.Format(time.RFC3339),
		UpdatedAt:     now.Format(time.RFC3339),
	})
}

func (h *ThreadsHandler) Get(c *gin.Context) {
	uid, isAdmin, ok := currentUser(c)
	if !ok {
		uid, isAdmin, _ = h.bootstrapUser(c)
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid thread id"})
		return
	}

	var (
		owner         uuid.UUID
		title         *string
		workspacePath string
		createdAt     time.Time
		updatedAt     time.Time
		archivedAt    *time.Time
	)
	err = h.DB.QueryRow(c, `
		SELECT user_id, title, workspace_path, created_at, updated_at, archived_at
		FROM threads WHERE id = $1
	`, id).Scan(&owner, &title, &workspacePath, &createdAt, &updatedAt, &archivedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	// Access check: admin can see all, regular user only own.
	if !isAdmin && owner != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	rows, err := h.DB.Query(c, `
		SELECT id, role, content, tool_name, tool_input, tool_output,
		       model_used, prompt_tokens, completion_tokens, created_at
		FROM messages WHERE thread_id = $1 ORDER BY created_at ASC
	`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	defer rows.Close()

	type messageDTO struct {
		ID               string  `json:"id"`
		Role             string  `json:"role"`
		Content          string  `json:"content"`
		ToolName         *string `json:"tool_name,omitempty"`
		ToolInput        []byte  `json:"tool_input,omitempty"`
		ToolOutput       []byte  `json:"tool_output,omitempty"`
		ModelUsed        *string `json:"model_used,omitempty"`
		PromptTokens     *int    `json:"prompt_tokens,omitempty"`
		CompletionTokens *int    `json:"completion_tokens,omitempty"`
		CreatedAt        string  `json:"created_at"`
	}

	messages := make([]messageDTO, 0)
	for rows.Next() {
		var (
			mid              uuid.UUID
			role, content    string
			toolName         *string
			toolInput        []byte
			toolOutput       []byte
			modelUsed        *string
			promptTokens     *int
			completionTokens *int
			createdAt        time.Time
		)
		if err := rows.Scan(&mid, &role, &content, &toolName, &toolInput, &toolOutput, &modelUsed, &promptTokens, &completionTokens, &createdAt); err != nil {
			continue
		}
		messages = append(messages, messageDTO{
			ID:               mid.String(),
			Role:             role,
			Content:          content,
			ToolName:         toolName,
			ToolInput:        toolInput,
			ToolOutput:       toolOutput,
			ModelUsed:        modelUsed,
			PromptTokens:     promptTokens,
			CompletionTokens: completionTokens,
			CreatedAt:        createdAt.Format(time.RFC3339),
		})
	}

	var archStr *string
	if archivedAt != nil {
		s := archivedAt.Format(time.RFC3339)
		archStr = &s
	}
	c.JSON(http.StatusOK, gin.H{
		"thread": threadDTO{
			ID:            id.String(),
			UserID:        owner.String(),
			Title:         title,
			WorkspacePath: workspacePath,
			CreatedAt:     createdAt.Format(time.RFC3339),
			UpdatedAt:     updatedAt.Format(time.RFC3339),
			ArchivedAt:    archStr,
		},
		"messages": messages,
	})
}

func (h *ThreadsHandler) Delete(c *gin.Context) {
	uid, isAdmin, ok := currentUser(c)
	if !ok {
		uid, isAdmin, _ = h.bootstrapUser(c)
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid thread id"})
		return
	}

	// Verify ownership
	var owner uuid.UUID
	err = h.DB.QueryRow(c, `SELECT user_id FROM threads WHERE id = $1`, id).Scan(&owner)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if !isAdmin && owner != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	tag, err := h.DB.Exec(c, `DELETE FROM threads WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

// bootstrapUser: for self-hosted single-owner mode, the first user in
// the DB IS the owner. We return that user (creating it if needed via
// the /api/admin/setup endpoint at first run).
func (h *ThreadsHandler) bootstrapUser(c *gin.Context) (uuid.UUID, bool, bool) {
	ctx := c.Request.Context()
	var (
		id     uuid.UUID
		admin  bool
		active bool
	)
	err := h.DB.QueryRow(ctx, `
		SELECT id, is_admin, is_active FROM users ORDER BY created_at ASC LIMIT 1
	`).Scan(&id, &admin, &active)
	if err != nil || !active {
		return uuid.Nil, false, false
	}
	return id, admin, true
}
