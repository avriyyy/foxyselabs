package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	UserID uuid.UUID `json:"uid"`
	Email  string    `json:"email"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

type Tokens struct {
	AccessToken  string
	RefreshToken string
	ExpiresAt    time.Time
}

type Manager struct {
	secret []byte
	accessTTL  time.Duration
	refreshTTL time.Duration
}

func New(secret string, accessHours, refreshDays int) *Manager {
	return &Manager{
		secret:     []byte(secret),
		accessTTL:  time.Duration(accessHours) * time.Hour,
		refreshTTL: time.Duration(refreshDays) * 24 * time.Hour,
	}
}

func (m *Manager) Issue(userID uuid.UUID, email, role string) (*Tokens, error) {
	now := time.Now()
	accessExp := now.Add(m.accessTTL)

	accessClaims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(accessExp),
			ID:        uuid.NewString(),
		},
	}
	access, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString(m.secret)
	if err != nil {
		return nil, err
	}

	refresh, err := m.issueRefresh(userID)
	if err != nil {
		return nil, err
	}

	return &Tokens{
		AccessToken:  access,
		RefreshToken: refresh,
		ExpiresAt:    accessExp,
	}, nil
}

func (m *Manager) issueRefresh(userID uuid.UUID) (string, error) {
	claims := refreshClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.refreshTTL)),
			ID:        uuid.NewString(),
		},
		Type: "refresh",
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(m.secret)
}

type refreshClaims struct {
	Type string `json:"typ"`
	jwt.RegisteredClaims
}

func (m *Manager) Parse(tokenStr string) (*Claims, error) {
	tok, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return m.secret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := tok.Claims.(*Claims)
	if !ok || !tok.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

func (m *Manager) ParseRefresh(tokenStr string) (uuid.UUID, error) {
	tok, err := jwt.ParseWithClaims(tokenStr, &refreshClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return m.secret, nil
	})
	if err != nil {
		return uuid.Nil, err
	}
	claims, ok := tok.Claims.(*refreshClaims)
	if !ok || !tok.Valid || claims.Type != "refresh" {
		return uuid.Nil, errors.New("invalid refresh token")
	}
	id, err := uuid.Parse(claims.Subject)
	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}
