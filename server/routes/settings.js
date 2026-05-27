import { Router } from "express"
import { query, findFirst, upsert } from "../prisma.js"

const router = Router()

router.get("/", async (req, res) => {
  try {
    const { address } = req.query
    if (!address) return res.status(400).json({ error: "Address required" })

    const walletResult = await query(`SELECT * FROM "Wallet" WHERE "address" = $1`, [address.toLowerCase()])
    if (walletResult.rows.length === 0) {
      return res.json({ dexFilter: "all", slippage: 0.5, gasLimit: 5.0, minProfit: 0.0, notify: "both" })
    }
    const wallet = walletResult.rows[0]
    const settingsResult = await query(`SELECT * FROM "Setting" WHERE "walletId" = $1`, [wallet.id])
    const settings = settingsResult.rows[0] || null
    res.json(settings || { dexFilter: "all", slippage: 0.5, gasLimit: 5.0, minProfit: 0.0, notify: "both" })
  } catch (err) {
    console.error("GET /api/settings", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

router.put("/", async (req, res) => {
  try {
    const { address, dexFilter, slippage, gasLimit, minProfit, notify } = req.body
    if (!address) return res.status(400).json({ error: "Address required" })

    const addr = address.toLowerCase()
    let walletResult = await query(`SELECT * FROM "Wallet" WHERE "address" = $1`, [addr])
    let wallet
    if (walletResult.rows.length === 0) {
      const r = await query(`INSERT INTO "Wallet" ("address", "updatedAt") VALUES ($1, $2) RETURNING *`, [addr, new Date()])
      wallet = r.rows[0]
    } else {
      wallet = walletResult.rows[0]
    }

    const existing = await query(`SELECT * FROM "Setting" WHERE "walletId" = $1`, [wallet.id])
    if (existing.rows.length > 0) {
      const r = await query(
        `UPDATE "Setting" SET "dexFilter" = $1, "slippage" = $2, "gasLimit" = $3, "minProfit" = $4, "notify" = $5, "updatedAt" = $6 WHERE "walletId" = $7 RETURNING *`,
        [dexFilter, slippage, gasLimit, minProfit, notify, new Date(), wallet.id]
      )
      res.json(r.rows[0])
    } else {
      const r = await query(
        `INSERT INTO "Setting" ("walletId", "dexFilter", "slippage", "gasLimit", "minProfit", "notify", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [wallet.id, dexFilter, slippage, gasLimit, minProfit, notify, new Date()]
      )
      res.json(r.rows[0])
    }
  } catch (err) {
    console.error("PUT /api/settings", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
