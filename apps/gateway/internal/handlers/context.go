package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// currentUser: returns the (uid, isAdmin, ok) for the current request.
//
// Self-hosted single-owner mode: we look up the first user in the DB
// (created during initial setup). No JWT/session required.
//
// Per-user auth will be added later (Sprint 2+) — for now, the web
// is open and every request is treated as the owner/admin.
func currentUser(c *gin.Context) (uuid.UUID, bool, bool) {
	v, ok := c.Get(CtxUserID)
	if !ok {
		return uuid.Nil, false, false
	}
	uid, _ := v.(uuid.UUID)
	isAdmin, _ := c.Get(CtxIsAdmin)
	admin, _ := isAdmin.(bool)
	return uid, admin, true
}

const (
	CtxUserID   = "userID"
	CtxIsAdmin  = "isAdmin"
	CtxUserName = "userName"
	CtxUserMail = "userMail"
)
