import { useState, useEffect, useCallback } from "react"
import { MOCK_OPPORTUNITIES } from "../../utils/mockData"

const API = import.meta.env.VITE_API_URL || ""

export default function Overview() {
  const [opportunities, setOpportunities] = useState(MOCK_OPPORTUNITIES)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [lastUpdated, setLastUpdated] = useState("—")
  const [dexFilter, setDexFilter] = useState("")
  const [pairSearch, setPairSearch] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (dexFilter) params.set("dex", dexFilter)
      if (pairSearch) params.set("pair", pairSearch)
      const res = await fetch(`${API}/api/opportunities?${params}`)
      const json = await res.json()
      if (json.data && json.data.length > 0) {
        setOpportunities(json.data)
        setLastUpdated(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.error("API unreachable, using mock data")
    } finally {
      setLoading(false)
    }
  }, [dexFilter, statusFilter, pairSearch])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-pink-neon border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="stitch-node-glass rounded-none p-3 md:p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1 min-w-[140px]">
            <span className="text-text-subtle text-[10px] font-mono uppercase tracking-wider">DEX</span>
            <select
              value={dexFilter}
              onChange={(e) => setDexFilter(e.target.value)}
              className="bg-surface border border-white/10 text-on-surface px-2.5 py-1.5 text-[11px] font-mono rounded-none focus:border-pink-neon outline-none"
            >
              <option value="">All DEX</option>
              <option value="Uniswap">Uniswap</option>
              <option value="PancakeSwap">PancakeSwap</option>
              <option value="Raydium">Raydium</option>
              <option value="Orca">Orca</option>
              <option value="Trader Joe">Trader Joe</option>
              <option value="QuickSwap">QuickSwap</option>
              <option value="Curve">Curve</option>
              <option value="Balancer">Balancer</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 min-w-[160px]">
            <span className="text-text-subtle text-[10px] font-mono uppercase tracking-wider">Pair</span>
            <input
              type="text"
              value={pairSearch}
              onChange={(e) => setPairSearch(e.target.value)}
              placeholder="Search pair..."
              className="bg-surface border border-white/10 text-on-surface px-2.5 py-1.5 text-[11px] font-mono rounded-none focus:border-pink-neon outline-none placeholder:text-text-subtle/50"
            />
          </label>
          <button
            onClick={() => { setDexFilter(""); setPairSearch("") }}
            className="text-text-subtle hover:text-on-surface-variant text-[10px] font-mono uppercase tracking-wider transition-colors px-2 py-1.5"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="stitch-node-glass rounded-none overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.8fr] gap-2 px-4 md:px-6 py-2.5 md:py-3 border-b border-white/5 bg-black/20">
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">Pair</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">DEX A</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">DEX B</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">Diff</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">Profit</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">Status</span>
        </div>
        {opportunities.length > 0 ? opportunities.map((opp) => {
          const diffColor = opp.diff >= 1.0 ? "text-success" : opp.diff >= 0.5 ? "text-pink-neon" : "text-on-surface-variant"
          return (
            <button
              key={opp.id}
              onClick={() => setSelected(selected?.id === opp.id ? null : opp)}
              className={`w-full grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.8fr] gap-2 px-4 md:px-6 py-3 md:py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left items-center last:border-b-0 ${
                selected?.id === opp.id ? "bg-white/[0.03]" : ""
              }`}
            >
              <span className="font-medium text-on-surface text-body-sm md:text-body-md">{opp.pair}</span>
              <span className="text-on-surface-variant text-body-sm">{opp.dexA}</span>
              <span className="text-on-surface-variant text-body-sm">{opp.dexB}</span>
              <span className={`font-mono text-body-sm md:text-body-md ${diffColor}`}>
                {opp.diff >= 0 ? "+" : ""}{Number(opp.diff).toFixed(2)}%
              </span>
              <span className={`font-mono text-body-sm md:text-body-md ${diffColor}`}>
                ${Number(opp.profit).toFixed(2)}
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-sm w-fit capitalize ${opp.status === "expired" ? "text-text-subtle bg-white/5" : opp.status === "executed" ? "text-tertiary bg-tertiary/10" : "text-pink-neon bg-pink-neon/10"}`}>
                {opp.status}
              </span>
            </button>
          )
        }) : (
          <div className="px-4 md:px-6 py-12 text-center text-text-subtle text-body-sm">
            No opportunities found. Scanner will populate data as it runs.
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-4 stitch-node-glass rounded-none p-4 md:p-6">
          <h3 className="text-on-surface text-body-md font-semibold mb-3">{selected.pair}</h3>
          <div className="grid grid-cols-2 gap-3 text-body-sm">
            <div>
              <span className="text-text-subtle">DEX A: </span>
              <span className="text-on-surface-variant font-mono">{selected.dexA} (${Number(selected.priceA || selected.price).toFixed(2)})</span>
            </div>
            <div>
              <span className="text-text-subtle">DEX B: </span>
              <span className="text-on-surface-variant font-mono">{selected.dexB} (${Number(selected.priceB || selected.price).toFixed(2)})</span>
            </div>
            <div>
              <span className="text-text-subtle">Diff: </span>
              <span className="text-pink-neon font-mono">{Number(selected.diff).toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-text-subtle">Profit: </span>
              <span className="text-success font-mono">${Number(selected.profit).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-text-subtle">Gas: </span>
              <span className="text-on-surface-variant font-mono">${Number(selected.gas).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-text-subtle">Slippage: </span>
              <span className="text-on-surface-variant font-mono">{Number(selected.slippage).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <span className="text-text-subtle text-body-sm font-mono">
          {opportunities.length > 0 ? `${opportunities.length} opportunities` : "Waiting for scanner..."}
          {lastUpdated !== "—" && <span className="ml-2">(last: {lastUpdated})</span>}
        </span>
        <button onClick={fetchData} className="flex items-center gap-1.5 text-[11px] text-tertiary font-mono hover:text-white transition-colors">
          <span className="w-2 h-2 rounded-full bg-tertiary" />
          Refresh
        </button>
      </div>
    </div>
  )
}
