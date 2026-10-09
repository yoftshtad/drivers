import { NextRequest, NextResponse } from 'next/server'
import { getUsers, createUser, updateUserAccess, deleteUser } from '@/lib/db/users'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    
    if (email) {
      const user = await getUserByEmail(email)
      return NextResponse.json({ users: user ? [user] : [] })
    }
    if (phone) {
      const users = await getUsers()
      const user = users.find(u => u.phone === phone)
      return NextResponse.json({ users: user ? [user] : [] })
    }
    
    const users = await getUsers()
    return NextResponse.json({ users })
  } catch (e) {
    console.error('GET /api/admin/users error:', e)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await createUser(body)
    return NextResponse.json({ user }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/users error:', e)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}