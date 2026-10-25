'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { DASHBOARD_IMAGE, faqs } from './content'

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return <a href="#top" className="flex items-center gap-2" aria-label="Drivio home"><span className={`flex size-9 items-center justify-center rounded-lg ${inverse ? 'bg-card text-primary' : 'bg-primary text-primary-foreground'}`}><span className="font-black">D</span></span><span className={`text-lg font-black tracking-tight ${inverse ? 'text-primary-foreground' : 'text-foreground'}`}>drivio</span></a>
}

export function PlanPreview() {
  return <figure className="mx-auto w-full max-w-4xl rounded-2xl glass-card p-2 shadow-[0_24px_70px_-34px_rgba(80,57,180,0.5)] sm:p-3"><div className="aspect-[16/7] overflow-hidden rounded-xl bg-white/70"><img src={DASHBOARD_IMAGE} alt="Drivio study plan dashboard showing progress, practice questions, and the next lesson" className="block size-full object-cover object-top" /></div><figcaption className="sr-only">A preview of the Drivio study plan dashboard.</figcaption></figure>
}

export function FAQ() {
  const [open, setOpen] = useState(0)
  return <div className="rounded-xl glass-card-subtle">{faqs.map(([question, answer], index) => <div key={question} className="not-first:border-t not-first:border-white/30"><button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>{question}<ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${open === index ? 'rotate-180' : ''}`} /></button>{open === index && <p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">{answer}</p>}</div>)}</div>
}
