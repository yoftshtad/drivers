import { NextRequest, NextResponse } from 'next/server'
import { updateModule, deleteModule } from '@/lib/db/modules'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    await updateModule(id, body)
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
    const { id } = await params
    await deleteModule(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/modules/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}