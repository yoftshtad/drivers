import { createClient } from '@libsql/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

const db = createClient({ url, authToken })

async function main() {
  console.log('Cleaning up test user...')
  await db.execute("DELETE FROM users WHERE id LIKE 'test-%'")
  console.log('Done')
}

main()