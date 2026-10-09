import { NextRequest, NextResponse } from 'next/server'
import { updateQuestion, deleteQuestion } from '@/lib/db/questions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    await updateQuestion(id, body)
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
    const { id } = await params
    await deleteQuestion(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/questions/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}