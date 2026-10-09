import { NextRequest, NextResponse } from 'next/server'
import { deleteQuestionnaire } from '@/lib/db/questionnaires'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteQuestionnaire(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/questionnaires/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete questionnaire' }, { status: 500 })
  }
}