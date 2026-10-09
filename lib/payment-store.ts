'use client'

import { useEffect, useState } from 'react'
import type { PaymentRecord } from './types'

async function fetchPayments(): Promise<PaymentRecord[]> {
  const res = await fetch('/api/admin/payments', { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data.payments ?? []
}

export async function getPayments(): Promise<PaymentRecord[]> {
  if (typeof window === 'undefined') return []
  return fetchPayments()
}

export async function createPayment(payment: Omit<PaymentRecord, 'id'> & { id?: string }): Promise<PaymentRecord> {
  const res = await fetch('/api/admin/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment),
  })
  if (!res.ok) throw new Error('Failed to create payment')
  const data = await res.json()
  return data.payment
}

export async function updatePayment(id: string, status: PaymentRecord['status'], reason?: string): Promise<void> {
  const res = await fetch(`/api/admin/payments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason }),
  })
  if (!res.ok) throw new Error('Failed to update payment')
}

export async function deletePayment(id: string): Promise<void> {
  const res = await fetch(`/api/admin/payments/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete payment')
}

export function subscribePayments(listener: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('dp.payments-change', listener)
  return () => window.removeEventListener('dp.payments-change', listener)
}

export function usePayments(): PaymentRecord[] {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await fetchPayments()
      if (mounted) {
        setPayments(data)
        setLoading(false)
      }
    }
    load()
    const unsub = subscribePayments(() => load())
    return () => { mounted = false; unsub() }
  }, [])

  return payments
}