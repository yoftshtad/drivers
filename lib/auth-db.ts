import { Kysely } from 'kysely'
import { LibsqlDialect } from '@libsql/kysely-libsql'

export const authDb = new Kysely<Record<string, unknown>>({
  dialect: new LibsqlDialect({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  }),
})
