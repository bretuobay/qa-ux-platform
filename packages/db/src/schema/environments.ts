import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { applications } from './applications.js'

export const environments = pgTable('environments', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  name: varchar('name', { length: 200 }).notNull(),
  platform: varchar('platform', { length: 50 }).notNull(),
  browser: varchar('browser', { length: 100 }),
  os: varchar('os', { length: 100 }),
  device: varchar('device', { length: 200 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
