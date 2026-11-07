import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { users } from './users.js'

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
