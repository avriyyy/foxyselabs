import { query } from "./prisma.js"

const ADMIN_ADDRESS = "0x87bEafC2bEf36b4afA32dcaF6E6A9F272Be1dff5"

async function seed() {
  const addr = ADMIN_ADDRESS.toLowerCase()
  const now = new Date()
  const existing = await query(`SELECT * FROM "Wallet" WHERE "address" = $1`, [addr])
  if (existing.rows.length > 0) {
    await query(`UPDATE "Wallet" SET "role" = $1, "updatedAt" = $2 WHERE "address" = $3`, ["Admin", now, addr])
  } else {
    await query(`INSERT INTO "Wallet" ("address", "role", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4)`, [addr, "Admin", now, now])
  }
  console.log("Admin wallet seeded")
}

seed()
