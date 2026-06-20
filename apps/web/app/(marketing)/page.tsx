import Link from "next/link";
import {
  IconArrowRight,
  IconBolt,
  IconBrain,
  IconChat,
  IconLock,
  IconLogo,
  IconScale,
  IconWorkflow,
} from "@/components/Icons";
import { PricingSection } from "@/components/marketing/PricingSection";

const FEATURES = [
  {
    icon: IconChat,
    title: "Chat with files",
    desc: "Drop a folder, the agent reads, edits, and writes. No copy-paste.",
  },
  {
    icon: IconTerminal,
    title: "Run shell safely",
    desc: "Sandboxed container per session. Whitelist what you need, log the rest.",
  },
  {
    icon: IconBolt,
    title: "Browse the web",
    desc: "Search, click, read. The agent uses Playwright to fetch real answers.",
  },
  {
    icon: IconBrain,
    title: "Long-term memory",
    desc: "Resumable threads. Postgres checkpointing. Pick up exactly where you stopped.",
  },
  {
    icon: IconWorkflow,
    title: "MCP & .mcpb",
    desc: "Install the same extension bundles Claude Desktop uses. Drop, click, done.",
  },
  {
    icon: IconLock,
    title: "Your data, your box",
    desc: "Self-hosted on your VPS. BYOK. No telemetry. MIT licensed.",
  },
];

const STEPS = [
  { n: "01", title: "Deploy", desc: "Clone, edit .env, docker compose up. Reachable at your VPS IP:3000." },
  { n: "02", title: "Plug in a key", desc: "OpenAI, Anthropic, or a local Ollama. Encrypted at rest. BYOK only." },
  { n: "03", title: "Chat", desc: "Ask it to refactor a repo, debug a script, summarize a paper. It does the rest." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto pt-20 md:pt-28 pb-16 md:pb-24">
        <div className="flex flex-col items-center gap-7 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-pink-neon/20 bg-pink-neon/5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="font-label-mono text-[0.55rem] md:text-[0.6rem] text-pink-neon uppercase tracking-widest">
              Self-Hosted AI Agent Platform
            </span>
          </div>

          <h1 className="text-[1.8rem] md:text-display-lg text-on-surface font-bold leading-tight tracking-tight">
            Claude Desktop.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-pink-neon">
              In your browser.
            </span>
            <br />
            On your VPS.
          </h1>

          <p className="text-[0.85rem] md:text-body-md text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            An AI agent that reads your files, runs your commands, browses the web, and finishes complex tasks &mdash; deployable with a single <code className="font-label-mono text-pink-neon">docker compose up</code>. MIT licensed.
          </p>

          <div className="flex flex-wrap gap-3 items-center justify-center pt-2">
            <Link href="/register" className="btn-primary-filled px-6 md:px-8 py-3 text-[0.7rem] font-label-mono uppercase tracking-widest">
              <IconLogo size={16} />
              Get started free
            </Link>
            <Link href="https://github.com/foxyselabs/foxyselabs" className="btn-cyber-pink px-6 md:px-8 py-3 text-[0.7rem] font-label-mono uppercase tracking-widest">
              View on GitHub
              <IconArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <div className="accent-line max-w-max-width mx-auto" />

      {/* Features */}
      <section id="features" className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto py-20 md:py-28">
        <div className="text-center mb-12">
          <p className="font-label-mono text-[0.6rem] text-pink-neon uppercase tracking-widest mb-3">
            Capabilities
          </p>
          <h2 className="text-[1.3rem] md:text-display-md text-on-surface font-bold mb-3">
            Everything an agent needs.
            <br />
            <span className="text-text-subtle">Nothing you don&apos;t.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="stitch-node-glass p-5 md:p-6 group hover:border-pink-neon/30 transition-colors">
              <div className="w-10 h-10 rounded-DEFAULT bg-pink-neon/10 flex items-center justify-center mb-4 group-hover:bg-pink-neon/20 transition-colors">
                <f.icon className="text-pink-neon" size={20} />
              </div>
              <h3 className="text-on-surface text-[0.95rem] font-display-md font-semibold mb-2">
                {f.title}
              </h3>
              <p className="text-on-surface-variant text-[0.78rem] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="font-label-mono text-[0.6rem] text-pink-neon uppercase tracking-widest mb-3">
            Get running
          </p>
          <h2 className="text-[1.3rem] md:text-display-md text-on-surface font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-pink-neon">
              Three steps
            </span>{" "}
            to a working agent.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="stitch-node-glass p-5 md:p-6 relative overflow-hidden group">
              <span className="absolute -top-4 -right-4 text-[5rem] md:text-[6rem] font-display-md font-bold text-white/[0.02] select-none leading-none group-hover:text-pink-neon/5 transition-colors">
                {s.n}
              </span>
              <h3 className="text-on-surface text-[0.95rem] font-display-md font-semibold mb-2 relative z-10">
                {s.title}
              </h3>
              <p className="text-on-surface-variant text-[0.78rem] leading-relaxed relative z-10">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto py-16">
        <div className="stitch-node-glass p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-neon/5 via-transparent to-primary-container/5" />
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl mx-auto">
            <IconScale size={32} className="text-pink-neon" />
            <h2 className="text-[1.3rem] md:text-display-md text-on-surface font-bold">
              Your agent. Your server. Your rules.
            </h2>
            <p className="text-[0.8rem] md:text-body-sm text-on-surface-variant max-w-md">
              No vendor lock-in. No telemetry. The whole stack is &lt; 200 MB of Docker images.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Link href="/register" className="btn-primary-filled px-7 py-3 text-[0.7rem]">
                Create free account
              </Link>
              <Link href="#pricing" className="btn-cyber-pink px-7 py-3 text-[0.7rem]">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />
    </>
  );
}
