import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core'
import { executions } from './executions.js'

export const executionEvidence = pgTable('execution_evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  executionId: uuid('execution_id').notNull().references(() => executions.id),
  fileName: varchar('file_name', { length: 300 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  r2Key: varchar('r2_key', { length: 500 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
