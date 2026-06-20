package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/foxyselabs/gateway/internal/auth"
	"github.com/foxyselabs/gateway/internal/cache"
	"github.com/foxyselabs/gateway/internal/config"
	"github.com/foxyselabs/gateway/internal/crypto"
	"github.com/foxyselabs/gateway/internal/db"
	"github.com/foxyselabs/gateway/internal/handlers"
	"github.com/foxyselabs/gateway/internal/middleware"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	rootCtx, cancel := context.WithCancel(context.Background())
	defer cancel()

	database, err := db.New(rootCtx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer database.Close()
	log.Println("db connected")

	red, err := cache.New(rootCtx, cfg.RedisURL)
	if err != nil {
		log.Fatalf("redis: %v", err)
	}
	defer red.Close()
	log.Println("redis connected")

	cipher, err := crypto.New(cfg.EncryptionKey)
	if err != nil {
		log.Fatalf("crypto: %v", err)
	}

	am := auth.New(cfg.JWTSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL)
	_ = cipher // used in later sprints for BYOK API key encryption

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(gin.LoggerWithFormatter(func(p gin.LogFormatterParams) string {
		return p.TimeStamp.Format(time.RFC3339) + " " + p.Method + " " + p.Path +
			" " + p.ClientIP + " " + p.ErrorMessage + "\n"
	}))

	corsCfg := cors.Config{
		AllowOrigins:     []string{cfg.PublicBaseURL, "http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsCfg))
	r.Use(middleware.RateLimit(red.Client, 120))

	// Public
	r.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })
	r.GET("/readyz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })

	authH := &handlers.AuthHandler{DB: database.Pool, AM: am}
	api := r.Group("/api")
	api.POST("/auth/register", authH.Register)
	api.POST("/auth/login", authH.Login)

	// Protected
	authed := api.Group("")
	authed.Use(middleware.RequireAuth(am))

	authed.GET("/auth/me", authH.Me)
	authed.POST("/auth/logout", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })

	threadsH := &handlers.ThreadsHandler{DB: database.Pool}
	authed.GET("/threads", threadsH.List)
	authed.POST("/threads", threadsH.Create)
	authed.GET("/threads/:id", threadsH.Get)
	authed.DELETE("/threads/:id", threadsH.Delete)

	chatH := &handlers.ChatHandler{DB: database.Pool, AgentServiceURL: cfg.AgentServiceURL}
	authed.POST("/chat/stream", chatH.Stream)

	// Run
	srv := &http.Server{
		Addr:              ":" + cfg.GatewayPort,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("gateway listening on :%s (agent=%s)", cfg.GatewayPort, cfg.AgentServiceURL)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	log.Println("shutting down...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	_ = srv.Shutdown(shutdownCtx)
}
