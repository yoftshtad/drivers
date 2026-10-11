import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export default async function middleware(request: Request) {
  const url = new URL(request.url)
  
  // Rate limiting for admin endpoints only
  if (url.pathname.startsWith('/api/admin/')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await checkRateLimit(ip, 'admin')
    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }
  
  // Run NextAuth middleware for protected routes
  return (auth as any)(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/student/:path*',
    '/onboarding/:path*',
    '/payment/:path*',
    '/waiting/:path*',
    '/performance/:path*',
    '/api/admin/:path*',
    '/api/student/:path*',
  ],
}