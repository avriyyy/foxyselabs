package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	GatewayPort      string
	PublicBaseURL    string
	AgentServiceURL  string
	DatabaseURL      string
	RedisURL         string
	JWTSecret        string
	EncryptionKey    string
	AccessTokenTTL   int // hours
	RefreshTokenTTL  int // days
	CookieDomain     string
	CookieSecure     bool
}

func Load() (*Config, error) {
	v := viper.New()
	v.SetEnvPrefix("FOX")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	v.SetDefault("GATEWAY_PORT", "8080")
	v.SetDefault("PUBLIC_BASE_URL", "http://localhost:3000")
	v.SetDefault("AGENT_SERVICE_URL", "http://agent:8000")
	v.SetDefault("ACCESS_TOKEN_TTL", 24)    // hours
	v.SetDefault("REFRESH_TOKEN_TTL", 30)   // days
	v.SetDefault("COOKIE_DOMAIN", "")
	v.SetDefault("COOKIE_SECURE", false)

	// Required
	v.BindEnv("DATABASE_URL", "DATABASE_URL")
	v.BindEnv("REDIS_URL", "REDIS_URL")
	v.BindEnv("JWT_SECRET", "JWT_SECRET")
	v.BindEnv("ENCRYPTION_KEY", "ENCRYPTION_KEY")

	cfg := &Config{
		GatewayPort:     v.GetString("GATEWAY_PORT"),
		PublicBaseURL:   v.GetString("PUBLIC_BASE_URL"),
		AgentServiceURL: v.GetString("AGENT_SERVICE_URL"),
		DatabaseURL:     v.GetString("DATABASE_URL"),
		RedisURL:        v.GetString("REDIS_URL"),
		JWTSecret:       v.GetString("JWT_SECRET"),
		EncryptionKey:   v.GetString("ENCRYPTION_KEY"),
		AccessTokenTTL:  v.GetInt("ACCESS_TOKEN_TTL"),
		RefreshTokenTTL: v.GetInt("REFRESH_TOKEN_TTL"),
		CookieDomain:    v.GetString("COOKIE_DOMAIN"),
		CookieSecure:    v.GetBool("COOKIE_SECURE"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.RedisURL == "" {
		return nil, fmt.Errorf("REDIS_URL is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	if len(cfg.JWTSecret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET must be at least 32 bytes")
	}
	if cfg.EncryptionKey == "" {
		return nil, fmt.Errorf("ENCRYPTION_KEY is required")
	}

	return cfg, nil
}
