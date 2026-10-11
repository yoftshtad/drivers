import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateUserAccess, deleteUser } from '@/lib/db/users'
import { logAdminAction, type AuditAction } from '@/lib/db/audit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    await updateUserAccess(id, body.access)
    
    const action: AuditAction = body.access === 'active' ? 'approve_user' : 'reject_user'
    await logAdminAction(session.user.id, action, id, { newAccess: body.access })
    
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
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await deleteUser(id)
    
    await logAdminAction(session.user.id, 'delete_user', id)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/users/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}