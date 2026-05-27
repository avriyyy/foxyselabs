import { Router } from "express"

const router = Router()

router.get("/", async (req, res) => {
  try {
    const { status, pair, dex, startDate, endDate, page = 1, limit = 50 } = req.query
    const { query } = await import("../prisma.js")

    const conditions = [`"status" != 'pending'`]
    const values = []
    let idx = 1

    if (status) { conditions.push(`"status" = $${idx++}`); values.push(status) }
    if (pair) { conditions.push(`"pair" ILIKE $${idx++}`); values.push(`%${pair}%`) }
    if (dex) { conditions.push(`("dexA" = $${idx++} OR "dexB" = $${idx++})`); values.push(dex, dex) }
    if (startDate) { conditions.push(`"createdAt" >= $${idx++}`); values.push(startDate) }
    if (endDate) { conditions.push(`"createdAt" <= $${idx++}`); values.push(endDate) }

    const whereClause = `WHERE ${conditions.join(" AND ")}`
    const offset = (Number(page) - 1) * Number(limit)

    const dataResult = await query(`SELECT * FROM "Opportunity" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${idx++} OFFSET $${idx++}`, [...values, Number(limit), offset])
    const countResult = await query(`SELECT COUNT(*) FROM "Opportunity" ${whereClause}`, values)

    res.json({ data: dataResult.rows, total: parseInt(countResult.rows[0].count), page: Number(page), limit: Number(limit) })
  } catch (err) {
    console.error("GET /api/history", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
