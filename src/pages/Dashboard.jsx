import { useSearchParams } from "react-router-dom"
import Overview from "./dashboard/Overview"
import Simulator from "./dashboard/Simulator"
import History from "./dashboard/History"
import Alerts from "./dashboard/Alerts"
import Analytics from "./dashboard/Analytics"
import Wallets from "./dashboard/Wallets"
import Settings from "./dashboard/Settings"

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "simulator", label: "Simulator" },
  { id: "history", label: "History" },
  { id: "alerts", label: "Alerts" },
  { id: "analytics", label: "Analytics" },
  { id: "wallets", label: "Wallets" },
  { id: "settings", label: "Settings" },
]

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  function setTab(tab) {
    setSearchParams({ tab })
  }

  let content
  switch (activeTab) {
    case "simulator":
      content = <Simulator />
      break
    case "history":
      content = <History />
      break
    case "alerts":
      content = <Alerts />
      break
    case "analytics":
      content = <Analytics />
      break
    case "wallets":
      content = <Wallets />
      break
    case "settings":
      content = <Settings />
      break
    default:
      content = <Overview />
  }

  return (
    <main className="flex-grow pt-16 md:pt-20 pb-24">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`shrink-0 px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? "text-pink-neon border-b-2 border-pink-neon"
                  : "text-text-subtle hover:text-on-surface-variant"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {content}
      </div>
    </main>
  )
}
