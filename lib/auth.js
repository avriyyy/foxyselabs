import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from './prisma'

const SESSION_COOKIE = 'foxyselabs_session'
const SESSION_TTL_DAYS = 30
const SESSION_SECRET = process.env.SESSION_SECRET || 'foxyselabs-dev-secret-change-in-production-please'

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verify(token) {
  if (!token || typeof token !== 'string') return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url')
  if (sig !== expected) return null
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString())
  } catch {
    return null
  }
}

export async function setSessionCookie(userId) {
  const expiresAt = Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  const token = sign({ userId, exp: expiresAt })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const payload = verify(token)
  if (!payload || !payload.userId) return null
  if (payload.exp && payload.exp < Date.now()) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, image: true, createdAt: true },
    })
    return user
  } catch {
    return null
  }
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }
  return user
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password, hash) {
  if (!hash) return false
  return bcrypt.compare(password, hash)
}

export async function registerUser({ email, name, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const err = new Error('Email already registered')
    err.status = 409
    throw err
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      password: passwordHash,
    },
  })

  return user
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }

  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }

  return user
}

export async function getOrCreateDemoUser() {
  let user = await prisma.user.findFirst({ where: { email: 'demo@foxyselabs.com' } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@foxyselabs.com',
        name: 'Demo User',
      },
    })
  }
  return user
}
