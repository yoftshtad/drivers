import { betterAuth } from 'better-auth'
import { kyselyAdapter } from '@better-auth/kysely-adapter'
import { authDb } from '@/lib/auth-db'
import { createUser } from '@/lib/db/users'

const phoneEmail = (phone: string) => `${phone.replace(/\D/g, '')}@phone.driveprep.invalid`

export const auth = betterAuth({
  database: kyselyAdapter(authDb, { type: 'sqlite', usePlural: false, transaction: false }),
  baseURL: process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL),
  emailAndPassword: { enabled: true, autoSignIn: true, requireEmailVerification: false },
  user: { modelName: 'auth_user' },
  session: { modelName: 'auth_session' },
  account: { modelName: 'auth_account' },
  verification: { modelName: 'auth_verification' },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const phone = user.email.endsWith('@phone.driveprep.invalid') ? user.email.split('@')[0] : undefined
          try {
            await createUser({ id: user.id, name: user.name, email: phone ? '' : user.email, phone })
          } catch (error) {
            console.error('[auth] failed to create pending user record', error)
          }
        },
      },
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
    ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
    ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
  ],
  ...(process.env.NODE_ENV === 'development' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})

export { phoneEmail }
