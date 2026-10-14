'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell, BookOpen, Bookmark, ChevronDown, ClipboardList, CreditCard, Headphones,
  Home, CircleHelp, LogOut, Menu, Settings, User, X,
} from 'lucide-react'
import { DrivePrepLogo } from './logo'
import { initials, signOut } from '@/lib/session'
import { accessRedirect, useSession } from '@/lib/access'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/learning', label: 'Learning', icon: BookOpen },
  { href: '/questionnaires', label: 'Questionnaire', icon: CircleHelp },
  { href: '/mock-tests', label: 'Mock Tests', icon: ClipboardList },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: Headphones },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
              active ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground/70 hover:bg-muted hover:text-foreground',
            )}
          >
            {active && <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" aria-hidden />}
            <Icon className="size-4.5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}



function AccountMenu() {
  const { user } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-3 rounded-xl py-1.5 pr-2 pl-1.5 transition-colors hover:bg-muted"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
          {initials(user?.name ?? 'John Doe')}
        </span>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-sm font-bold text-foreground">{user?.name ?? 'John Doe'}</span>
          <span className="text-xs text-muted-foreground">Premium Member</span>
        </span>
        <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card py-1.5 shadow-lg">
          <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted">
            <User className="size-4 text-muted-foreground" /> Profile
          </Link>
          <Link role="menuitem" href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted">
            <Settings className="size-4 text-muted-foreground" /> Settings
          </Link>
          <button
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-muted"
            onClick={() => {
              setOpen(false)
              signOut()
              router.push('/login')
            }}
          >
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

export function StudentShell({ children }: { children: React.ReactNode }) {
  const { user, access, ready } = useSession()
  const router = useRouter()
  const [drawer, setDrawer] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!user) router.replace('/login')
    else if (access !== 'active') router.replace(accessRedirect(access))
  }, [ready, user, access, router])

  if (!ready || !user || access !== 'active') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" aria-label="Loading" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card">
        <div className="flex h-18 items-center justify-between gap-4 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <DrivePrepLogo />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/help" className="relative rounded-full p-2.5 transition-colors hover:bg-muted" aria-label="Notifications">
              <Bell className="size-5 text-foreground/70" />
              <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
            </Link>
            <AccountMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-18 hidden h-[calc(100vh-4.5rem)] w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-border/70 bg-card p-4 lg:flex">
          <NavLinks />
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/40" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border/70 p-4">
                <DrivePrepLogo tagline={false} />
                <button className="rounded-lg p-2 hover:bg-muted" onClick={() => setDrawer(false)} aria-label="Close menu">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
                <NavLinks onNavigate={() => setDrawer(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
