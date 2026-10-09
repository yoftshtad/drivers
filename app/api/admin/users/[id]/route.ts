import { NextRequest, NextResponse } from 'next/server'
import { updateUserAccess, deleteUser } from '@/lib/db/users'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    await updateUserAccess(id, body.access)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /api/admin/users/[id] error:', e)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteUser(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/users/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}