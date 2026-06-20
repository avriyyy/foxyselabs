import { useEffect, useRef, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAuth } from "../contexts/AuthContext"
import PricingSection from "../components/PricingSection"
import Logo from "../components/Logo"

function Icons() {
  return {
    Bot: (p) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <path d="M12 8V4H8" /><rect x="4" y="9" width="16" height="12" rx="2" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M8 8v4" /><path d="M12 16v.01" /><path d="M12 8h4" /><path d="M16 8v4" />
      </svg>
    ),
    Zap: (p) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    Brain: (p) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.967-.516" /><path d="M19.967 17.484A4 4 0 0 1 18 18" />
      </svg>
    ),
    Workflow: (p) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <rect x="3" y="6" width="18" height="12" rx="2" /><path d="M12 6v12" /><path d="M3 12h18" />
      </svg>
    ),
    Lock: (p) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    Scale: (p) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  }
}

const { Bot, Zap, Brain, Workflow, Lock, Scale } = Icons()

const AGENTS = [
  { icon: Bot, label: "Uniswap", color: "#FF007F" },
  { icon: Zap, label: "PancakeSwap", color: "#FF007F" },
  { icon: Brain, label: "Raydium", color: "#FF007F" },
  { icon: Workflow, label: "Orca", color: "#FF007F" },
  { icon: Scale, label: "Trader Joe", color: "#FF007F" },
  { icon: Lock, label: "QuickSwap", color: "#FF007F" },
  { icon: Bot, label: "Curve", color: "#FF007F" },
  { icon: Zap, label: "Balancer", color: "#FF007F" },
]

function MarqueeItem({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 md:gap-3 mr-8 md:mr-12 shrink-0 text-on-surface-variant/60">
      <Icon className="w-4 h-4 md:w-5 md:h-5 text-pink-neon/40" />
      <span className="font-mono text-[0.7rem] md:text-body-sm">{label}</span>
      <span className="text-pink-neon/20 ml-6 md:ml-10">◆</span>
    </span>
  )
}

function GlitchText({ children, className = "" }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span aria-hidden className="absolute inset-0 z-0 text-pink-neon/30 blur-[2px] animate-pulse select-none">{children}</span>
    </span>
  )
}

function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`stitch-node-glass rounded-none p-5 md:p-7 group cursor-default transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-DEFAULT bg-pink-neon/10 flex items-center justify-center mb-4 group-hover:bg-pink-neon/20 transition-colors duration-500">
        <Icon className="w-5 h-5 md:w-6 md:h-6 text-pink-neon" />
      </div>
      <h3 className="text-on-surface text-[0.9rem] md:text-body-md font-semibold mb-2 font-display-md">{title}</h3>
      <p className="text-on-surface-variant text-[0.75rem] md:text-body-sm leading-relaxed">{desc}</p>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const { user } = useAuth()

  useEffect(() => {
    if (isConnected) navigate("/dashboard", { replace: true })
  }, [isConnected, navigate])

  return (
    <main className="flex-grow pt-24 md:pt-32 pb-24">
      {/* Hero */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-16 md:mb-24 lg:mb-32">
        <div className="flex flex-col items-center gap-6 md:gap-8 lg:gap-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-pink-neon/20 bg-pink-neon/5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="font-label-mono text-[0.55rem] md:text-[0.6rem] text-pink-neon uppercase tracking-widest">
              Agentic Intelligence Platform
            </span>
          </div>

          <h1 className="text-[1.8rem] md:text-display-lg text-on-surface font-bold leading-tight tracking-tight">
            Deploy AI agents.<br />
            <GlitchText>Scale your business.</GlitchText>
          </h1>

          <p className="text-[0.8rem] md:text-body-md text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            The first Agentic-as-a-Service platform. Build, deploy, and orchestrate autonomous AI agents that handle customer support, automate workflows, and analyze data — all without writing a single line of infrastructure code.
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 items-center justify-center">
            {user ? (
              <button
                onClick={() => navigate("/chat")}
                className="btn-primary-filled px-6 md:px-8 py-3 md:py-4 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[0.7rem] md:text-label-mono flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Open Chat
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="btn-primary-filled px-6 md:px-8 py-3 md:py-4 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[0.7rem] md:text-label-mono"
                >
                  Get Started Free
                </button>
                <a href="#features" className="text-on-surface-variant hover:text-pink-neon transition-colors duration-300 font-label-mono uppercase tracking-wider px-3 md:px-4 py-3 md:py-4 flex items-center gap-1.5 md:gap-2 text-[0.7rem] md:text-label-mono">
                  Explore Features
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="w-full overflow-hidden py-5 md:py-7 mb-16 md:mb-24 lg:mb-32 border-t border-b border-white/5 bg-black/10">
        <div className="marquee-track font-mono whitespace-nowrap">
          {AGENTS.map((a, i) => <MarqueeItem key={i} {...a} />)}
          {AGENTS.map((a, i) => <MarqueeItem key={`dup-${i}`} {...a} />)}
        </div>
        <style>{`@keyframes mar{0%{transform:translateX(0)}to{transform:translateX(-50%)}}.marquee-track{animation:mar 50s linear infinite;display:inline-flex;align-items:center;white-space:nowrap;will-change:transform}`}</style>
      </section>

      {/* Features */}
      <section id="features" className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-16 md:mb-24 lg:mb-32">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-[1.3rem] md:text-display-md text-on-surface font-bold mb-3">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-pink-neon">automate.</span>
          </h2>
          <p className="text-[0.75rem] md:text-body-sm text-on-surface-variant max-w-lg mx-auto">
            Deploy specialized AI agents for any business function. No ML expertise required.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <FeatureCard icon={Bot} title="AI Chatbot" desc="Intelligent conversational agents that handle customer inquiries 24/7. Natural language understanding with context awareness built-in." delay={0} />
          <FeatureCard icon={Brain} title="Smart Analytics" desc="Agents that continuously analyze your data streams, detect anomalies, and surface actionable insights before you even ask." delay={150} />
          <FeatureCard icon={Zap} title="Workflow Automation" desc="Orchestrate complex business processes with autonomous agents that trigger actions, send notifications, and integrate across your stack." delay={300} />
          <FeatureCard icon={Lock} title="Enterprise Security" desc="End-to-end encryption, SOC 2 compliant infrastructure, and fine-grained access controls. Your data stays yours." delay={100} />
          <FeatureCard icon={Scale} title="Auto-Scale" desc="Agents automatically scale based on demand. From 10 conversations to 10 million, the infrastructure adapts seamlessly." delay={250} />
          <FeatureCard icon={Workflow} title="Custom Integrations" desc="Connect agents to your existing tools — Slack, Discord, email, CRMs, databases, and custom APIs with our SDK." delay={400} />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-16 md:mb-24 lg:mb-32">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-[1.3rem] md:text-display-md text-on-surface font-bold mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-pink-neon">Agentic</span> in three steps.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { step: "01", title: "Connect", desc: "Link your data sources and tools. Our agents understand your business context out of the box." },
            { step: "02", title: "Configure", desc: "Define agent behavior, goals, and constraints through natural language — no code needed." },
            { step: "03", title: "Deploy", desc: "Your agent goes live instantly. Monitor performance, iterate, and scale from the dashboard." },
          ].map((s, i) => (
            <div key={s.step} className="stitch-node-glass rounded-none p-5 md:p-7 relative overflow-hidden group">
              <span className="absolute -top-4 -right-4 text-[5rem] md:text-[7rem] font-display-md font-bold text-white/[0.02] select-none leading-none group-hover:text-pink-neon/5 transition-colors duration-700">{s.step}</span>
              <h3 className="text-on-surface text-[0.9rem] md:text-body-md font-semibold mb-2 relative z-10 font-display-md">{s.title}</h3>
              <p className="text-on-surface-variant text-[0.75rem] md:text-body-sm leading-relaxed relative z-10">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-16 md:mb-24 lg:mb-32">
        <div className="stitch-node-glass rounded-none p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-neon/5 via-transparent to-primary-container/5" />
          <div className="relative z-10 flex flex-col items-center gap-4 md:gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Logo size={36} />
            </div>
            <h2 className="text-[1.3rem] md:text-display-md text-on-surface font-bold">
              Ready to deploy your first agent?
            </h2>
            <p className="text-[0.8rem] md:text-body-sm text-on-surface-variant max-w-md mx-auto">
              Start with our free tier. No credit card required. Upgrade when you're ready to scale.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {user ? (
                <button onClick={() => navigate("/chat")} className="btn-primary-filled px-8 py-3.5 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[0.7rem]">
                  Go to Chat
                </button>
              ) : (
                <button onClick={() => navigate("/auth")} className="btn-primary-filled px-8 py-3.5 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[0.7rem]">
                  Create Free Account
                </button>
              )}
              <a href="#features" className="btn-cyber-pink px-8 py-3.5 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[0.7rem]">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />
    </main>
  )
}
