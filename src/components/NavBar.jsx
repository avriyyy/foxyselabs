import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import Logo from "./Logo"

const PLANS = [
  {
    name: "Free", price: "$0", period: "forever",
    features: [
      { text: "Scanner (raw prices only)", included: true },
      { text: "Profit analysis", included: false },
      { text: "Alerts (3 lifetime)", included: true },
      { text: "Auto-Execute", included: false },
      { text: "Historical data (7 days)", included: true },
    ],
    cta: "Get Started", highlighted: false,
  },
  {
    name: "Pro", price: "$19", period: "per month",
    features: [
      { text: "Scanner with full analysis", included: true },
      { text: "Profit analysis", included: true },
      { text: "Unlimited alerts", included: true },
      { text: "Auto-Execute ON/OFF", included: true },
      { text: "Historical data (30 days)", included: true },
    ],
    cta: "Subscribe Pro", highlighted: true,
  },
  {
    name: "Elite", price: "$49", period: "per month",
    features: [
      { text: "Scanner with full analysis", included: true },
      { text: "Profit analysis", included: true },
      { text: "Unlimited alerts", included: true },
      { text: "Auto-Execute (Highest Priority)", included: true },
      { text: "Multi-Wallet support", included: true },
      { text: "API Access", included: true },
      { text: "Historical data (90 days)", included: true },
      { text: "Priority Support", included: true },
    ],
    cta: "Subscribe Elite", highlighted: false,
  },
]

function CheckIcon({ className = "w-3.5 h-3.5 shrink-0 text-success" }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function CrossIcon({ className = "w-3.5 h-3.5 shrink-0 text-text-subtle" }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function PricingModal({ open, onClose }) {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <button onClick={onClose} className="fixed top-6 right-6 z-[60] text-on-surface-variant hover:text-on-surface transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="relative max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto pt-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {PLANS.map((plan) => {
            function handleClick() {
              if (!isConnected) {
                openConnectModal?.()
                return
              }
            }
            return (
              <div key={plan.name} className={`stitch-node-glass rounded-none p-5 md:p-6 flex flex-col ${plan.highlighted ? "border-pink-neon/30 relative" : ""}`}>
                {plan.highlighted && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-pink-neon text-[#590028] px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Most Popular
                  </span>
                )}
                <h3 className="text-on-surface text-headline-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-on-surface text-display-md font-bold font-mono">{plan.price}</span>
                  <span className="text-on-surface-variant text-body-sm ml-1">/{plan.period}</span>
                </div>
                <div className="border-t border-white/5 pt-4 flex-1">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5">
                      {f.included ? <CheckIcon /> : <CrossIcon />}
                      <span className={`text-body-sm ${f.included ? "text-on-surface" : "text-text-subtle"}`}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleClick}
                  className={`mt-6 w-full py-2.5 md:py-3 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[11px] transition-all duration-300 ${plan.highlighted ? "btn-primary-filled" : "btn-cyber-pink"}`}
                >
                  {plan.cta}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function WalletDropdown({ address }) {
  const [open, setOpen] = useState(false)
  const { disconnect } = useDisconnect()
  const short = `${address.slice(0, 5)}...${address.slice(-4)}`

  return (
    <div className="relative w-fit">
      <button
        onClick={() => setOpen(!open)}
        className="btn-primary-filled px-4 py-1.5 rounded-DEFAULT font-mono text-[10px] tracking-wider flex items-center w-full"
      >
        {short}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-surface border border-white/10 shadow-xl w-full min-w-0">
            <button
              onClick={() => { disconnect(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-[10px] text-error hover:bg-white/5 transition-colors font-mono tracking-wider"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [role, setRole] = useState("Free")
  const { address: walletAddress } = useAccount()

  useEffect(() => {
    if (!walletAddress) return
    fetch(`${import.meta.env.VITE_API_URL || ""}/api/wallet/${walletAddress}`)
      .then((r) => r.json())
      .then((data) => setRole(data.role))
      .catch(() => {})
  }, [walletAddress])

  return (
    <>
    <nav className="bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm border-b border-white/5">
      <div className="flex justify-between items-center h-16 md:h-20 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/" className="flex items-center gap-1.5 md:gap-3">
            <Logo size={22} className="w-5 h-5 md:w-6 md:h-6" />
            <span className="font-display-md text-[1rem] md:text-headline-lg tracking-tighter">
              <span className="text-on-surface">Foxyse</span><span className="text-pink-neon">Labs</span><span className="text-on-surface">.</span>
            </span>
          </Link>
          <button
            onClick={() => setShowPricing(true)}
            className="border border-pink-neon text-pink-neon bg-transparent hover:bg-pink-neon/10 px-2.5 py-0.5 rounded-DEFAULT font-label-mono tracking-wider text-[9px] font-semibold transition-all duration-300"
          >
            {role}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ConnectButton.Custom>
            {({ account, openConnectModal, mounted }) => {
              if (!mounted) return <div className="w-24 h-8" />
              if (account) {
                return <WalletDropdown address={account.address} />
              }
              return (
                <button
                  onClick={openConnectModal}
                  className="btn-primary-filled px-4 py-1.5 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[10px]"
                >
                  Connect Wallet
                </button>
              )
            }}
          </ConnectButton.Custom>
        </div>

        <button
          className="md:hidden flex items-center justify-center w-8 h-8 text-on-surface-variant hover:text-pink-neon transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface/95 backdrop-blur-xl">
          <div className="flex flex-col gap-1 px-margin-mobile py-4">
            <button
              onClick={() => { setShowPricing(true); setMobileOpen(false) }}
              className="w-full text-left px-4 py-3 text-pink-neon hover:bg-white/5 transition-colors font-label-mono uppercase tracking-wider text-[11px]"
            >
              Role: {role}
            </button>
            <ConnectButton.Custom>
              {({ account, openConnectModal, mounted }) => {
                if (!mounted) return null
                if (account) {
                  return (
                    <>
                      <div className="px-4 py-2 font-mono text-body-sm text-on-surface break-all">
                        {account.address}
                      </div>
                      <button onClick={() => { account.connector?.disconnect(); setMobileOpen(false) }} className="w-full text-left px-4 py-3 text-on-surface-variant hover:text-pink-neon hover:bg-white/5 transition-colors">
                        Disconnect
                      </button>
                    </>
                  )
                }
                return (
                  <div className="px-4 py-3">
                    <button onClick={openConnectModal} className="btn-primary-filled w-full py-2 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[10px]">
                      Connect Wallet
                    </button>
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      )}
    </nav>
    <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </>
  )
}
