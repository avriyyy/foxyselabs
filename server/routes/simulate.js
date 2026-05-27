import { Router } from "express"

const router = Router()

router.post("/", (req, res) => {
  const { pair, amount, dexA, dexB } = req.body
  if (!pair || !amount) return res.status(400).json({ error: "Pair and amount required" })

  const grossProfit = amount * (Math.random() * 0.02 + 0.005)
  const gasFee = Math.random() * 5 + 0.5
  const dexFee = grossProfit * 0.003
  const slippageCost = grossProfit * (Math.random() * 0.1)
  const netProfit = grossProfit - gasFee - dexFee - slippageCost
  const roi = (netProfit / amount) * 100

  const result = {
    grossProfit: Number(grossProfit.toFixed(2)),
    gasFee: Number(gasFee.toFixed(2)),
    dexFee: Number(dexFee.toFixed(2)),
    slippageCost: Number(slippageCost.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    roi: Number(roi.toFixed(2)),
  }

  res.json(result)
})

export default router
