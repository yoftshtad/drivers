import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateQuestion, deleteQuestion } from '@/lib/db/questions'
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
    await updateQuestion(id, body)
    
    await logAdminAction(session.user.id, 'update_question', id, body)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /api/admin/questions/[id] error:', e)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
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
    await deleteQuestion(id)
    
    await logAdminAction(session.user.id, 'delete_question', id)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/questions/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}