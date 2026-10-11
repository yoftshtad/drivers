import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateModule, deleteModule } from '@/lib/db/modules'
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
    await updateModule(id, body)
    
    await logAdminAction(session.user.id, 'update_module', id, body)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /api/admin/modules/[id] error:', e)
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
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
    await deleteModule(id)
    
    await logAdminAction(session.user.id, 'delete_module', id)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/modules/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}