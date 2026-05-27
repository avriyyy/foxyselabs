import { Router } from "express"
import { findMany, findFirst, count } from "../prisma.js"

const router = Router()

router.get("/", async (req, res) => {
  try {
    const { dex, status, minProfit, pair, page = 1, limit = 50 } = req.query
    const where = {}
    if (dex) where.dex = dex
    if (status) where.status = status
    if (minProfit) where.profit_gte = Number(minProfit)
    if (pair) where.pair_ilike = `%${pair}%`

    const conditions = []
    const values = []
    let idx = 1
    if (where.dex) { conditions.push(`("dexA" = $${idx} OR "dexB" = $${idx})`); values.push(where.dex); idx++ }
    if (where.status) { conditions.push(`"status" = $${idx++}`); values.push(where.status) }
    if (where.profit_gte) { conditions.push(`"profit" >= $${idx++}`); values.push(where.profit_gte) }
    if (where.pair_ilike) { conditions.push(`"pair" ILIKE $${idx++}`); values.push(where.pair_ilike) }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
    const offset = (Number(page) - 1) * Number(limit)

    const { query } = await import("../prisma.js")
    const dataResult = await query(`SELECT * FROM "Opportunity" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${idx++} OFFSET $${idx++}`, [...values, Number(limit), offset])
    const countResult = await query(`SELECT COUNT(*) FROM "Opportunity" ${whereClause}`, values)

    res.json({ data: dataResult.rows, total: parseInt(countResult.rows[0].count), page: Number(page), limit: Number(limit) })
  } catch (err) {
    console.error("GET /api/opportunities", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const { query } = await import("../prisma.js")
    const result = await query(`SELECT * FROM "Opportunity" WHERE "id" = $1`, [Number(req.params.id)])
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" })
    res.json(result.rows[0])
  } catch (err) {
    console.error("GET /api/opportunities/:id", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
