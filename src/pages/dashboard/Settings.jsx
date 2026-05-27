import { useState, useEffect } from "react"
import { useAccount } from "wagmi"

const API = import.meta.env.VITE_API_URL || "http://localhost:3001"

export default function Settings() {
  const { address } = useAccount()
  const [dexFilter, setDexFilter] = useState("all")
  const [slippage, setSlippage] = useState(0.5)
  const [gasLimit, setGasLimit] = useState(5.0)
  const [minProfit, setMinProfit] = useState(0.0)
  const [notify, setNotify] = useState("both")
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!address) return
    fetch(`${API}/api/settings?address=${address}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.dexFilter) setDexFilter(data.dexFilter)
        if (data.slippage != null) setSlippage(data.slippage)
        if (data.gasLimit != null) setGasLimit(data.gasLimit)
        if (data.minProfit != null) setMinProfit(data.minProfit)
        if (data.notify) setNotify(data.notify)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [address])

  async function handleSave() {
    if (!address) return
    setSaving(true)
    try {
      await fetch(`${API}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, dexFilter, slippage, gasLimit, minProfit, notify }),
      })
    } catch (err) {
      console.error("Failed to save settings:", err)
    } finally {
      setSaving(false)
    }
  }

  if (!address) {
    return (
      <div className="max-w-2xl">
        <div className="stitch-node-glass rounded-none p-6 text-center text-text-subtle text-body-sm">
          Connect your wallet to manage settings.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="stitch-node-glass rounded-none p-4 md:p-6 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-on-surface-variant text-body-sm">DEX Filter</span>
          <select
            value={dexFilter}
            onChange={(e) => setDexFilter(e.target.value)}
            className="bg-surface border border-white/10 text-on-surface px-3 py-2 text-body-sm rounded-none focus:border-pink-neon outline-none"
          >
            <option value="all">All DEX</option>
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
            <option value="bsc">BSC</option>
            <option value="avalanche">Avalanche</option>
            <option value="polygon">Polygon</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-on-surface-variant text-body-sm">Slippage Tolerance (%)</span>
          <input
            type="number"
            step={0.1}
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
            className="bg-surface border border-white/10 text-on-surface px-3 py-2 text-body-sm font-mono rounded-none focus:border-pink-neon outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-on-surface-variant text-body-sm">Gas Limit (USD)</span>
          <input
            type="number"
            step={0.1}
            value={gasLimit}
            onChange={(e) => setGasLimit(Number(e.target.value))}
            className="bg-surface border border-white/10 text-on-surface px-3 py-2 text-body-sm font-mono rounded-none focus:border-pink-neon outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-on-surface-variant text-body-sm">Minimum Profit (USD)</span>
          <input
            type="number"
            step={0.5}
            value={minProfit}
            onChange={(e) => setMinProfit(Number(e.target.value))}
            className="bg-surface border border-white/10 text-on-surface px-3 py-2 text-body-sm font-mono rounded-none focus:border-pink-neon outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-on-surface-variant text-body-sm">Notifications</span>
          <select
            value={notify}
            onChange={(e) => setNotify(e.target.value)}
            className="bg-surface border border-white/10 text-on-surface px-3 py-2 text-body-sm rounded-none focus:border-pink-neon outline-none"
          >
            <option value="telegram">Telegram</option>
            <option value="email">Email</option>
            <option value="both">Both</option>
            <option value="none">None</option>
          </select>
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary-filled px-6 py-2.5 md:py-3 rounded-DEFAULT font-label-mono uppercase tracking-wider text-[11px] w-fit mt-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  )
}
