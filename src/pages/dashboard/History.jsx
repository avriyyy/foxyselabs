import { useState, useEffect, useCallback } from "react"
import { MOCK_HISTORY } from "../../utils/mockData"

const API = import.meta.env.VITE_API_URL || "http://localhost:3001"

export default function History() {
  const [history, setHistory] = useState(MOCK_HISTORY)
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/history?limit=100`)
      const json = await res.json()
      if (json.data && json.data.length > 0) {
        setHistory(json.data)
      }
    } catch (err) {
      console.error("API unreachable, using mock history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-pink-neon border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="stitch-node-glass rounded-none overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 md:px-6 py-2.5 md:py-3 border-b border-white/5 bg-black/20">
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">Pair</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">DEX A</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">DEX B</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">Diff</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">Profit</span>
          <span className="text-text-subtle text-[11px] font-mono uppercase tracking-wider">Date</span>
        </div>
        {history.length > 0 ? history.map((opp) => (
          <div
            key={opp.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 md:px-6 py-3 md:py-4 border-b border-white/5 text-left items-center last:border-b-0"
          >
            <span className="font-medium text-on-surface text-body-sm md:text-body-md">{opp.pair}</span>
            <span className="text-on-surface-variant text-body-sm">{opp.dexA}</span>
            <span className="text-on-surface-variant text-body-sm">{opp.dexB}</span>
            <span className="font-mono text-body-sm text-on-surface-variant">{Number(opp.diff).toFixed(2)}%</span>
            <span className="font-mono text-body-sm text-success">${Number(opp.profit).toFixed(2)}</span>
            <span className="font-mono text-body-sm text-text-subtle">{new Date(opp.createdAt).toLocaleDateString()}</span>
          </div>
        )) : (
          <div className="px-4 md:px-6 py-12 text-center text-text-subtle text-body-sm">
            No history yet. Opportunities will appear here after execution.
          </div>
        )}
      </div>
    </div>
  )
}
