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

	"github.com/foxyselabs/gateway/internal/cache"
	"github.com/foxyselabs/gateway/internal/config"
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
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsCfg))
	r.Use(middleware.RateLimit(red.Client, 240))

	// Public
	r.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })
	r.GET("/readyz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })

	// Public setup + bootstrap me
	adminH := &handlers.AdminHandler{DB: database.Pool}
	api := r.Group("/api")
	api.POST("/admin/setup", adminH.Setup)
	api.GET("/admin/me", adminH.Me)

	// Threads, messages, chat, admin — all use bootstrap user (single-owner mode)
	threadsH := &handlers.ThreadsHandler{DB: database.Pool}
	api.GET("/threads", threadsH.List)
	api.POST("/threads", threadsH.Create)
	api.GET("/threads/:id", threadsH.Get)
	api.DELETE("/threads/:id", threadsH.Delete)

	chatH := &handlers.ChatHandler{DB: database.Pool, AgentServiceURL: cfg.AgentServiceURL}
	api.POST("/chat/stream", chatH.Stream)

	// Admin user management (callable by anyone in single-owner mode;
	// the only user IS admin, so there's no privilege check needed yet)
	api.GET("/admin/users", adminH.ListUsers)
	api.POST("/admin/users", adminH.CreateUser)
	api.POST("/admin/grant", adminH.GrantWorkspace)

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
