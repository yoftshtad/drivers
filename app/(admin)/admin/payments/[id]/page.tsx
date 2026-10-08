'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, ArrowLeft, FileText, Eye, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPayments, updatePayment } from '@/lib/payment-store'
import { AdminShell } from '@/components/app/admin-shell'

export default function AdminPaymentReviewPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.id as string
  const [payment, setPayment] = useState<ReturnType<typeof getPayments>[0] | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const payments = getPayments()
    const found = payments.find(p => p.id === paymentId)
    setPayment(found ?? null)
    setLoading(false)
  }, [paymentId])

  const handleApprove = async () => {
    if (!payment) return
    setProcessing(true)
    try {
      updatePayment(payment.id, 'approved')
      router.push('/admin/payments')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!payment) return
    const reason = prompt('Enter rejection reason:')
    if (reason === null) return
    setProcessing(true)
    try {
      updatePayment(payment.id, 'rejected', reason)
      router.push('/admin/payments')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AdminShell>
    )
  }

  if (!payment) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-3xl text-center py-12">
          <AlertCircle className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Payment not found</h1>
          <p className="mt-2 text-muted-foreground">The payment record you&apos;re looking for doesn&apos;t exist.</p>
          <Button className="mt-6" onClick={() => router.push('/admin/payments')}>
            <ArrowLeft className="mr-2 size-4" /> Back to payments
          </Button>
        </div>
      </AdminShell>
    )
  }

  const statusBadge = () => {
    switch (payment.status) {
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
    }
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/payments')}>
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {statusBadge()}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{payment.userName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Email / Phone</p>
                <p className="font-medium">{payment.userEmail || payment.userPhone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">{payment.submittedAt}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-mono font-medium">{payment.reference}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">{payment.plan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">{payment.amount.toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receipt</p>
                <p className="font-medium text-primary hover:underline cursor-pointer">{payment.receiptName}</p>
              </div>
            </div>

            {payment.receiptUrl && (
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <p className="text-sm font-medium mb-2">Payment Screenshot</p>
                <img
                  src={payment.receiptUrl}
                  alt="Payment receipt"
                  className="max-h-96 w-full object-contain rounded-lg border border-border/70"
                />
              </div>
            )}

            {payment.reason && payment.status === 'rejected' && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="size-4" />
                  <p className="font-medium">Rejection Reason</p>
                </div>
                <p className="mt-2 text-sm">{payment.reason}</p>
              </div>
            )}

            {payment.status === 'pending' && (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4 border-t border-border/70">
                <Button
                  variant="destructive"
                  size="lg"
                  disabled={processing}
                  onClick={handleReject}
                  className="w-full sm:w-auto"
                >
                  {processing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <XCircle className="mr-2 size-4" />}
                  Reject
                </Button>
                <Button
                  size="lg"
                  disabled={processing}
                  onClick={handleApprove}
                  className="w-full sm:w-auto"
                >
                  {processing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
                  Approve
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}