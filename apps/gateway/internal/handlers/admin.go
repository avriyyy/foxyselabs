package handlers

import (
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type AdminHandler struct {
	DB *pgxpool.Pool
}

type userDTO struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	IsAdmin   bool   `json:"is_admin"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
}

type setupReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

// Setup: idempotent endpoint that creates the first admin user if the
// users table is empty. This is what the web hits on first load.
func (h *AdminHandler) Setup(c *gin.Context) {
	var count int
	if err := h.DB.QueryRow(c, `SELECT COUNT(*) FROM users`).Scan(&count); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "already_initialized",
			"message": "admin user already exists",
		})
		return
	}

	var req setupReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Name = strings.TrimSpace(req.Name)
	if !validEmail(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email"})
		return
	}
	if len(req.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 8 characters"})
		return
	}
	if len(req.Name) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name must be at least 2 characters"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	id := uuid.New()
	now := time.Now()
	_, err = h.DB.Exec(c, `
		INSERT INTO users (id, email, password_hash, name, role, is_admin, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, 'admin', TRUE, TRUE, $5, $5)
	`, id, req.Email, string(hash), req.Name, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create admin"})
		return
	}

	// Bootstrap: give admin access to /data/workspaces/admin/
	_, _ = h.DB.Exec(c, `
		INSERT INTO workspace_access (user_id, workspace_path, can_read, can_write, granted_by)
		VALUES ($1, '/data/workspaces/admin', TRUE, TRUE, $1)
		ON CONFLICT DO NOTHING
	`, id)

	c.JSON(http.StatusCreated, userDTO{
		ID:        id.String(),
		Email:     req.Email,
		Name:      req.Name,
		IsAdmin:   true,
		IsActive:  true,
		CreatedAt: now.Format(time.RFC3339),
	})
}

// Me: returns info about the bootstrap user (the only user in single-owner mode).
func (h *AdminHandler) Me(c *gin.Context) {
	var (
		id, email, name string
		isAdmin, active bool
		createdAt       time.Time
	)
	err := h.DB.QueryRow(c, `
		SELECT id, email, name, is_admin, is_active, created_at FROM users
		ORDER BY created_at ASC LIMIT 1
	`).Scan(&id, &email, &name, &isAdmin, &active, &createdAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"needs_setup": true})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	c.JSON(http.StatusOK, userDTO{
		ID:        id,
		Email:     email,
		Name:      name,
		IsAdmin:   isAdmin,
		IsActive:  active,
		CreatedAt: createdAt.Format(time.RFC3339),
	})
}

type createUserReq struct {
	Email         string   `json:"email"`
	Password      string   `json:"password"`
	Name          string   `json:"name"`
	IsAdmin       bool     `json:"is_admin"`
	Workspaces    []string `json:"workspaces"`
}

func (h *AdminHandler) CreateUser(c *gin.Context) {
	var req createUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Name = strings.TrimSpace(req.Name)
	if !validEmail(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email"})
		return
	}
	if len(req.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password too short"})
		return
	}
	if len(req.Name) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name too short"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	id := uuid.New()
	now := time.Now()
	_, err = h.DB.Exec(c, `
		INSERT INTO users (id, email, password_hash, name, role, is_admin, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $7)
	`, id, req.Email, string(hash), req.Name, roleString(req.IsAdmin), req.IsAdmin, now)
	if err != nil {
		if strings.Contains(err.Error(), "users_email_key") {
			c.JSON(http.StatusConflict, gin.H{"error": "email already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	// Grant workspace access
	for _, ws := range req.Workspaces {
		_, _ = h.DB.Exec(c, `
			INSERT INTO workspace_access (user_id, workspace_path, can_read, can_write, granted_by)
			VALUES ($1, $2, TRUE, TRUE, NULL)
			ON CONFLICT DO NOTHING
		`, id, ws)
	}

	c.JSON(http.StatusCreated, userDTO{
		ID:        id.String(),
		Email:     req.Email,
		Name:      req.Name,
		IsAdmin:   req.IsAdmin,
		IsActive:  true,
		CreatedAt: now.Format(time.RFC3339),
	})
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	rows, err := h.DB.Query(c, `SELECT id, email, name, is_admin, is_active, created_at FROM users ORDER BY created_at ASC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	defer rows.Close()
	out := make([]userDTO, 0)
	for rows.Next() {
		var u userDTO
		var createdAt time.Time
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.IsAdmin, &u.IsActive, &createdAt); err != nil {
			continue
		}
		u.CreatedAt = createdAt.Format(time.RFC3339)
		out = append(out, u)
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func (h *AdminHandler) GrantWorkspace(c *gin.Context) {
	type grantReq struct {
		UserID         string `json:"user_id"`
		WorkspacePath  string `json:"workspace_path"`
		CanRead        bool   `json:"can_read"`
		CanWrite       bool   `json:"can_write"`
	}
	var req grantReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	uid, err := uuid.Parse(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	_, err = h.DB.Exec(c, `
		INSERT INTO workspace_access (user_id, workspace_path, can_read, can_write, granted_by)
		VALUES ($1, $2, $3, $4, NULL)
		ON CONFLICT (user_id, workspace_path)
		DO UPDATE SET can_read = EXCLUDED.can_read, can_write = EXCLUDED.can_write
	`, uid, req.WorkspacePath, req.CanRead, req.CanWrite)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func validEmail(e string) bool {
	return regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`).MatchString(e)
}

func roleString(isAdmin bool) string {
	if isAdmin {
		return "admin"
	}
	return "user"
}
