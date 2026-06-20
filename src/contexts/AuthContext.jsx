import { createContext, useContext, useState, useEffect, useCallback } from "react"

const AuthContext = createContext(null)

function getUsers() {
  try { return JSON.parse(localStorage.getItem("foxy_users") || "[]") }
  catch { return [] }
}

function saveUsers(users) { localStorage.setItem("foxy_users", JSON.stringify(users)) }

function getSession() {
  try { return JSON.parse(localStorage.getItem("foxy_session")) }
  catch { return null }
}

function setSession(user) { localStorage.setItem("foxy_session", JSON.stringify(user)) }
function clearSession() { localStorage.removeItem("foxy_session") }

export function AuthProvider({ children }) {
  const [user, _setUser] = useState(() => getSession())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError("")
    await new Promise((r) => setTimeout(r, 600))
    const users = getUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) { setError("Invalid email or password"); setLoading(false); return false }
    const session = { email: found.email, name: found.name }
    setSession(session)
    _setUser(session)
    setLoading(false)
    return true
  }, [])

  const register = useCallback(async (name, email, password) => {
    setLoading(true)
    setError("")
    await new Promise((r) => setTimeout(r, 800))
    const users = getUsers()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setError("Please enter a valid email address"); setLoading(false); return false }
    if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return false }
    if (password.length > 128) { setError("Password exceeds 128 characters"); setLoading(false); return false }
    if (name.trim().length < 2) { setError("Name must be at least 2 characters"); setLoading(false); return false }
    if (users.find((u) => u.email === email)) { setError("Email already registered"); setLoading(false); return false }

    const newUser = { name: name.trim(), email: email.trim().toLowerCase(), password }
    users.push(newUser)
    saveUsers(users)
    const session = { email: newUser.email, name: newUser.name }
    setSession(session)
    _setUser(session)
    setLoading(false)
    return true
  }, [])

  const logout = useCallback(() => {
    clearSession()
    _setUser(null)
  }, [])

  const clearError = useCallback(() => setError(""), [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
