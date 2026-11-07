import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { applications } from './applications.js'

export const builds = pgTable('builds', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  version: varchar('version', { length: 100 }).notNull(),
  buildNumber: varchar('build_number', { length: 100 }),
  downloadUrl: varchar('download_url', { length: 1000 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
