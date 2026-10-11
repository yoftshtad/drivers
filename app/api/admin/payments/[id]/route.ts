import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updatePayment, deletePayment } from '@/lib/db/payments'
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
    await updatePayment(id, body.status, body.reason)
    
    const action: AuditAction = body.status === 'approved' ? 'approve_payment' : 'reject_payment'
    await logAdminAction(session.user.id, action, id, { newStatus: body.status, reason: body.reason })
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /api/admin/payments/[id] error:', e)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
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
    await deletePayment(id)
    
    await logAdminAction(session.user.id, 'delete_payment', id)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/payments/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}