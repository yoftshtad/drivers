'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function WaitingPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

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
    // If access is 'pending', stay on waiting page
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-xl py-16 px-5 text-center">
        <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-amber-100">
          <span className="size-12 text-amber-600">⏳</span>
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Loading…</h1>
        <p className="mt-3 max-w-md mx-auto text-sm leading-6 text-muted-foreground">
          Checking your verification status…
        </p>
      </div>
    )
  }

  if (!session?.user) {
    return null // Will redirect to login
  }

  return (
    <div className="mx-auto max-w-xl py-16 px-5 text-center">
      <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-amber-100">
        <span className="size-12 text-amber-600">⏳</span>
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Waiting for approval</h1>
      <p className="mt-3 max-w-md mx-auto text-sm leading-6 text-muted-foreground">
        Your account has been created and is pending admin review. An admin will verify your payment
        on Telegram and activate your access.
      </p>

      <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-600">
          <span className="size-4">⏳</span> Status: Pending admin verification
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Please wait until an admin verifies your payment on Telegram. You&apos;ll be redirected automatically once approved.
        </p>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">This page checks for updates automatically. You&apos;ll be redirected once approved.</p>
    </div>
  )
}