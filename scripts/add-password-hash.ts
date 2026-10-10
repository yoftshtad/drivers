import { createClient } from '@libsql/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN! })

async function main() {
  console.log('Adding password_hash column to users table...')
  
  try {
    await db.execute('ALTER TABLE users ADD COLUMN password_hash TEXT')
    console.log('✓ password_hash column added')
  } catch (e: any) {
    if (e.message.includes('duplicate column')) {
      console.log('✓ password_hash column already exists')
    } else {
      throw e
    }
  }
}

main().catch(console.error)