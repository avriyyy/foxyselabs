package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	GatewayPort     string
	PublicBaseURL   string
	AgentServiceURL string
	DatabaseURL     string
	RedisURL        string
	// Auto-provisioned admin user on first start. For self-hosted single-owner.
	AdminEmail    string
	AdminName     string
	AdminPassword string
}

func Load() (*Config, error) {
	v := viper.New()
	v.SetEnvPrefix("FOX")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	v.SetDefault("GATEWAY_PORT", "8080")
	v.SetDefault("PUBLIC_BASE_URL", "http://localhost:3000")
	v.SetDefault("AGENT_SERVICE_URL", "http://agent:8000")
	v.SetDefault("ADMIN_EMAIL", "admin@localhost")
	v.SetDefault("ADMIN_NAME", "Admin")
	// 32+ char default for dev only. In production set FOX_ADMIN_PASSWORD.
	v.SetDefault("ADMIN_PASSWORD", "changeme-on-first-login-please")

	v.BindEnv("DATABASE_URL", "DATABASE_URL")
	v.BindEnv("REDIS_URL", "REDIS_URL")
	v.BindEnv("ADMIN_PASSWORD", "ADMIN_PASSWORD")

	cfg := &Config{
		GatewayPort:     v.GetString("GATEWAY_PORT"),
		PublicBaseURL:   v.GetString("PUBLIC_BASE_URL"),
		AgentServiceURL: v.GetString("AGENT_SERVICE_URL"),
		DatabaseURL:     v.GetString("DATABASE_URL"),
		RedisURL:        v.GetString("REDIS_URL"),
		AdminEmail:      v.GetString("ADMIN_EMAIL"),
		AdminName:       v.GetString("ADMIN_NAME"),
		AdminPassword:   v.GetString("ADMIN_PASSWORD"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.RedisURL == "" {
		return nil, fmt.Errorf("REDIS_URL is required")
	}
	return cfg, nil
}
