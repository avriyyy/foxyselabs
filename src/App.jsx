import { useState } from "react"
import HeroVisual from "./components/HeroVisual"
import Logo from "./components/Logo"
import { IconArrowRight, IconX } from "./components/Icons"

function NavBar({ active, onNavigate }) {
  return (
    <nav className="bg-surface/80 dark:bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm border-b border-white/5">
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-3">
          <Logo size={28} />
          <span className="font-display-md text-display-md tracking-tighter">
            <span className="text-on-surface">Foxyse</span><span className="text-pink-neon">Labs</span><span className="text-on-surface">.</span>
          </span>
        </button>
        <div className="hidden md:flex items-center gap-8 ml-auto">
          <button onClick={() => onNavigate("home")} className={`relative font-medium transition-colors duration-300 font-body-sm text-body-sm ${active === "home" ? "text-pink-neon" : "text-on-surface-variant hover:text-primary"}`}>
            Home
            {active === "home" && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-pink-neon rounded-full" />}
          </button>
          <button onClick={() => onNavigate("product")} className={`relative font-medium transition-colors duration-300 font-body-sm text-body-sm ${active === "product" ? "text-pink-neon" : "text-on-surface-variant hover:text-primary"}`}>
            Product
            {active === "product" && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-pink-neon rounded-full" />}
          </button>
          <button onClick={() => onNavigate("docs")} className={`relative font-medium transition-colors duration-300 font-body-sm text-body-sm ${active === "docs" ? "text-pink-neon" : "text-on-surface-variant hover:text-primary"}`}>
            Docs
            {active === "docs" && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-pink-neon rounded-full" />}
          </button>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-surface-dim dark:bg-surface-dim w-full py-12 border-t border-surface-variant mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto gap-8">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <span className="font-display-md text-display-md">
            <span className="text-primary">Foxyse</span><span className="text-pink-neon">Labs</span><span className="text-on-surface">.</span>
          </span>
        </div>
        <div className="flex gap-6 items-center">
          <a className="text-text-subtle hover:text-pink-neon transition-colors" href="#" aria-label="X (Twitter)">
            <IconX className="w-5 h-5" />
          </a>
        </div>
        <div className="font-body-sm text-body-sm text-text-subtle">
          FoxyseLabs. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

function HomePage({ onNavigate }) {
  return (
    <main className="flex-grow pt-32 pb-24">
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8">
            <h1 className="font-display-lg text-display-lg text-on-surface">
              Software infrastructure for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-pink-neon">borderless business.</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              A modern software platform that helps businesses deliver digital services, automate operations, and accept secure decentralized payments worldwide.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <button onClick={() => onNavigate("product")} className="btn-primary-filled px-8 py-4 rounded-DEFAULT font-label-mono text-label-mono uppercase tracking-wider">
                Go To Product
              </button>
              <button onClick={() => onNavigate("docs")} className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-mono text-label-mono uppercase tracking-wider px-4 py-4 flex items-center gap-2">
                Read Documentation <IconArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-32">
        <div className="flex flex-col items-center justify-center gap-6 py-32">
          <span className="font-label-mono text-label-mono text-pink-neon tracking-widest uppercase">Coming Soon</span>
          <h2 className="font-display-lg text-display-lg md:font-display-lg md:text-display-lg text-on-surface text-center">
            More Features <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-pink-neon">On The Way</span>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md text-center">
            We're building something new. Stay tuned for updates.
          </p>
        </div>
      </section>
    </main>
  )
}

function ProductPage({ onNavigate }) {
  return (
    <main className="flex-grow pt-32 pb-24">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-on-surface-variant hover:text-pink-neon transition-colors font-label-mono text-label-mono mb-12">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Home
        </button>
        <div className="flex flex-col items-center justify-center gap-6 py-32">
          <span className="font-label-mono text-label-mono text-pink-neon tracking-widest uppercase">Coming Soon</span>
          <h1 className="font-display-lg text-display-lg text-on-surface text-center">Product</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md text-center">
            We're crafting something powerful. Details coming soon.
          </p>
        </div>
      </div>
    </main>
  )
}

function DocsPage({ onNavigate }) {
  return (
    <main className="flex-grow pt-32 pb-24">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-on-surface-variant hover:text-pink-neon transition-colors font-label-mono text-label-mono mb-12">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Home
        </button>
        <div className="flex flex-col items-center justify-center gap-6 py-32">
          <span className="font-label-mono text-label-mono text-pink-neon tracking-widest uppercase">Coming Soon</span>
          <h1 className="font-display-lg text-display-lg text-on-surface text-center">Documentation</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md text-center">
            Guides, API references, and integration docs are on the way.
          </p>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [page, setPage] = useState("home")
  return (
    <div className="min-h-screen flex flex-col selection:bg-pink-neon selection:text-white">
      <NavBar active={page} onNavigate={setPage} />
      {page === "home" && <HomePage onNavigate={setPage} />}
      {page === "product" && <ProductPage onNavigate={setPage} />}
      {page === "docs" && <DocsPage onNavigate={setPage} />}
      <Footer />
    </div>
  )
}

export default App
