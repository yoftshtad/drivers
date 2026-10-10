'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleAlert } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function RejectedPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/login')
      return
    }
    const { role, access } = session.user
    if (role === 'admin') {
      router.push('/admin')
    } else if (access === 'active') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'loading' || !session?.user) return
    // Fetch rejection reason from payment record
    fetch(`/api/admin/payments?userId=${session.user.id}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const rejectedPayment = data.payments?.find((p: any) => p.status === 'rejected')
        if (rejectedPayment?.reason) {
          setRejectionReason(rejectedPayment.reason)
        }
      })
      .catch(() => {})
  }, [status, session])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" aria-label="Loading" />
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="mx-auto max-w-xl py-16 px-5 text-center">
      <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-red-100">
        <CircleAlert className="size-12 text-red-600" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Access denied</h1>
      <p className="mt-3 max-w-md mx-auto text-sm leading-6 text-muted-foreground">
        Your account was not approved. Please contact support if you believe this is a mistake, or create a new account
        with correct payment information.
      </p>
      {rejectionReason && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left">
          <p className="text-sm font-medium text-destructive">Rejection reason:</p>
          <p className="mt-2 text-sm text-muted-foreground">{rejectionReason}</p>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/register"
          className="flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create new account
        </Link>
        <Link
          href="/login"
          className="flex h-11 items-center justify-center rounded-lg border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}