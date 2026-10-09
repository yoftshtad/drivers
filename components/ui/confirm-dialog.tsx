'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', destructive = true, loading = false, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-5" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${destructive ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-bold">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2.5">
          <Button variant="outline" className="h-10 flex-1 text-sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            className={`h-10 flex-1 text-sm ${destructive ? 'bg-red-600 text-white hover:bg-red-700' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
