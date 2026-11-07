import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { orders } from './orders.js'

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  title: varchar('title', { length: 200 }).notNull(),
  summary: text('summary'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  r2Key: varchar('r2_key', { length: 500 }),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
