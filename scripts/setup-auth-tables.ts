import { createClient } from '@libsql/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN! })

async function main() {
  console.log('Setting up NextAuth tables...')

  // Users table - extend existing with NextAuth fields
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      email_verified TEXT,
      image TEXT,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      plan TEXT NOT NULL DEFAULT 'free',
      access_state TEXT NOT NULL DEFAULT 'pending',
      joined_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  console.log('✓ users table ready')

  // Accounts table for OAuth/credentials linking
  await db.execute(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      type TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, provider_account_id)
    )
  `)
  console.log('✓ accounts table ready')

  // Sessions table for database session strategy
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      expires TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
  console.log('✓ sessions table ready')

  // Verification tokens for email sign-in
  await db.execute(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (identifier, token)
    )
  `)
  console.log('✓ verification_tokens table ready')

  // Authenticators for WebAuthn
  await db.execute(`
    CREATE TABLE IF NOT EXISTS authenticators (
      credential_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      counter INTEGER NOT NULL DEFAULT 0,
      credential_backed_up INTEGER NOT NULL DEFAULT 0,
      credential_public_key TEXT NOT NULL,
      transports TEXT,
      credential_device_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
  console.log('✓ authenticators table ready')

  // Create indexes
  await db.execute('CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')

  console.log('\n✓ All NextAuth tables created successfully')
}

main().catch(console.error)