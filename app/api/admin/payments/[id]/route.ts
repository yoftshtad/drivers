import { NextRequest, NextResponse } from 'next/server'
import { updatePayment, deletePayment } from '@/lib/db/payments'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    await updatePayment(id, body.status, body.reason)
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
    const { id } = await params
    await deletePayment(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/payments/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}