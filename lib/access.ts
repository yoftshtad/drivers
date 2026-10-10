'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'
import type { SessionUser, AccessState } from './types'
import { getRejectionReason, setRejectionReason } from './rejection'

export { getRejectionReason, setRejectionReason } from './rejection'
export { setAccessState } from './session'
export type { SessionUser, AccessState } from './types'

/**
 * Central access rule.
 * PENDING -> ACTIVE | REJECTED
 */
export function hasActiveAccess(state: AccessState): boolean {
  return state === 'active'
}

export function accessRedirect(state: AccessState): string {
  switch (state) {
    case 'active':
      return '/dashboard'
    case 'pending':
      return '/waiting'
    case 'rejected':
      return '/rejected'
    default:
      return '/waiting'
  }
}

export function useSession(): { user: SessionUser | null; access: AccessState; ready: boolean } {
  const { data: session, status } = useNextAuthSession()
  
  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    phone: undefined,
    role: session.user.role,
    access: session.user.access,
  } : null

  let access: AccessState = 'pending'
  if (user) {
    if (user.role === 'admin') access = 'active'
    else if (user.access === 'active') access = 'active'
  }

  return { user, access, ready: status !== 'loading' }
}

export function useAccess() {
  return useSession()
}