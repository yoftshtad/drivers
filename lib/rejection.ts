'use client'

const REJECTION_KEY = 'dp.rejection'

export function getRejectionReason(): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(REJECTION_KEY) ?? 'The uploaded receipt could not be verified. Please make sure the amount, reference number and date are clearly visible.'
  } catch {
    return 'The uploaded receipt could not be verified. Please make sure the amount, reference number and date are clearly visible.'
  }
}

export function setRejectionReason(reason: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REJECTION_KEY, reason)
}