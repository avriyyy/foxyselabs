import { IconCheck } from "../Icons";

const PLANS = [
  {
    id: "free",
    name: "Self-Hosted",
    price: "Free",
    period: "forever",
    cta: "Deploy now",
    href: "https://github.com/foxyselabs/foxyselabs",
    highlight: false,
    features: [
      "Unlimited chats on your own VPS",
      "BYOK: OpenAI, Anthropic, or Ollama",
      "All file & shell tools",
      "MCP + .mcpb extensions",
      "Single binary, MIT license",
    ],
  },
  {
    id: "pro",
    name: "Cloud (soon)",
    price: "$—",
    period: "TBA",
    cta: "Join waitlist",
    href: "/#waitlist",
    highlight: true,
    features: [
      "Hosted multi-tenant",
      "Managed infrastructure",
      "Team workspaces & roles",
      "Audit log & analytics",
      "Priority support",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-24">
      <div className="text-center mb-10">
        <h2 className="text-[1.3rem] md:text-display-md text-on-surface font-bold mb-3">
          Open source. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-pink-neon">Forever free</span> to self-host.
        </h2>
        <p className="text-[0.78rem] md:text-body-sm text-on-surface-variant max-w-lg mx-auto">
          Run it on your own VPS. Bring your own API key. No telemetry, no lock-in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`stitch-node-glass rounded-none p-6 md:p-7 relative ${p.highlight ? "border-pink-neon/40" : ""}`}
          >
            {p.highlight && (
              <span className="absolute -top-2.5 left-6 px-2 py-0.5 bg-pink-neon text-on-primary text-[0.55rem] font-label-mono uppercase tracking-widest">
                Coming
              </span>
            )}
            <div className="mb-5">
              <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon mb-2">
                {p.name}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-display-md font-display-md text-on-surface">{p.price}</span>
                <span className="text-[0.7rem] font-label-mono uppercase tracking-widest text-text-subtle">
                  {p.period}
                </span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[0.78rem] text-on-surface-variant">
                  <IconCheck size={14} className="text-pink-neon mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={p.href}
              className={p.highlight ? "btn-cyber-pink w-full py-2.5 text-[0.65rem]" : "btn-primary-filled w-full py-2.5 text-[0.65rem]"}
            >
              {p.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
