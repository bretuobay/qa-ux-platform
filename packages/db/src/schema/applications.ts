import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  platform: varchar('platform', { length: 50 }),
  repoUrl: varchar('repo_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
