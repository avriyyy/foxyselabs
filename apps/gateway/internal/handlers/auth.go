package handlers

import (
	"context"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/foxyselabs/gateway/internal/auth"
	"github.com/foxyselabs/gateway/internal/middleware"
)

type AuthHandler struct {
	DB  *pgxpool.Pool
	AM  *auth.Manager
	TTL int // hours for access token
}

type registerReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResp struct {
	User        userDTO `json:"user"`
	AccessToken string  `json:"access_token"`
	ExpiresAt   int64   `json:"expires_at"`
}

type userDTO struct {
	ID              string `json:"id"`
	Email           string `json:"email"`
	Name            string `json:"name"`
	Role            string `json:"role"`
	DefaultProvider string `json:"default_provider"`
	DefaultModel    string `json:"default_model"`
	HasOpenAI       bool   `json:"has_openai_key"`
	HasAnthropic    bool   `json:"has_anthropic_key"`
}

var emailRe = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Name = strings.TrimSpace(req.Name)
	if !emailRe.MatchString(req.Email) {
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

	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	id := uuid.New()
	now := time.Now()
	_, err = h.DB.Exec(c, `
		INSERT INTO users (id, email, password_hash, name, role, default_provider, default_model, created_at, updated_at)
		VALUES ($1, $2, $3, $4, 'user', 'openai', 'gpt-4o-mini', $5, $5)
	`, id, req.Email, hash, req.Name, now)
	if err != nil {
		if strings.Contains(err.Error(), "users_email_key") {
			c.JSON(http.StatusConflict, gin.H{"error": "email already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user"})
		return
	}

	tokens, err := h.AM.Issue(id, req.Email, "user")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue token"})
		return
	}

	c.JSON(http.StatusCreated, authResp{
		User: userDTO{
			ID:              id.String(),
			Email:           req.Email,
			Name:            req.Name,
			Role:            "user",
			DefaultProvider: "openai",
			DefaultModel:    "gpt-4o-mini",
		},
		AccessToken: tokens.AccessToken,
		ExpiresAt:   tokens.ExpiresAt.Unix(),
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	var (
		id          uuid.UUID
		hash, name  string
		role        string
		provider    string
		model       string
		hasOpenAI   bool
		hasAnthro   bool
	)
	err := h.DB.QueryRow(c, `
		SELECT id, password_hash, name, role, default_provider, default_model,
		       openai_api_key_encrypted IS NOT NULL,
		       anthropic_api_key_encrypted IS NOT NULL
		FROM users WHERE email = $1
	`, req.Email).Scan(&id, &hash, &name, &role, &provider, &model, &hasOpenAI, &hasAnthro)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	if !auth.CheckPassword(hash, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	tokens, err := h.AM.Issue(id, req.Email, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue token"})
		return
	}

	c.JSON(http.StatusOK, authResp{
		User: userDTO{
			ID:              id.String(),
			Email:           req.Email,
			Name:            name,
			Role:            role,
			DefaultProvider: provider,
			DefaultModel:    model,
			HasOpenAI:       hasOpenAI,
			HasAnthropic:    hasAnthro,
		},
		AccessToken: tokens.AccessToken,
		ExpiresAt:   tokens.ExpiresAt.Unix(),
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	uid, ok := middleware.UserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	var (
		email, name, role, provider, model string
		hasOpenAI, hasAnthro               bool
	)
	err := h.DB.QueryRow(context.Background(), `
		SELECT email, name, role, default_provider, default_model,
		       openai_api_key_encrypted IS NOT NULL,
		       anthropic_api_key_encrypted IS NOT NULL
		FROM users WHERE id = $1
	`, uid).Scan(&email, &name, &role, &provider, &model, &hasOpenAI, &hasAnthro)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	c.JSON(http.StatusOK, userDTO{
		ID:              uid.String(),
		Email:           email,
		Name:            name,
		Role:            role,
		DefaultProvider: provider,
		DefaultModel:    model,
		HasOpenAI:       hasOpenAI,
		HasAnthropic:    hasAnthro,
	})
}
