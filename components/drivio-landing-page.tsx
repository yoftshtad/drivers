'use client'

import { useState } from 'react'
import { ArrowRight, BookOpen, Check, ClipboardCheck, Menu, ShieldCheck, Trophy, X } from 'lucide-react'
import { FAQ, Logo, PlanPreview } from './drivio/shared'

const features = [
  [ClipboardCheck, 'Practice-style questions', 'Built around the learner test structure.'],
  [BookOpen, 'Study signs, rules & controls', 'Clear study cards for the topics that matter.'],
  [ShieldCheck, 'Clear explanations', 'Simple feedback after each practice answer.'],
  [Trophy, 'Full mock test', 'Practise section results before test day.'],
  [Check, 'Free starter access', 'Start focused, then upgrade when ready.'],
] as const

export default function DrivioLandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [practiceAnswer, setPracticeAnswer] = useState<'correct' | 'review' | null>(null)

  return <main id="top" className="min-h-screen bg-background text-foreground">
    <section className="mx-auto max-w-[1280px] border-x border-border/70 bg-card">
      <nav className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-4 lg:px-8">
        <Logo />
        <div className="hidden items-center gap-2 md:flex">
          {['How it works', 'Features', 'Pricing', 'FAQ'].map((item) => <a key={item} href={`#${item === 'How it works' ? 'how-it-works' : item.toLowerCase()}`} className="rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-card hover:text-foreground">{item}</a>)}
          <a href="/login" className="ml-2 rounded-lg border border-primary/50 px-3 py-2 text-xs font-bold text-primary">Log in</a>
          <a href="/register" className="rounded-lg bg-[#f59e0b] px-4 py-2.5 text-xs font-bold text-[#172033] shadow-sm">Free access</a>
        </div>
        <button className="rounded-lg p-2 md:hidden" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
      </nav>
      {mobileOpen && <div className="flex flex-col gap-2 border-b border-border px-5 py-4 md:hidden"><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="/register" className="rounded-lg bg-[#f59e0b] px-4 py-3 text-center font-bold">Free access</a></div>}

      <div className="grid gap-10 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-10 lg:py-16">
        <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">A calmer way to prepare</p><h1 className="mt-5 text-balance text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl">Get ready<br />for your<br />learner&apos;s test</h1><p className="mt-7 max-w-md text-base leading-7 text-muted-foreground">A mobile-first study app with practice-style questions, clear explanations, and a full mock test simulation.</p><div className="mt-7 flex flex-wrap gap-3"><a href="/dashboard" className="rounded-lg bg-[#f59e0b] px-4 py-3 text-sm font-bold text-[#172033]">Open dashboard <ArrowRight className="ml-1 inline size-4" /></a><a href="/register" className="rounded-lg border border-primary px-4 py-3 text-sm font-bold text-primary">Start quick quiz</a></div><div className="mt-6 grid gap-2 text-sm font-semibold text-muted-foreground sm:grid-cols-2"><span>▣ Free access</span><span>✓ Learner-safe content</span><span>♧ Full access upgrade</span></div></div>
        <PlanPreview />
      </div>
    </section>

    <section id="features" className="mx-auto grid max-w-[1280px] grid-cols-2 border-x border-y border-border/70 bg-[#eefafa] sm:grid-cols-5">{features.map(([Icon, title, text]) => <article key={title} className="border-border/70 p-5 text-center sm:border-r last:border-r-0"><span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm"><Icon className="size-5" /></span><h2 className="mt-4 text-sm font-black leading-tight">{title}</h2><p className="mt-3 text-xs leading-5 text-muted-foreground">{text}</p></article>)}</section>

    <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How it works</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Study, practice, and feel ready.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{[['01', 'Study', 'Review signs, rules, and controls through clear study cards.'], ['02', 'Practice', 'Answer practice-style questions and get instant feedback.'], ['03', 'Mock test', 'Take a full practice simulation and see section results.']].map(([number, title, text]) => <article key={number} className="rounded-2xl border border-border bg-card p-7 shadow-sm"><span className="text-xs font-black text-primary">{number}</span><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div></section>

    <section className="bg-[#eefafa] px-5 py-20"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Your progress</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your progress, all in one place.</h2><p className="mt-4 max-w-md leading-7 text-muted-foreground">Track section readiness, review results, and focus on what matters next.</p><ul className="mt-7 space-y-3 text-sm font-semibold"><li>✓ Section readiness overview</li><li>✓ Quick access to Study, Practice, and Mock Test</li><li>✓ Results and weak areas at a glance</li></ul></div><div className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-bold">Mock result</span><strong className="text-3xl text-primary">76%</strong></div>{[['Road Signs', 80], ['Rules of the Road', 70], ['Vehicle Controls', 65]].map(([label, value]) => <div key={label} className="mt-6"><div className="flex justify-between text-xs font-bold"><span>{label}</span><span>{value}%</span></div><div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div></div>)}</div></div></section>

    <section id="pricing" className="mx-auto max-w-6xl px-5 py-20 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Simple pricing</p><h2 className="mt-3 text-3xl font-black">Upgrade when you&apos;re ready.</h2><p className="mt-4 text-muted-foreground">Start free. Upgrade only when you want extra practice.</p></div><div className="mx-auto mt-10 max-w-md rounded-2xl border-2 border-primary bg-card p-7 shadow-lg"><div className="flex items-center justify-between"><h3 className="text-xl font-black">Full access</h3><span className="rounded-full bg-[#f59e0b] px-3 py-1 text-xs font-black">POPULAR</span></div><p className="mt-4 text-4xl font-black">R99 <span className="text-sm font-medium text-muted-foreground">/ month</span></p><ul className="mt-6 space-y-3 text-sm"><li>✓ Unlimited practice questions</li><li>✓ Full mock test simulations</li><li>✓ Detailed progress tracking</li></ul><a href="/register" className="mt-7 block rounded-lg bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">Get full access</a></div></section>

    <section id="practice" className="mx-auto max-w-6xl px-5 pb-20 lg:px-8"><div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground"><h2 className="text-3xl font-black">Start with one question.</h2>{practiceStarted ? <div className="mx-auto mt-7 max-w-md rounded-xl bg-card p-5 text-left text-card-foreground"><p className="font-bold">What should you do at a stop sign?</p><div className="mt-4 space-y-2"><button onClick={() => setPracticeAnswer('review')} className="w-full rounded-lg border border-border px-4 py-3 text-left text-sm">Slow down and continue</button><button onClick={() => setPracticeAnswer('correct')} className="w-full rounded-lg bg-[#f59e0b] px-4 py-3 text-left text-sm font-bold">Come to a complete stop</button>{practiceAnswer && <p role="status" className="rounded-lg bg-secondary px-4 py-3 text-sm">{practiceAnswer === 'correct' ? 'Correct. Stop completely before proceeding.' : 'Not quite. Stop completely, then check traffic.'}</p>}</div></div> : <button onClick={() => setPracticeStarted(true)} className="mt-7 rounded-lg bg-card px-5 py-3 text-sm font-bold text-card-foreground">Try a practice question <ArrowRight className="ml-1 inline size-4" /></button>}</div></section>
    <section id="faq" className="mx-auto max-w-3xl px-5 pb-20"><h2 className="mb-6 text-3xl font-black">Good to know.</h2><FAQ /></section>
    <footer className="border-t border-border bg-card px-5 py-7"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row"><Logo /><span>Made for calmer test days.</span><span>© 2026 Drivio</span></div></footer>
  </main>
}

export { DrivioLandingPage }
