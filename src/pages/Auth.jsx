import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Logo from "../components/Logo"

export default function AuthPage() {
  const { user } = useAuth()
  if (user) return <Navigate to="/chat" replace />
  return (
    <main className="flex-grow pt-24 md:pt-32 pb-24 flex items-center justify-center px-4">
      <AuthForm />
    </main>
  )
}

function AuthForm() {
  const [tab, setTab] = useState("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [focused, setFocused] = useState("")
  const { login, register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    let ok
    if (tab === "login") ok = await login(email, password)
    else ok = await register(name, email, password)
    if (ok) navigate("/chat", { replace: true })
  }

  function switchTab(t) {
    setTab(t)
    clearError()
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Logo size={28} />
        <span className="font-display-md text-[1.15rem] tracking-tighter">
          <span className="text-on-surface">Foxyse</span><span className="text-pink-neon">Labs</span><span className="text-on-surface">.</span>
        </span>
      </div>

      <div className="stitch-node-glass rounded-none p-px">
        <div className="bg-surface-container-lowest p-6 md:p-8">
          <div className="flex border-b border-white/5 mb-6">
            <button
              onClick={() => switchTab("login")}
              className={`flex-1 pb-3 text-[0.7rem] font-label-mono uppercase tracking-widest transition-all duration-300 border-b-2 ${
                tab === "login" ? "border-pink-neon text-pink-neon" : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`flex-1 pb-3 text-[0.7rem] font-label-mono uppercase tracking-widest transition-all duration-300 border-b-2 ${
                tab === "register" ? "border-pink-neon text-pink-neon" : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === "register" && (
              <InputGroup label="Name" autoComplete="name">
                <InputField value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" autoComplete="name" focused={focused} field="name" setFocused={setFocused} />
              </InputGroup>
            )}

            <InputGroup label="Email">
              <InputField value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" focused={focused} field="email" setFocused={setFocused} />
            </InputGroup>

            <InputGroup label="Password">
              <InputField value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" autoComplete={tab === "login" ? "current-password" : "new-password"} focused={focused} field="password" setFocused={setFocused} />
            </InputGroup>

            {error && (
              <p className="text-error text-[0.7rem] font-label-mono tracking-wider">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-filled w-full py-3 rounded-DEFAULT font-label-mono uppercase tracking-widest text-[0.7rem] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                  {tab === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : tab === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-text-subtle text-[0.65rem] font-body-sm mt-6 text-center">
            {tab === "login" ? (
              <>Don&apos;t have an account? <button onClick={() => switchTab("register")} className="text-pink-neon hover:underline transition-all">Register</button></>
            ) : (
              <>Already have an account? <button onClick={() => switchTab("login")} className="text-pink-neon hover:underline transition-all">Sign In</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function InputGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-on-surface-variant text-[0.6rem] font-label-mono uppercase tracking-widest ml-0.5">{label}</label>
      {children}
    </div>
  )
}

function InputField({ value, onChange, placeholder, type = "text", autoComplete, focused, field, setFocused }) {
  const isFocused = focused === field
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(field)}
      onBlur={() => setFocused("")}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required
      className={`w-full bg-surface border px-3 py-2.5 rounded-DEFAULT font-body-sm text-on-surface placeholder:text-text-muted outline-none transition-all duration-300 text-[0.8rem] ${
        isFocused ? "border-pink-neon shadow-[0_0_12px_rgba(255,0,127,0.15)]" : "border-white/10 hover:border-white/20"
      }`}
    />
  )
}
