package middleware

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"golang.org/x/net/context"
)

func RateLimit(rdb *redis.Client, requestsPerMinute int) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()
		key := "rl:" + c.ClientIP() + ":" + strconv.FormatInt(time.Now().Unix()/60, 10)
		count, err := rdb.Incr(ctx, key).Result()
		if err == nil && count == 1 {
			rdb.Expire(ctx, key, 65*time.Second)
		}
		if err == nil && count > int64(requestsPerMinute) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
			return
		}
		c.Next()
	}
}
