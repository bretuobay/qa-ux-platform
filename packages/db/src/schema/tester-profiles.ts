import { pgTable, uuid, text, json, numeric, boolean, integer, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const testerProfiles = pgTable('tester_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id),
  bio: text('bio'),
  skills: json('skills').$type<string[]>().default([]),
  devices: json('devices').$type<string[]>().default([]),
  languages: json('languages').$type<string[]>().default([]),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  currency: text('currency').notNull().default('USD'),
  isAvailable: boolean('is_available').notNull().default(true),
  deviceModel: varchar('device_model', { length: 200 }),
  os: varchar('os', { length: 100 }),
  browser: varchar('browser', { length: 100 }),
  country: varchar('country', { length: 80 }),
  payoutMethod: varchar('payout_method', { length: 100 }),
  deviceChecked: boolean('device_checked').notNull().default(false),
  qualification: varchar('qualification', { length: 50 }).notNull().default('unscored'),
  completedOrders: integer('completed_orders').notNull().default(0),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
