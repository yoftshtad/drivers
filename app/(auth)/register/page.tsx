'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/session'

const emailOrPhone = z.string().min(1, 'Email or phone is required').refine(
  (val) => z.string().email().safeParse(val).success || /^[\d\s+\-()]{7,}$/.test(val.replace(/\s/g, '')),
  'Enter a valid email or phone number'
)

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    identifier: emailOrPhone,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', identifier: '', password: '', confirmPassword: '' } })

  const onSubmit = async (values: FormValues) => {
    await signUp(values.name, values.identifier, values.password)
    router.push('/payment')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Start learning in minutes. An admin will review your account and grant access.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="John Doe" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
          {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="identifier">Email or phone</Label>
          <Input id="identifier" type="text" placeholder="you@example.com or +1234567890" autoComplete="email" aria-invalid={!!errors.identifier} {...register('identifier')} />
          {errors.identifier && <p className="text-xs font-medium text-destructive">{errors.identifier.message}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" aria-invalid={!!errors.password} {...register('password')} />
            {errors.password && <p className="text-xs font-medium text-destructive">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" placeholder="Repeat password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs font-medium text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 h-11 w-full text-sm">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
