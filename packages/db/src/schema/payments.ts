import { pgTable, uuid, varchar, numeric, timestamp } from 'drizzle-orm/pg-core'
import { orders } from './orders.js'
import { users } from './users.js'

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  payerId: uuid('payer_id').notNull().references(() => users.id),
  payeeId: uuid('payee_id').references(() => users.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  externalRef: varchar('external_ref', { length: 200 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
