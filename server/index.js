import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import { query } from "./prisma.js"
import opportunitiesRouter from "./routes/opportunities.js"
import historyRouter from "./routes/history.js"
import settingsRouter from "./routes/settings.js"
import networksRouter from "./routes/networks.js"
import simulateRouter from "./routes/simulate.js"
import { startScanner } from "./scanner.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.CLIENT_URL || true }))
app.use(express.json())

const isProduction = process.env.NODE_ENV === "production"
if (isProduction) {
  app.use(express.static(path.join(__dirname, "../dist")))
}

const ADMIN_ADDRESS = "0x87bEafC2bEf36b4afA32dcaF6E6A9F272Be1dff5"

app.get("/api/wallet/:address", async (req, res) => {
  try {
    const address = req.params.address.toLowerCase()
    let result = await query(`SELECT * FROM "Wallet" WHERE "address" = $1`, [address])
    let wallet = result.rows[0]
    if (!wallet) {
      const role = address === ADMIN_ADDRESS.toLowerCase() ? "Admin" : "Free"
      result = await query(`INSERT INTO "Wallet" ("address", "role", "updatedAt") VALUES ($1, $2, $3) RETURNING *`, [address, role, new Date()])
      wallet = result.rows[0]
    }
    res.json({ address: wallet.address, role: wallet.role })
  } catch (err) {
    console.error("GET /api/wallet/:address", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/wallet", async (req, res) => {
  try {
    const { address, role } = req.body
    if (!address) return res.status(400).json({ error: "Address is required" })
    const addr = address.toLowerCase()

    const existing = await query(`SELECT * FROM "Wallet" WHERE "address" = $1`, [addr])
    if (existing.rows.length > 0) {
      const updateRole = role || existing.rows[0].role
      const r = await query(`UPDATE "Wallet" SET "role" = $1, "updatedAt" = $2 WHERE "address" = $3 RETURNING *`, [updateRole, new Date(), addr])
      res.json({ address: r.rows[0].address, role: r.rows[0].role })
    } else {
      const newRole = addr === ADMIN_ADDRESS.toLowerCase() ? "Admin" : (role || "Free")
      const r = await query(`INSERT INTO "Wallet" ("address", "role", "updatedAt") VALUES ($1, $2, $3) RETURNING *`, [addr, newRole, new Date()])
      res.json({ address: r.rows[0].address, role: r.rows[0].role })
    }
  } catch (err) {
    console.error("POST /api/wallet", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.use("/api/opportunities", opportunitiesRouter)
app.use("/api/history", historyRouter)
app.use("/api/settings", settingsRouter)
app.use("/api/networks", networksRouter)
app.use("/api/simulate", simulateRouter)

if (isProduction) {
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) return next()
    res.sendFile(path.join(__dirname, "../dist/index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  if (process.env.DISABLE_SCANNER !== "true") {
    startScanner(60000)
  }
})
