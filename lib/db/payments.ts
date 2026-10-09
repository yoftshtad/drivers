import { db, execute, executeOne, executeRun } from './index'
import type { PaymentRecord } from '@/lib/types'

function rowToPayment(row: any): PaymentRecord {
  return {
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
  }
}

export async function getPayments(): Promise<PaymentRecord[]> {
  const rows = await execute<any>('SELECT * FROM payments ORDER BY submitted_at DESC')
  return rows.map(rowToPayment)
}

export async function getPaymentById(id: string): Promise<PaymentRecord | null> {
  const row = await executeOne<any>('SELECT * FROM payments WHERE id = ?', [id])
  return row ? rowToPayment(row) : null
}

export async function createPayment(payment: Omit<PaymentRecord, 'id'> & { id?: string }): Promise<PaymentRecord> {
  const id = payment.id ?? `pay-${Date.now().toString(36)}`
  await executeRun(
    `INSERT INTO payments (id, user_name, user_email, user_phone, plan, amount, reference, status, submitted_at, reason, receipt_name, receipt_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payment.userName,
      payment.userEmail,
      payment.userPhone ?? null,
      payment.plan,
      payment.amount,
      payment.reference,
      payment.status,
      payment.submittedAt,
      payment.reason ?? null,
      payment.receiptName,
      payment.receiptUrl ?? null,
    ]
  )
  return { ...payment, id }
}

export async function updatePayment(id: string, status: PaymentRecord['status'], reason?: string): Promise<void> {
  await executeRun('UPDATE payments SET status = ?, reason = ? WHERE id = ?', [status, reason ?? null, id])
}

export async function deletePayment(id: string): Promise<void> {
  await executeRun('DELETE FROM payments WHERE id = ?', [id])
}