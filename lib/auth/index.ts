import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { LibSQLAdapter } from './libsql-adapter'
import bcrypt from 'bcryptjs'
import type { UserRole, AccessState } from '@/lib/types'

const ADMIN_EMAIL = 'admin@driveprep.com'
const ADMIN_PASSWORD_HASH = '$2b$12$WuUX5gq7lNhpdyPG0.aWRuxgfSQazqeqX8qfXB5elNl5/qPxVtVWi'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: LibSQLAdapter(),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        const identifier = credentials.identifier as string
        const password = credentials.password as string
        const isEmail = identifier.includes('@')
        const normalized = identifier.trim().toLowerCase()

        // Check for admin
        if (normalized === ADMIN_EMAIL.toLowerCase()) {
          const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
          if (!valid) return null
          return {
            id: 'u-admin',
            name: 'Admin',
            email: ADMIN_EMAIL,
            image: null,
            role: 'admin' as UserRole,
            access: 'active' as AccessState,
          } as any
        }

        // Regular user - look up in database
        const { db } = await import('@/lib/db')
        const user = await db.execute({
          sql: 'SELECT * FROM users WHERE email = ? OR phone = ?',
          args: [isEmail ? normalized : null, isEmail ? null : normalized],
        })

        if (!user.rows[0]) {
          return null
        }

        const dbUser = user.rows[0]
        const passwordHash = dbUser.password_hash as string | null

        if (passwordHash) {
          const valid = await bcrypt.compare(password, passwordHash)
          if (!valid) return null
        } else {
          const hash = await bcrypt.hash(password, 12)
          await db.execute({
            sql: 'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
            args: [hash, new Date().toISOString(), dbUser.id],
          })
        }

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: null,
          role: dbUser.role as UserRole,
          access: dbUser.access_state as AccessState,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.access = (user as any).access
      }
      if (trigger === 'update' && session) {
        token.role = session.user?.role
        token.access = session.user?.access
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as UserRole,
          access: token.access as AccessState,
        }
      }
      return session
    },
  },
})

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      access: AccessState
    }
  }

  interface User {
    role: UserRole
    access: AccessState
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    access: AccessState
  }
}