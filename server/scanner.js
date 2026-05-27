import { query } from "./prisma.js"

const DEXES = [
  { name: "Uniswap", network: "ethereum" },
  { name: "PancakeSwap", network: "bsc" },
  { name: "Raydium", network: "solana" },
  { name: "Orca", network: "solana" },
  { name: "Trader Joe", network: "avalanche" },
  { name: "QuickSwap", network: "polygon" },
  { name: "Curve", network: "ethereum" },
  { name: "Balancer", network: "ethereum" },
]

const TOP_N = 100
const MIN_LIQUIDITY_USD = 10000
const MIN_DIFF_PCT = 0.3
let isScanning = false

function extractPairKey(pair) {
  return pair.baseToken?.symbol && pair.quoteToken?.symbol
    ? `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`
    : pair.symbol || pair.pair?.symbol || ""
}

async function fetchDexScreener(dex) {
  const url = `https://api.dexscreener.com/latest/dex/search/?q=${dex.name}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`DexScreener returned ${res.status}`)
  const data = await res.json()
  const pairs = (data.pairs || [])
    .filter((p) => p.liquidity?.usd && Number(p.liquidity.usd) >= MIN_LIQUIDITY_USD)
    .sort((a, b) => (Number(b.liquidity.usd) || 0) - (Number(a.liquidity.usd) || 0))
    .slice(0, TOP_N)
  return pairs.map((p) => ({
    dex: dex.name,
    network: dex.network,
    pair: extractPairKey(p),
    price: Number(p.priceUsd) || 0,
    liquidity: Number(p.liquidity.usd) || 0,
    volume24h: Number(p.volume?.h24) || 0,
  }))
}

function findOpportunities(snapshots) {
  const byPair = {}
  for (const s of snapshots) {
    if (!s.pair || s.price <= 0) continue
    if (!byPair[s.pair]) byPair[s.pair] = []
    byPair[s.pair].push(s)
  }

  const opportunities = []
  for (const [pair, entries] of Object.entries(byPair)) {
    if (entries.length < 2) continue
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i]
        const b = entries[j]
        const priceA = a.price
        const priceB = b.price
        const diff = Math.abs((priceB - priceA) / priceA) * 100
        if (diff < MIN_DIFF_PCT) continue
        const profit = Math.abs(priceB - priceA)
        opportunities.push({
          pair,
          dexA: a.dex,
          dexB: b.dex,
          priceA,
          priceB,
          diff,
          profit,
          gas: 0,
          slippage: 0.5,
          status: "pending",
        })
      }
    }
  }

  return opportunities.sort((a, b) => b.diff - a.diff).slice(0, 50)
}

export async function scanOnce() {
  if (isScanning) return
  isScanning = true
  try {
    const allSnapshots = []
    for (const dex of DEXES) {
      try {
        const snapshots = await fetchDexScreener(dex)
        allSnapshots.push(...snapshots)
      } catch (err) {
        console.error(`Scanner error for ${dex.name}:`, err.message)
      }
    }

    if (allSnapshots.length === 0) return

    for (const snap of allSnapshots) {
      await query(
        `INSERT INTO "PriceSnapshot" ("dex", "network", "pair", "price", "liquidity", "volume24h") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
        [snap.dex, snap.network, snap.pair, snap.price, snap.liquidity, snap.volume24h]
      )
    }

    const opportunities = findOpportunities(allSnapshots)
    for (const opp of opportunities) {
      const existing = await query(
        `SELECT id FROM "Opportunity" WHERE "pair" = $1 AND "dexA" = $2 AND "dexB" = $3 AND "createdAt" >= NOW() - INTERVAL '1 minute'`,
        [opp.pair, opp.dexA, opp.dexB]
      )
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO "Opportunity" ("pair", "dexA", "dexB", "priceA", "priceB", "diff", "profit", "gas", "slippage", "status", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [opp.pair, opp.dexA, opp.dexB, opp.priceA, opp.priceB, opp.diff, opp.profit, opp.gas, opp.slippage, opp.status, new Date()]
        )
      }
    }

    await query(
      `UPDATE "Opportunity" SET "status" = 'expired', "updatedAt" = NOW() WHERE "status" = 'pending' AND "createdAt" < NOW() - INTERVAL '2 minutes'`
    )
  } finally {
    isScanning = false
  }
}

export function startScanner(intervalMs = 60000) {
  scanOnce()
  setInterval(scanOnce, intervalMs)
  console.log(`Scanner started (interval: ${intervalMs}ms)`)
}
