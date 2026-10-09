import { createClient } from '@libsql/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

const db = createClient({ url, authToken })

async function main() {
  console.log('Testing user insert with correct schema...')
  
  const testId = `test-${Date.now()}`
  const joined = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const now = new Date().toISOString()
  
  try {
    await db.execute({
      sql: `INSERT INTO users (id, name, email, phone, role, plan, access_state, joined_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [testId, 'Test User', 'test@example.com', null, 'student', 'free', 'pending', joined, now, now]
    })
    console.log('✓ Insert successful')
    
    // Verify
    const result = await db.execute('SELECT * FROM users WHERE id = ?', [testId])
    console.log('Inserted user:', result.rows)
  } catch (e: any) {
    console.error('Insert failed:', e.message)
  }
}

main()