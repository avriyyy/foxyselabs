import { NextRequest, NextResponse } from 'next/server'
import { loginUser, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await loginUser({
      email: String(email).toLowerCase().trim(),
      password: String(password),
    })

    await setSessionCookie(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    })
  } catch (error: any) {
    console.error('POST /api/auth/login error:', error)
    const status = error.status || 500
    const message = error.status ? 'Invalid email or password' : (error.message || 'Failed to login')
    return NextResponse.json({ error: message }, { status })
  }
}
