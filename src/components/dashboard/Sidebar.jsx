import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import Logo from "../Logo"
import {
  IconScanEye,
  IconCalculator,
  IconClock,
  IconBell,
  IconChartLine,
  IconWallet,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
} from "../Icons"

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: IconScanEye },
  { id: "simulator", label: "Simulator", icon: IconCalculator },
  { id: "history", label: "History", icon: IconClock },
  { id: "alerts", label: "Alerts", icon: IconBell },
  { id: "analytics", label: "Analytics", icon: IconChartLine },
  { id: "wallets", label: "Wallets", icon: IconWallet },
  { id: "settings", label: "Settings", icon: IconSettings },
]

export default function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const active = searchParams.get("page") || "overview"
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebarCollapsed") === "true"
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", String(collapsed))
    } catch {}
  }, [collapsed])

  function setPage(id) {
    setSearchParams({ page: id })
  }

  return (
    <aside
      className={`sticky top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-surface/80 border-r border-white/5 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[60px]" : "w-[220px]"
      } shrink-0`}
    >
      <div className="flex items-center justify-between p-2 border-b border-white/5 min-h-[52px]">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto text-text-subtle hover:text-on-surface-variant transition-colors"
          >
            <IconChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Logo size={20} />
              <span className="text-[13px] font-display-md tracking-tighter">
                <span className="text-on-surface">Foxyse</span><span className="text-pink-neon">Labs</span>
              </span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="text-text-subtle hover:text-on-surface-variant transition-colors"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-3">
          <Logo size={24} />
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-none text-[11px] font-mono uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-pink-neon text-white"
                  : "text-text-subtle hover:text-on-surface-variant hover:bg-white/[0.03]"
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
