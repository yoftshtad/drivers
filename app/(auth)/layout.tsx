'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { SteeringWheelIcon } from '@/components/app/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#4c1d95_0%,#6d28d9_45%,#8b5cf6_100%)] p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-white/10 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <SteeringWheelIcon className="size-6" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold tracking-tight">DrivePrep</span>
            <span className="text-[11px] font-medium text-primary-foreground/70">Prepare. Practice. Pass.</span>
          </span>
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-balance">Everything you need to pass your driver&apos;s license exam.</h2>
          <p className="mt-4 leading-7 text-primary-foreground/75">
            Structured modules, practice questions with instant feedback, and timed mock tests that simulate the real exam.
          </p>
          <ul className="mt-8 flex flex-col gap-3.5 text-sm">
            {['4 learning modules with videos and materials', '450+ practice questions with explanations', 'Timed mock tests with pass/fail scoring', 'Track progress and weak categories'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex size-5.5 items-center justify-center rounded-full bg-white/20">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/60">© 2026 DrivePrep. Prepare. Practice. Pass.</p>
      </aside>
      <main className="flex items-center justify-center bg-background px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
