import { NextRequest, NextResponse } from 'next/server'
import { db, execute } from '@/lib/db/index'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    let payments
    if (userId) {
      const rows = await execute<any>('SELECT * FROM payments WHERE user_id = ? ORDER BY submitted_at DESC', [userId])
      payments = rows.map((row: any) => ({
        id: row.id,
        userName: row.user_name,
        userEmail: row.user_email,
        userPhone: row.user_phone,
        plan: row.plan,
        amount: row.amount,
        reference: row.reference,
        status: row.status,
        submittedAt: row.submitted_at,
        reason: row.reason,
        receiptName: row.receipt_name,
        receiptUrl: row.receipt_url,
      }))
    } else {
      const rows = await execute<any>('SELECT * FROM payments ORDER BY submitted_at DESC')
      payments = rows.map((row: any) => ({
        id: row.id,
        userName: row.user_name,
        userEmail: row.user_email,
        userPhone: row.user_phone,
        plan: row.plan,
        amount: row.amount,
        reference: row.reference,
        status: row.status,
        submittedAt: row.submitted_at,
        reason: row.reason,
        receiptName: row.receipt_name,
        receiptUrl: row.receipt_url,
      }))
    }
    return NextResponse.json({ payments })
  } catch (e) {
    console.error('GET /api/admin/payments error:', e)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { createPayment } = await import('@/lib/db/payments')
    const payment = await createPayment(body)
    return NextResponse.json({ payment }, { status: 201 })
  } catch (e: any) {
    console.error('POST /api/admin/payments error:', e)
    return NextResponse.json({ error: e.message ?? 'Failed to create payment' }, { status: 500 })
  }
}