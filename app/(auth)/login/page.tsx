'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const emailOrPhone = z.string().min(1, 'Email or phone is required').refine(
  (val) => z.string().email().safeParse(val).success || /^[\d\s+\-()]{7,}$/.test(val.replace(/\s/g, '')),
  'Enter a valid email or phone number'
)

const schema = z.object({
  identifier: emailOrPhone,
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [show, setShow] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { identifier: '', password: '' } })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const result = await signIn('credentials', {
      identifier: values.identifier,
      password: values.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError(result.error)
      return
    }

    // Admin credentials are known - redirect immediately
    const isAdmin = values.identifier.trim().toLowerCase() === 'admin@driveprep.com'
    if (isAdmin) {
      router.push('/admin')
      router.refresh()
      return
    }

    // For regular users, wait for session to update then redirect based on access
    const newSession = await update()
    
    // After update, the new session will have the latest access state
    const userAccess = newSession?.user?.access
    const redirectPath = userAccess === 'active' ? '/dashboard' : '/waiting'
    
    router.push(redirectPath)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in to continue preparing for your driver&apos;s license.</p>
      </div>

      <div className="mb-5 flex gap-3 rounded-xl bg-primary/5 p-3.5 text-xs leading-5 text-muted-foreground ring-1 ring-primary/10">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          <span className="font-semibold text-foreground">Admin login:</span> email <code className="rounded bg-muted px-1 py-0.5 font-semibold">admin@driveprep.com</code> + password <code className="rounded bg-muted px-1 py-0.5 font-semibold">driveprep2024</code>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="identifier">Email or phone</Label>
          <Input
            id="identifier"
            type="text"
            placeholder="you@example.com or +1234567890"
            autoComplete="email"
            aria-invalid={!!errors.identifier}
            {...register('identifier')}
          />
          {errors.identifier && <p className="text-xs font-medium text-destructive">{errors.identifier.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input id="password" type={show ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" aria-invalid={!!errors.password} {...register('password')} />
            <button type="button" className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-medium text-destructive">{errors.password.message}</p>}
        </div>

        {serverError && <p className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">{serverError}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 h-11 w-full text-sm">
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create account
        </Link>
      </p>
    </div>
  )
}