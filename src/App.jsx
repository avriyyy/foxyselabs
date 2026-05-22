import { useState } from "react"
import HeroVisual from "./components/HeroVisual"
import Logo from "./components/Logo"
import { IconArrowRight, IconX } from "./components/Icons"

function NavBar({ active, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleNav(page) {
    onNavigate(page)
    setMobileOpen(false)
  }

  const navLinkClass = (page) =>
    `relative font-medium transition-colors duration-300 font-body-sm text-body-sm ${active === page ? "text-pink-neon" : "text-on-surface-variant hover:text-primary"}`

  const activeDot = (page) =>
    active === page && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-pink-neon rounded-full" />

  return (
    <nav className="bg-surface/80 dark:bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm border-b border-white/5">
      <div className="flex justify-between items-center h-16 md:h-20 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-1.5 md:gap-3">
          <Logo size={28} className="w-5 h-5 md:w-7 md:h-7" />
          <span className="tracking-tighter text-[1rem] md:text-display-md">
            <span className="text-on-surface">Foxyse</span><span className="text-pink-neon">Labs</span><span className="text-on-surface">.</span>
          </span>
        </button>
        <div className="hidden md:flex items-center gap-8 ml-auto">
          <button onClick={() => onNavigate("home")} className={navLinkClass("home")}>
            Home
            {activeDot("home")}
          </button>
          <button onClick={() => onNavigate("product")} className={navLinkClass("product")}>
            Product
            {activeDot("product")}
          </button>
          <button onClick={() => onNavigate("docs")} className={navLinkClass("docs")}>
            Docs
            {activeDot("docs")}
          </button>
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
            <button onClick={() => handleNav("home")} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${active === "home" ? "text-pink-neon bg-pink-neon/10" : "text-on-surface-variant hover:text-pink-neon hover:bg-white/5"}`}>
              Home
            </button>
            <button onClick={() => handleNav("product")} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${active === "product" ? "text-pink-neon bg-pink-neon/10" : "text-on-surface-variant hover:text-pink-neon hover:bg-white/5"}`}>
              Product
            </button>
            <button onClick={() => handleNav("docs")} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${active === "docs" ? "text-pink-neon bg-pink-neon/10" : "text-on-surface-variant hover:text-pink-neon hover:bg-white/5"}`}>
              Docs
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-surface-dim dark:bg-surface-dim w-full py-6 md:py-10 lg:py-12 border-t border-surface-variant mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto gap-3 md:gap-6 lg:gap-8">
        <div className="flex items-center gap-2 md:gap-2 lg:gap-3">
          <Logo size={28} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
          <span className="text-[1rem] md:text-[1.25rem] lg:text-display-md">
            <span className="text-primary">Foxyse</span><span className="text-pink-neon">Labs</span><span className="text-on-surface">.</span>
          </span>
        </div>
        <div className="flex gap-4 md:gap-5 lg:gap-6 items-center">
          <a className="text-text-subtle hover:text-pink-neon transition-colors" href="#" aria-label="X (Twitter)">
            <IconX className="w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          </a>
        </div>
        <div className="font-body-sm text-[0.75rem] md:text-[0.8rem] lg:text-body-sm text-text-subtle">
          FoxyseLabs. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

function HomePage({ onNavigate }) {
  return (
    <main className="flex-grow pt-32 pb-24">
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-24 md:mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-start md:items-center">
          <HeroVisual />
          <div className="flex flex-col gap-6 md:gap-8">
            <h1 className="text-display-md lg:text-display-lg text-on-surface">
              Software infrastructure for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-pink-neon">borderless business.</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              A modern software platform that helps businesses deliver digital services, automate operations, and accept secure decentralized payments worldwide.
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 items-center">
              <button onClick={() => onNavigate("product")} className="btn-primary-filled px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[0.625rem] md:text-[0.7rem] lg:text-label-mono">
                Go To Product
              </button>
              <button onClick={() => onNavigate("docs")} className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-mono uppercase tracking-wider px-2 md:px-3 lg:px-4 py-2 md:py-3 lg:py-4 flex items-center gap-1.5 md:gap-2 text-[0.625rem] md:text-[0.7rem] lg:text-label-mono">
                Read Documentation <IconArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-24 md:mb-32">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-6 py-20 md:py-28 lg:py-32">
          <span className="font-label-mono text-label-mono text-pink-neon tracking-widest uppercase">Coming Soon</span>
          <h2 className="text-display-md lg:text-display-lg text-on-surface text-center">
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
    <main className="flex-grow pt-24 md:pt-28 lg:pt-32 pb-24">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-on-surface-variant hover:text-pink-neon transition-colors font-label-mono text-label-mono mb-8 md:mb-10 lg:mb-12">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Home
        </button>
        <div className="flex flex-col items-center justify-center gap-4 md:gap-6 py-20 md:py-28 lg:py-32">
          <span className="font-label-mono text-label-mono text-pink-neon tracking-widest uppercase">Coming Soon</span>
          <h1 className="text-display-md lg:text-display-lg text-on-surface text-center">Product</h1>
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
    <main className="flex-grow pt-24 md:pt-28 lg:pt-32 pb-24">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-on-surface-variant hover:text-pink-neon transition-colors font-label-mono text-label-mono mb-8 md:mb-10 lg:mb-12">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Home
        </button>
        <div className="flex flex-col items-center justify-center gap-4 md:gap-6 py-20 md:py-28 lg:py-32">
          <span className="font-label-mono text-label-mono text-pink-neon tracking-widest uppercase">Coming Soon</span>
          <h1 className="text-display-md lg:text-display-lg text-on-surface text-center">Documentation</h1>
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
