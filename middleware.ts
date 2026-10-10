export { auth as middleware } from '@/lib/auth'

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