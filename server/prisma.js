import "dotenv/config"
import pg from "pg"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

export async function query(text, params) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

export async function findMany(table, where = {}, orderBy = null, limit = null, offset = null) {
  const keys = Object.keys(where)
  if (keys.length === 0) {
    let sql = `SELECT * FROM "${table}"`
    const clauses = []
    if (orderBy) clauses.push(`ORDER BY "${orderBy.field}" ${orderBy.dir || "ASC"}`)
    if (limit) clauses.push(`LIMIT ${limit}`)
    if (offset) clauses.push(`OFFSET ${offset}`)
    sql += clauses.length > 0 ? " " + clauses.join(" ") : ""
    const result = await query(sql)
    return result.rows
  }
  const conditions = keys.map((k, i) => {
    if (typeof where[k] === "object" && where[k] !== null) {
      const op = Object.keys(where[k])[0]
      if (op === "contains") return `"${k}" ILIKE $${i + 1}`
      if (op === "gte") return `"${k}" >= $${i + 1}`
      if (op === "lte") return `"${k}" <= $${i + 1}`
      if (op === "not") return `"${k}" != $${i + 1}`
      return `"${k}" = $${i + 1}`
    }
    return `"${k}" = $${i + 1}`
  })
  const values = keys.map((k) => {
    if (typeof where[k] === "object" && where[k] !== null) {
      return Object.values(where[k])[0]
    }
    return where[k]
  })
  let sql = `SELECT * FROM "${table}" WHERE ${conditions.join(" AND ")}`
  const clauses = []
  if (orderBy) clauses.push(`ORDER BY "${orderBy.field}" ${orderBy.dir || "ASC"}`)
  if (limit) clauses.push(`LIMIT ${limit}`)
  if (offset) clauses.push(`OFFSET ${offset}`)
  sql += clauses.length > 0 ? " " + clauses.join(" ") : ""
  const result = await query(sql, values)
  return result.rows
}

export async function findFirst(table, where) {
  const rows = await findMany(table, where, null, 1)
  return rows[0] || null
}

export async function create(table, data) {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`)
  const sql = `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`
  const result = await query(sql, values)
  return result.rows[0]
}

export async function upsert(table, where, data) {
  const existing = await findFirst(table, where)
  if (existing) {
    return update(table, where, data)
  }
  return create(table, { ...where, ...data })
}

export async function update(table, where, data) {
  const whereKey = Object.keys(where)[0]
  const whereVal = Object.values(where)[0]
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`)
  const sql = `UPDATE "${table}" SET ${setClauses.join(", ")} WHERE "${whereKey}" = $${keys.length + 1} RETURNING *`
  const result = await query(sql, [...values, whereVal])
  return result.rows[0]
}

export async function count(table, where = {}) {
  const keys = Object.keys(where)
  if (keys.length === 0) {
    const result = await query(`SELECT COUNT(*) FROM "${table}"`)
    return parseInt(result.rows[0].count)
  }
  const conditions = keys.map((k, i) => `"${k}" = $${i + 1}`)
  const values = keys.map((k) => where[k])
  const result = await query(`SELECT COUNT(*) FROM "${table}" WHERE ${conditions.join(" AND ")}`, values)
  return parseInt(result.rows[0].count)
}

export default { query, findMany, findFirst, create, upsert, update, count }
