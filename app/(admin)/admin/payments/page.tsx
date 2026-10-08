'use client'

import { useState } from 'react'
import { CircleAlert, CheckCircle2, XCircle, Eye, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePayments, updatePayment } from '@/lib/payment-store'
import { AdminShell } from '@/components/app/admin-shell'

export default function AdminPaymentsPage() {
  const payments = usePayments()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const pendingPayments = payments.filter(p => p.status === 'pending')
  const approvedPayments = payments.filter(p => p.status === 'approved')
  const rejectedPayments = payments.filter(p => p.status === 'rejected')

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setProcessingId(id)
    try {
      updatePayment(id, status, reason)
    } finally {
      setProcessingId(null)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
    }
  }

  const renderPayments = (list: typeof payments, emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
            {emptyMessage}
          </TableCell>
        </TableRow>
      )
    }
    return list.map((p) => (
      <TableRow key={p.id}>
        <TableCell className="pl-5">
          <p className="font-semibold">{p.userName}</p>
          <p className="text-xs text-muted-foreground">{p.userEmail || p.userPhone || '—'}</p>
        </TableCell>
        <TableCell className="text-muted-foreground">{p.submittedAt}</TableCell>
        <TableCell className="text-muted-foreground">{p.reference}</TableCell>
        <TableCell className="max-w-40 truncate text-muted-foreground">{p.receiptName}</TableCell>
        <TableCell className="text-muted-foreground">{p.plan}</TableCell>
        <TableCell className="text-center">{statusBadge(p.status)}</TableCell>
        <TableCell className="pr-5 text-right">
          {p.status === 'pending' ? (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={processingId === p.id}
                onClick={() => handleStatusChange(p.id, 'approved')}
              >
                {processingId === p.id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={processingId === p.id}
                onClick={() => {
                  const reason = prompt('Rejection reason (optional):')
                  if (reason !== null) handleStatusChange(p.id, 'rejected', reason)
                }}
              >
                {processingId === p.id ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
              </Button>
            </div>
          ) : p.status === 'rejected' && p.reason ? (
            <p className="text-xs text-destructive text-right max-w-48 truncate" title={p.reason}>{p.reason}</p>
          ) : null}
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Payment Verification</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Review and approve or reject pending payment screenshots.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="mt-1 text-3xl font-extrabold text-amber-600">{pendingPayments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="mt-1 text-3xl font-extrabold text-green-600">{approvedPayments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="mt-1 text-3xl font-extrabold text-red-600">{rejectedPayments.length}</p>
            </CardContent>
          </Card>
        </div>

        <section className="rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
          <CardHeader className="p-5 pb-2">
            <CardTitle>Payments Awaiting Verification</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderPayments(pendingPayments, 'No pending payments')}
              </TableBody>
            </Table>
          </CardContent>
        </section>

        <section className="mt-6 rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
          <CardHeader className="p-5 pb-2">
            <CardTitle>Approved Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderPayments(approvedPayments, 'No approved payments')}
              </TableBody>
            </Table>
          </CardContent>
        </section>

        <section className="mt-6 rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
          <CardHeader className="p-5 pb-2">
            <CardTitle>Rejected Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="pr-5 text-right">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderPayments(rejectedPayments, 'No rejected payments')}
              </TableBody>
            </Table>
          </CardContent>
        </section>
      </div>
    </AdminShell>
  )
}