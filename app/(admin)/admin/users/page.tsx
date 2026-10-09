'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Trash2, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { updateUserAccess, useUsers, deleteUser, type AdminUser } from '@/lib/users-store'
import type { AccessState } from '@/lib/types'
import { cn } from '@/lib/utils'

const accessMeta: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  active: { label: 'Active', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  unpaid: { label: 'Unpaid', variant: 'secondary' },
}

function getAccessMeta(access: string) {
  return accessMeta[access] ?? { label: access, variant: 'secondary' as const }
}

export default function AdminUsersPage() {
  const users = useUsers()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all')
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null)
  const [pendingAction, setPendingAction] = useState<{ user: AdminUser; action: 'approve' | 'reject' } | null>(null)
  const [deletedName, setDeletedName] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchesQuery = `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())
        const matchesFilter = filter === 'all' || u.access === filter
        return matchesQuery && matchesFilter
      }),
    [users, query, filter],
  )

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteUser(pendingDelete.id)
    setDeletedName(pendingDelete.name)
    setPendingDelete(null)
    setTimeout(() => setDeletedName(null), 4000)
  }

  const confirmAction = async () => {
    if (!pendingAction) return
    setActionLoading(true)
    try {
      await updateUserAccess(pendingAction.user.id, pendingAction.action === 'approve' ? 'active' : 'rejected')
      setPendingAction(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Users</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{users.length} registered users. New signups appear here automatically.</p>
      </header>

      {deletedName && (
        <p className="mt-4 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm font-medium text-green-700 ring-1 ring-green-100">
          Account “{deletedName}” has been deleted.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pending', 'active', 'rejected'] as const).map((state) => (
            <button
              key={state}
              onClick={() => setFilter(state)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition-colors',
                filter === state ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-4 rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Student</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="pl-5">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email || u.phone || '—'}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={getAccessMeta(u.access).variant}>{getAccessMeta(u.access).label}</Badge>
                </TableCell>
                <TableCell>{u.attempts}</TableCell>
                <TableCell className="text-muted-foreground">{u.joined}</TableCell>
                <TableCell className="pr-5">
                  <div className="flex items-center justify-end gap-1.5">
                    {u.access === 'pending' && (
                      <>
                        <button
                          onClick={() => setPendingAction({ user: u, action: 'approve' })}
                          className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-700 transition-colors hover:bg-green-200"
                          aria-label={`Approve ${u.name}`}
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={() => setPendingAction({ user: u, action: 'reject' })}
                          className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-700 transition-colors hover:bg-red-200"
                          aria-label={`Reject ${u.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setPendingDelete(u)}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive"
                      aria-label={`Delete account ${u.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No users match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete ${pendingDelete?.name ?? 'this account'}?`}
        message={`This permanently removes ${pendingDelete?.email ?? 'the account'} and all associated data. This cannot be undone.`}
        confirmLabel="Delete account"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={!!pendingAction}
        title={pendingAction?.action === 'approve' ? `Approve ${pendingAction?.user.name}?` : `Reject ${pendingAction?.user.name}?`}
        message={pendingAction?.action === 'approve'
          ? `Grant dashboard access to ${pendingAction?.user.email ?? 'this user'}?`
          : `Deny access for ${pendingAction?.user.email ?? 'this user'}? They will be notified.`}
        confirmLabel={pendingAction?.action === 'approve' ? 'Approve' : 'Reject'}
        destructive={pendingAction?.action === 'reject'}
        loading={actionLoading}
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  )
}