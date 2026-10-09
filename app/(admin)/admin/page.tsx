'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BookOpen, CircleAlert, ClipboardCheck, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUsers } from '@/lib/users-store'
import { usePayments } from '@/lib/payment-store'
import { useAttempts } from '@/lib/attempt-store'

export default function AdminDashboardPage() {
  const users = useUsers()
  const payments = usePayments()
  const attempts = useAttempts()

  const totalStudents = users.length
  const activeUsers = users.filter(u => u.access === 'active').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const totalAttempts = attempts.length
  const totalQuestionsAnswered = attempts.reduce((sum, a) => sum + a.total, 0)
  const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0)
  const avgScore = totalAttempts > 0 ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) : 0

  const mockTests = attempts.filter(a => a.mode === 'mock')
  const mockPassRate = mockTests.length > 0
    ? Math.round((mockTests.filter(a => a.passed).length / mockTests.length) * 100)
    : 0

  const pendingPaymentList = payments.filter(p => p.status === 'pending')
  const pendingUserList = users.filter(u => u.access === 'pending')

  const scoreData = [
    { module: 'Traffic Signs', avg: 0 },
    { module: 'Road Rules', avg: 0 },
    { module: 'Defensive Driving', avg: 0 },
    { module: 'Vehicle Knowledge', avg: 0 },
  ]

  const pendingUserCount = users.filter(u => u.access === 'pending').length
  const totalPending = pendingPayments + pendingUserCount

  const stats = [
    { icon: Users, label: 'Total students', value: totalStudents, delta: `${activeUsers} active`, tone: 'bg-blue-50 text-blue-600' },
    { icon: CircleAlert, label: 'Pending review', value: totalPending, delta: totalPending > 0 ? 'Needs review' : 'All clear', tone: 'bg-amber-50 text-amber-600' },
    { icon: ClipboardCheck, label: 'Active access', value: activeUsers, delta: totalStudents > 0 ? `${Math.round((activeUsers / totalStudents) * 100)}% activation` : '0% activation', tone: 'bg-green-50 text-green-600' },
    { icon: ClipboardCheck, label: 'Total attempts', value: totalAttempts, delta: `${totalQuestionsAnswered} questions answered`, tone: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">Overview of students, payments and content health.</p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, delta, tone }) => (
          <div key={label} className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
            <div className="flex items-center justify-between">
              <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-extrabold">{value}</p>
            <p className="mt-0.5 text-sm font-semibold">{label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{delta}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
          <div className="flex items-center justify-between p-5 pb-2">
            <h2 className="text-base font-extrabold">Awaiting verification</h2>
            <Link href="/admin/payments" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="pr-5 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPaymentList.length > 0 || pendingUserList.length > 0 ? (
                <>
                  {pendingPaymentList.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-5">
                        <p className="font-semibold">{p.userName}</p>
                        <p className="text-xs text-muted-foreground">{p.userEmail || p.userPhone || '—'}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.submittedAt}</TableCell>
                      <TableCell className="max-w-40 truncate text-muted-foreground">{p.receiptName}</TableCell>
                      <TableCell className="pr-5 text-right">
                        <a href={`/admin/payments/${p.id}`} className="text-sm font-semibold text-primary hover:underline">
                          Review
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingUserList.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="pl-5">
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email || u.phone || '—'}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.joined}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">Account pending</span>
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <a href={`/admin/users`} className="text-sm font-semibold text-primary hover:underline">
                          Approve
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No pending payments or accounts
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
          <h2 className="text-base font-extrabold">Performance overview</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">Average score</p>
              <p className="mt-1 text-2xl font-extrabold">{avgScore}%</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">Mock pass rate</p>
              <p className="mt-1 text-2xl font-extrabold">{mockPassRate}%</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-muted/60 p-6">
        <h2 className="text-base font-extrabold">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <Link href="/admin/payments" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Verify pending payments
          </Link>
          <Link href="/admin/questions/new" className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted">
            Add question
          </Link>
          <Link href="/admin/questions/import" className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted">
            Import from Excel
          </Link>
          <Link href="/admin/questionnaires/new" className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted">
            Create questionnaire
          </Link>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="warning">MVP</Badge> Payments are verified manually — approve only after checking the receipt against the transfer records.
        </p>
      </section>
    </div>
  )
}