import { Router } from "express"

const router = Router()

const NETWORKS = [
  { name: "Uniswap", network: "ethereum", chainId: 1 },
  { name: "PancakeSwap", network: "bsc", chainId: 56 },
  { name: "Raydium", network: "solana", chainId: 101 },
  { name: "Orca", network: "solana", chainId: 101 },
  { name: "Trader Joe", network: "avalanche", chainId: 43114 },
  { name: "QuickSwap", network: "polygon", chainId: 137 },
  { name: "Curve", network: "ethereum", chainId: 1 },
  { name: "Balancer", network: "ethereum", chainId: 1 },
]

const PAIRS = [
  "ETH/USDC", "SOL/USDC", "AVAX/USDT", "MATIC/USDC", "LINK/ETH",
  "BTC/USDT", "BNB/USDT", "DOGE/USDT", "DOT/USDT", "ADA/USDT",
  "OP/USDC", "ARB/USDC", "ATOM/USDC", "LTC/USDT", "XRP/USDT",
  "PEPE/USDC", "SHIB/USDC", "INJ/USDC", "TIA/USDC", "APT/USDC",
]

router.get("/", (req, res) => {
  res.json({ networks: NETWORKS, pairs: PAIRS })
})

export default router
