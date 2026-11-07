import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core'
import { findings } from './findings.js'

export const evidence = pgTable('evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  findingId: uuid('finding_id').notNull().references(() => findings.id),
  url: varchar('url', { length: 1000 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('screenshot'),
  mimeType: varchar('mime_type', { length: 100 }),
  sizeBytes: integer('size_bytes'),
  r2Key: varchar('r2_key', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
