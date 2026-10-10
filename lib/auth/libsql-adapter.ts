import { createClient } from '@libsql/client'
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken, AdapterAuthenticator } from '@auth/core/adapters'

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

if (!url || !authToken) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
}

const client = createClient({ url, authToken })

async function execute(sql: string, args: (string | number | boolean | null)[] = []) {
  const result = await client.execute({ sql, args })
  return result.rows
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

function rowToUser(row: any): AdapterUser {
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    emailVerified: toDate(row.email_verified),
    image: row.image ?? null,
  } as AdapterUser
}

function rowToAccount(row: any): AdapterAccount {
  return {
    provider: row.provider,
    providerAccountId: row.provider_account_id,
    type: row.type,
    userId: row.user_id,
    access_token: row.access_token,
    refresh_token: row.refresh_token,
    expires_at: row.expires_at,
    token_type: row.token_type,
    scope: row.scope,
    id_token: row.id_token,
    session_state: row.session_state,
  }
}

function rowToSession(row: any): AdapterSession {
  return {
    sessionToken: row.session_token,
    userId: row.user_id,
    expires: toDate(row.expires)!,
  }
}

function rowToVerificationToken(row: any): VerificationToken {
  return {
    identifier: row.identifier,
    token: row.token,
    expires: toDate(row.expires)!,
  }
}

function rowToAuthenticator(row: any): AdapterAuthenticator {
  return {
    credentialID: row.credential_id,
    userId: row.user_id,
    providerAccountId: row.provider_account_id,
    counter: row.counter,
    credentialBackedUp: row.credential_backed_up === 1,
    credentialPublicKey: row.credential_public_key,
    transports: row.transports,
    credentialDeviceType: row.credential_device_type,
  }
}

export function LibSQLAdapter(): Adapter {
  return {
    async createUser(user) {
      const now = new Date().toISOString()
      await execute(
        `INSERT INTO users (id, name, email, email_verified, image, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.name ?? null, user.email, user.emailVerified?.toISOString() ?? null, user.image ?? null, now, now]
      )
      return user
    },

    async getUser(id) {
      const result = await execute('SELECT * FROM users WHERE id = ?', [id])
      return result[0] ? rowToUser(result[0]) : null
    },

    async getUserByEmail(email) {
      const result = await execute('SELECT * FROM users WHERE email = ?', [email])
      return result[0] ? rowToUser(result[0]) : null
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const result = await execute(
        `SELECT u.* FROM users u
              JOIN accounts a ON u.id = a.user_id
              WHERE a.provider = ? AND a.provider_account_id = ?`,
        [provider, providerAccountId]
      )
      return result[0] ? rowToUser(result[0]) : null
    },

    async updateUser(user) {
      const now = new Date().toISOString()
      const fields: string[] = []
      const args: any[] = []
      
      if (user.name !== undefined) { fields.push('name = ?'); args.push(user.name) }
      if (user.email !== undefined) { fields.push('email = ?'); args.push(user.email) }
      if (user.emailVerified !== undefined) { fields.push('email_verified = ?'); args.push(user.emailVerified?.toISOString() ?? null) }
      if (user.image !== undefined) { fields.push('image = ?'); args.push(user.image) }
      
      if (fields.length === 0) {
        const result = await execute('SELECT * FROM users WHERE id = ?', [user.id])
        return rowToUser(result[0])
      }
      
      fields.push('updated_at = ?')
      args.push(now)
      args.push(user.id)
      
      await execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        args
      )
      
      const result = await execute('SELECT * FROM users WHERE id = ?', [user.id])
      return rowToUser(result[0])
    },

    async deleteUser(userId) {
      await execute('DELETE FROM users WHERE id = ?', [userId])
    },

    async linkAccount(account) {
      const now = new Date().toISOString()
      await execute(
        `INSERT INTO accounts (user_id, provider, provider_account_id, type, access_token, refresh_token, expires_at, token_type, scope, id_token, session_state, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          account.userId,
          account.provider,
          account.providerAccountId,
          account.type,
          account.access_token ?? null,
          account.refresh_token ?? null,
          account.expires_at ?? null,
          account.token_type ?? null,
          account.scope ?? null,
          account.id_token ?? null,
          account.session_state ?? null,
          now,
          now,
        ] as (string | number | boolean | null)[]
      )
      return account
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await execute(
        'DELETE FROM accounts WHERE provider = ? AND provider_account_id = ?',
        [provider, providerAccountId]
      )
    },

    async createSession(session) {
      await execute(
        `INSERT INTO sessions (session_token, user_id, expires, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?)`,
        [session.sessionToken, session.userId, session.expires.toISOString(), new Date().toISOString(), new Date().toISOString()]
      )
      return session
    },

    async getSessionAndUser(sessionToken) {
      const result = await execute(
        `SELECT s.*, u.* FROM sessions s
              JOIN users u ON s.user_id = u.id
              WHERE s.session_token = ?`,
        [sessionToken]
      )
      if (!result[0]) return null
      return {
        session: rowToSession(result[0]),
        user: rowToUser(result[0]),
      }
    },

    async updateSession(session) {
      const fields: string[] = []
      const args: any[] = []
      
      if (session.expires !== undefined) { fields.push('expires = ?'); args.push(session.expires.toISOString()) }
      if (session.userId !== undefined) { fields.push('user_id = ?'); args.push(session.userId) }
      
      if (fields.length === 0) return null
      
      fields.push('updated_at = ?')
      args.push(new Date().toISOString())
      args.push(session.sessionToken)
      
      await execute(
        `UPDATE sessions SET ${fields.join(', ')} WHERE session_token = ?`,
        args
      )
      
      const result = await execute('SELECT * FROM sessions WHERE session_token = ?', [session.sessionToken])
      return result[0] ? rowToSession(result[0]) : null
    },

    async deleteSession(sessionToken) {
      await execute('DELETE FROM sessions WHERE session_token = ?', [sessionToken])
    },

    async createVerificationToken(token) {
      await execute(
        `INSERT INTO verification_tokens (identifier, token, expires, created_at)
              VALUES (?, ?, ?, ?)`,
        [token.identifier, token.token, token.expires.toISOString(), new Date().toISOString()]
      )
      return token
    },

    async useVerificationToken({ identifier, token }) {
      const result = await execute(
        'SELECT * FROM verification_tokens WHERE identifier = ? AND token = ?',
        [identifier, token]
      )
      if (!result[0]) return null
      
      await execute(
        'DELETE FROM verification_tokens WHERE identifier = ? AND token = ?',
        [identifier, token]
      )
      return rowToVerificationToken(result[0])
    },

    async getAccount(providerAccountId, provider) {
      const result = await execute(
        'SELECT * FROM accounts WHERE provider_account_id = ? AND provider = ?',
        [providerAccountId, provider]
      )
      return result[0] ? rowToAccount(result[0]) : null
    },

    async getAuthenticator(credentialID) {
      const result = await execute(
        'SELECT * FROM authenticators WHERE credential_id = ?',
        [credentialID]
      )
      return result[0] ? rowToAuthenticator(result[0]) : null
    },

    async createAuthenticator(authenticator) {
      const now = new Date().toISOString()
      await execute(
        `INSERT INTO authenticators (credential_id, user_id, provider_account_id, counter, credential_backed_up, credential_public_key, transports, credential_device_type, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          authenticator.credentialID,
          authenticator.userId,
          authenticator.providerAccountId,
          authenticator.counter,
          authenticator.credentialBackedUp ? 1 : 0,
          authenticator.credentialPublicKey,
          authenticator.transports ?? null,
          authenticator.credentialDeviceType,
          now,
          now,
        ] as (string | number | boolean | null)[]
      )
      return authenticator
    },

    async listAuthenticatorsByUserId(userId) {
      const result = await execute(
        'SELECT * FROM authenticators WHERE user_id = ?',
        [userId]
      )
      return result.map(rowToAuthenticator)
    },

    async updateAuthenticatorCounter(credentialID, newCounter) {
      await execute(
        'UPDATE authenticators SET counter = ?, updated_at = ? WHERE credential_id = ?',
        [newCounter, new Date().toISOString(), credentialID] as (string | number | boolean | null)[]
      )
      const result = await execute('SELECT * FROM authenticators WHERE credential_id = ?', [credentialID])
      return rowToAuthenticator(result[0])
    },
  }
}