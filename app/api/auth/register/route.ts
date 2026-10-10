import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, identifier, password } = await request.json()

    if (!name || !identifier || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const isEmail = identifier.includes('@')
    const normalized = identifier.trim().toLowerCase()

    // Check if user already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ? OR phone = ?',
      args: [isEmail ? normalized : null, isEmail ? null : normalized],
    })

    if (existing.rows[0]) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const id = `u-${crypto.randomUUID()}`
    const now = new Date().toISOString()
    const joinedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    await db.execute({
      sql: `INSERT INTO users (id, name, email, phone, password_hash, role, plan, access_state, joined_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        name,
        isEmail ? normalized : null,
        isEmail ? null : normalized,
        passwordHash,
        'student',
        'free',
        'pending',
        joinedAt,
        now,
        now,
      ],
    })

    return NextResponse.json({ user: { id, name, email: isEmail ? normalized : '', phone: isEmail ? '' : normalized } }, { status: 201 })
  } catch (e) {
    console.error('Registration error:', e)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}