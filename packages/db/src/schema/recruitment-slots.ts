import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { orders } from './orders.js'

export const recruitmentSlots = pgTable('recruitment_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  assignmentId: uuid('assignment_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
