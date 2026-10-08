'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleAlert, CircleCheck, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { OnboardingGuard } from '@/components/app/onboarding-guard'
import { Stepper } from '@/components/app/stepper'
import { setAccessState } from '@/lib/access'
import { createPayment } from '@/lib/payment-store'
import { getUser } from '@/lib/session'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const MAX_SIZE_MB = 5
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']

export default function PaymentUploadPage() {
  return (
    <OnboardingGuard>
      <UploadForm />
    </OnboardingGuard>
  )
}

function UploadForm() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>('')

  const pick = (selected: File | undefined) => {
    setError(null)
    if (!selected) return
    if (!ACCEPTED.includes(selected.type)) {
      setError('Invalid file type. Please upload a PNG, JPG or WEBP screenshot.')
      return
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return
    }
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const fileToDataUrl = (f: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(f)
    })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a screenshot of your payment receipt first.')
      return
    }
    setSubmitting(true)
    setError(null)
    setProcessing(true)
    setProcessingStep('Saving payment record…')

    try {
      const receiptUrl = await fileToDataUrl(file)

      const user = getUser()
      const isEmail = user?.email?.includes('@')
      const reference = `DP-${Date.now().toString(36).toUpperCase()}`

      setProcessingStep('Creating payment record…')
      createPayment({
        userName: user?.name ?? 'Student',
        userEmail: isEmail ? user?.email ?? '' : '',
        userPhone: isEmail ? undefined : user?.email,
        plan: 'Premium Access',
        amount: 2500,
        reference,
        status: 'pending',
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        receiptName: file.name,
        receiptUrl,
      })

      setProcessingStep('Sending screenshot to admin on Telegram…')

      const formData = new FormData()
      const blob = new Blob([file], { type: file.type })
      formData.append('file', blob, file.name)
      formData.append('userName', getUser()?.name ?? 'Student')
      formData.append('userEmail', getUser()?.email ?? '')
      formData.append('userPhone', getUser()?.phone ?? '')

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 50000)

      const response = await fetch('/api/telegram/screenshot', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.error ?? 'Failed to send screenshot to Telegram')
      }

      setProcessingStep('Screenshot sent! Redirecting…')
      setAccessState('pending')
      
      // Small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/waiting')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process upload. Please try again.')
      setProcessing(false)
    }
  }

  return (
    <div>
      <Stepper current={2} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Upload payment screenshot</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Attach a clear screenshot showing the amount, reference number and date. Files up to {MAX_SIZE_MB}MB (PNG, JPG, WEBP).
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
          aria-label="Payment screenshot"
        />

        {preview ? (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5">
              <p className="max-w-64 truncate text-sm font-semibold">{file?.name}</p>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                onClick={() => {
                  setFile(null)
                  setPreview(null)
                  if (inputRef.current) inputRef.current.value = ''
                }}
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
            <img src={preview} alt="Payment receipt preview" className="max-h-96 w-full object-contain" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-14 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <ImagePlus className="size-6 text-primary" />
            </span>
            <span className="text-sm font-semibold text-foreground">Click to select your screenshot</span>
            <span className="text-xs text-muted-foreground">or drag and drop it here</span>
          </button>
        )}

        {error && (
          <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
            <CircleAlert className="size-4 shrink-0" /> {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting || processing} className="h-12 w-full text-sm">
          {processing ? (
            <>
              <Loader2 className="size-4 animate-spin" /> {processingStep}
            </>
          ) : submitting ? (
            'Submitting…'
          ) : (
            'Submit for verification'
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Your screenshot will be sent to the admin on Telegram for verification.</p>
      </form>

      {processing && (
        <ConfirmDialog
          open={processing}
          title="Processing your upload"
          message={processingStep}
          confirmLabel="Cancel"
          destructive={false}
          onConfirm={() => {
            setProcessing(false)
            setSubmitting(false)
          }}
          onCancel={() => {}}
        />
      )}
    </div>
  )
}

const pick = (selected: File | undefined) => {}