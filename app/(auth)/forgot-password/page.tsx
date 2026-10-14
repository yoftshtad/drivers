'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  const onSubmit = (values: FormValues) => {
    setEmail(values.email)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100">
          <CircleCheck className="size-7 text-green-600" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. The link expires in 30 minutes.
        </p>
        <Button size="lg" className="mt-7 h-11 w-full text-sm" render={<Link href="/login" />} nativeButton={false}>
          Back to login
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          Didn&apos;t receive it?{' '}
          <button className="font-semibold text-primary hover:underline" onClick={() => setSent(false)}>
            Resend
          </button>
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
          {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 h-11 w-full text-sm">
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
