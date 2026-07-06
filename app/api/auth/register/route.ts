import { NextRequest, NextResponse } from 'next/server'
import { registerUser, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const user = await registerUser({
      email: email.toLowerCase().trim(),
      name: typeof name === 'string' ? name.trim() : null,
      password,
    })

    await setSessionCookie(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/auth/register error:', error)
    const status = error.status || 500
    const message = error.message || 'Failed to register'
    return NextResponse.json({ error: message }, { status })
  }
}
