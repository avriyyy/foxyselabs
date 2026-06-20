package handlers

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ = context.Background

type WorkspacesHandler struct {
	DB *pgxpool.Pool
}

type workspaceDTO struct {
	Path        string  `json:"path"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	CreatedBy   string  `json:"created_by"`
	CreatedAt   string  `json:"created_at"`
	UserCount   int     `json:"user_count"`
}

type createWorkspaceReq struct {
	Path        string  `json:"path"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type grantAccessReq struct {
	UserID    string `json:"user_id"`
	CanRead   bool   `json:"can_read"`
	CanWrite  bool   `json:"can_write"`
}

// List: returns distinct workspace paths that have at least one thread.
// This is "implicit" workspaces — created when the first thread is
// started in a path. We also include rows from workspace_access for
// paths that have access but no threads yet.
func (h *WorkspacesHandler) List(c *gin.Context) {
	threadsH := &ThreadsHandler{DB: h.DB}
	uid, isAdmin, ok := threadsH.bootstrapUser(c)
	_ = uid
	_ = ok
	if !ok {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "setup_required",
			"message": "No admin user configured.",
		})
		return
	}

	var rows pgx.Rows
	var err error
	if isAdmin {
		rows, err = h.DB.Query(c, `
			SELECT workspace_path, MIN(created_at) AS created_at, COUNT(DISTINCT user_id) AS user_count
			FROM workspace_access
			GROUP BY workspace_path
			ORDER BY MIN(created_at) DESC
		`)
	} else {
		rows, err = h.DB.Query(c, `
			SELECT workspace_path, MIN(created_at) AS created_at, COUNT(DISTINCT user_id) AS user_count
			FROM workspace_access
			WHERE user_id = $1
			GROUP BY workspace_path
			ORDER BY MIN(created_at) DESC
		`, uid)
	}
	if err != nil {
		log.Printf("workspaces list: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	defer rows.Close()

	out := make([]workspaceDTO, 0)
	for rows.Next() {
		var (
			path      string
			createdAt time.Time
			userCount int
		)
		if err := rows.Scan(&path, &createdAt, &userCount); err != nil {
			log.Printf("workspaces scan: %v", err)
			continue
		}
		out = append(out, workspaceDTO{
			Path:      path,
			Name:      pathName(path),
			CreatedAt: createdAt.Format(time.RFC3339),
			UserCount: userCount,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func (h *WorkspacesHandler) Create(c *gin.Context) {
	threadsH := &ThreadsHandler{DB: h.DB}
	uid, isAdmin, ok := threadsH.bootstrapUser(c)
	if !ok || !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
		return
	}
	var req createWorkspaceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.Path = strings.TrimSpace(req.Path)
	if !strings.HasPrefix(req.Path, "/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "workspace path must be absolute"})
		return
	}
	if req.Path == "" || strings.Contains(req.Path, "..") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid path"})
		return
	}

	// Insert a sentinel workspace_access row so the workspace shows
	// up in lists. We grant access to the admin who created it.
	_, err := h.DB.Exec(c, `
		INSERT INTO workspace_access (user_id, workspace_path, can_read, can_write, granted_by)
		VALUES ($1, $2, TRUE, TRUE, $1)
		ON CONFLICT (user_id, workspace_path) DO NOTHING
	`, uid, req.Path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create workspace"})
		return
	}
	c.JSON(http.StatusCreated, workspaceDTO{
		Path:      req.Path,
		Name:      pathName(req.Path),
		CreatedBy: uid.String(),
		CreatedAt: time.Now().Format(time.RFC3339),
	})
}

func (h *WorkspacesHandler) GrantAccess(c *gin.Context) {
	threadsH := &ThreadsHandler{DB: h.DB}
	uid, isAdmin, ok := threadsH.bootstrapUser(c)
	if !ok || !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
		return
	}
	workspacePath := strings.TrimSpace(c.Query("path"))
	if !strings.HasPrefix(workspacePath, "/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing or invalid ?path="})
		return
	}

	var req grantAccessReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	targetUser, err := uuid.Parse(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	_, err = h.DB.Exec(c, `
		INSERT INTO workspace_access (user_id, workspace_path, can_read, can_write, granted_by)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id, workspace_path)
		DO UPDATE SET can_read = EXCLUDED.can_read, can_write = EXCLUDED.can_write
	`, targetUser, workspacePath, req.CanRead, req.CanWrite, uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *WorkspacesHandler) RevokeAccess(c *gin.Context) {
	threadsH := &ThreadsHandler{DB: h.DB}
	_, isAdmin, ok := threadsH.bootstrapUser(c)
	if !ok || !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
		return
	}
	workspacePath := strings.TrimSpace(c.Query("path"))
	userID := c.Query("userId")
	if !strings.HasPrefix(workspacePath, "/") || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing ?path= or ?userId="})
		return
	}
	targetUser, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	_, err = h.DB.Exec(c, `
		DELETE FROM workspace_access WHERE user_id = $1 AND workspace_path = $2
	`, targetUser, workspacePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *WorkspacesHandler) ListAccess(c *gin.Context) {
	workspacePath := strings.TrimSpace(c.Query("path"))
	if workspacePath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing ?path="})
		return
	}
	rows, err := h.DB.Query(c, `
		SELECT u.id, u.email, u.name, wa.can_read, wa.can_write, wa.granted_by, wa.created_at
		FROM workspace_access wa
		JOIN users u ON u.id = wa.user_id
		WHERE wa.workspace_path = $1
		ORDER BY wa.created_at ASC
	`, workspacePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	defer rows.Close()

	type accessDTO struct {
		UserID    string  `json:"user_id"`
		Email     string  `json:"email"`
		Name      string  `json:"name"`
		CanRead   bool    `json:"can_read"`
		CanWrite  bool    `json:"can_write"`
		GrantedBy *string `json:"granted_by,omitempty"`
		CreatedAt string  `json:"created_at"`
	}
	out := make([]accessDTO, 0)
	for rows.Next() {
		var a accessDTO
		var grantedBy *string
		var createdAt time.Time
		if err := rows.Scan(&a.UserID, &a.Email, &a.Name, &a.CanRead, &a.CanWrite, &grantedBy, &createdAt); err != nil {
			continue
		}
		a.GrantedBy = grantedBy
		a.CreatedAt = createdAt.Format(time.RFC3339)
		out = append(out, a)
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func pathName(p string) string {
	p = strings.TrimRight(p, "/")
	idx := strings.LastIndex(p, "/")
	if idx < 0 {
		return p
	}
	return p[idx+1:]
}
