import { NextRequest, NextResponse } from 'next/server'
import { getPayments, createPayment, updatePayment, deletePayment } from '@/lib/db/payments'

export async function GET() {
  try {
    const payments = await getPayments()
    return NextResponse.json({ payments })
  } catch (e) {
    console.error('GET /api/admin/payments error:', e)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payment = await createPayment(body)
    return NextResponse.json({ payment }, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/payments error:', e)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}