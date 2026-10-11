import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteQuestionnaire } from '@/lib/db/questionnaires'
import { logAdminAction, type AuditAction } from '@/lib/db/audit'

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
    await deleteQuestionnaire(id)
    
    await logAdminAction(session.user.id, 'delete_questionnaire', id)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/questionnaires/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete questionnaire' }, { status: 500 })
  }
}