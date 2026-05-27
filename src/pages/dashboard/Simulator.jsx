import { useState, useEffect } from "react"
import { SIMULATION_RESULT } from "../../utils/mockData"

const API = import.meta.env.VITE_API_URL || "http://localhost:3001"

export default function Simulator() {
  const [amount, setAmount] = useState(2000)
  const [pair, setPair] = useState("SOL/USDC")
  const [dexA, setDexA] = useState("Uniswap")
  const [dexB, setDexB] = useState("Raydium")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pairs, setPairs] = useState(["ETH/USDC", "SOL/USDC", "AVAX/USDT", "MATIC/USDC", "LINK/ETH"])

  useEffect(() => {
    fetch(`${API}/api/networks`)
      .then((r) => r.json())
      .then((data) => {
        if (data.pairs) setPairs(data.pairs)
      })
      .catch(() => {})
  }, [])

  async function handleSimulate() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${API}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pair, amount, dexA, dexB }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
        return
      }
    } catch (err) {
      console.error("API unreachable, using mock result")
    }
    setTimeout(() => setResult(SIMULATION_RESULT), 300)
    setLoading(false)
  }

  useEffect(() => {
    if (result) setLoading(false)
  }, [result])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="stitch-node-glass rounded-none p-4 md:p-6">
        <h2 className="text-on-surface text-body-md font-semibold mb-4">Input Parameters</h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-on-surface-variant text-body-sm">Trading Pair</span>
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="bg-surface border border-white/10 text-on-surface px-3 py-2 text-body-sm rounded-none focus:border-pink-neon outline-none"
            >
              {pairs.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-on-surface-variant text-body-sm">DEX A (Buy)</span>
            <select
              value={dexA}
              onChange={(e) => setDexA(e.target.value)}
              className="bg-surface border border-white/10 text-on-surface px-3 py-2 text-body-sm rounded-none focus:border-pink-neon outline-none"
            >
              <option>Uniswap</option>
              <option>PancakeSwap</option>
              <option>Raydium</option>
              <option>Orca</option>
              <option>Trader Joe</option>
              <option>QuickSwap</option>
              <option>Curve</option>
              <option>Balancer</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-on-surface-variant text-body-sm">DEX B (Sell)</span>
            <select
              value={dexB}
              onChange={(e) => setDexB(e.target.value)}
              className="bg-surface border border-white/10 text-on-surface px-3 py-2 text-body-sm rounded-none focus:border-pink-neon outline-none"
            >
              <option>Uniswap</option>
              <option>PancakeSwap</option>
              <option>Raydium</option>
              <option>Orca</option>
              <option>Trader Joe</option>
              <option>QuickSwap</option>
              <option>Curve</option>
              <option>Balancer</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-on-surface-variant text-body-sm">Capital Amount (USD)</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-surface border border-white/10 text-on-surface px-3 py-2 text-body-sm font-mono rounded-none focus:border-pink-neon outline-none"
            />
          </label>
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="btn-primary-filled px-6 py-2.5 md:py-3 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[11px] w-fit disabled:opacity-50"
          >
            {loading ? "Simulating..." : "Simulate"}
          </button>
        </div>
      </div>

      <div className="stitch-node-glass rounded-none p-4 md:p-6">
        <h2 className="text-on-surface text-body-md font-semibold mb-4">Estimated Results</h2>
        {result ? (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-on-surface-variant text-body-sm">Gross Profit</span>
              <span className="text-on-surface font-mono text-body-sm">${Number(result.grossProfit).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-on-surface-variant text-body-sm">Gas Fee</span>
              <span className="text-error font-mono text-body-sm">-${Number(result.gasFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-on-surface-variant text-body-sm">DEX Fee (0.3%)</span>
              <span className="text-error font-mono text-body-sm">-${Number(result.dexFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-on-surface-variant text-body-sm">Slippage Cost</span>
              <span className="text-error font-mono text-body-sm">-${Number(result.slippageCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-on-surface text-body-md font-semibold">Net Profit</span>
              <span className={`font-mono text-body-md font-semibold ${result.netProfit >= 0 ? "text-success" : "text-error"}`}>
                {result.netProfit >= 0 ? "+" : ""}${Number(result.netProfit).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-body-sm">ROI</span>
              <span className={`font-mono text-body-sm ${result.roi >= 0 ? "text-success" : "text-error"}`}>
                {result.roi >= 0 ? "+" : ""}{Number(result.roi).toFixed(2)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-text-subtle text-body-sm">
            Run a simulation to see estimated results.
          </div>
        )}
      </div>
    </div>
  )
}
