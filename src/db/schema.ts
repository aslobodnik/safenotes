import { InferSelectModel, relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

// Define transfer type enum
export const transferTypeEnum = pgEnum('transfer_type', [
  'ETHER_TRANSFER',
  'ERC20_TRANSFER',
])

// Define organizations table with additional fields
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(), // e.g., "ens", "uniswap"
  description: text('description').notNull(),
  bannerImage: text('banner_image').notNull(), // URL to the banner image
  logoImage: text('logo_image').notNull(), // URL to the logo image
  createdAt: timestamp('created_at').defaultNow(),
})

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: text('name').notNull().unique(),
})

export type CategoryItem = InferSelectModel<typeof categories>

export const safes = pgTable('safes', {
  address: text('address').primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  removed: boolean('removed').default(false),
  removedAt: timestamp('removed_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type SafeItem = InferSelectModel<typeof safes>
export const transfers = pgTable('transfers', {
  transferId: text('transfer_id').primaryKey(),
  safeAddress: text('safe_address')
    .notNull()
    .references(() => safes.address),
  type: transferTypeEnum('type').notNull(),
  executionDate: timestamp('execution_date').notNull(),
  blockNumber: integer('block_number').notNull(),
  transactionHash: text('transaction_hash').notNull(),
  fromAddress: text('from_address').notNull(),
  toAddress: text('to_address').notNull(),
  value: text('value'),
  tokenAddress: text('token_address'),
  tokenName: text('token_name'),
  tokenSymbol: text('token_symbol'),
  tokenDecimals: integer('token_decimals'),
  tokenLogoUri: text('token_logo_uri'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type TransferItem = InferSelectModel<typeof transfers>

export const transferCategories = pgTable('transfer_categories', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  transferId: text('transfer_id')
    .notNull()
    .references(() => transfers.transferId),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id),
  description: text('description'),
})

export type TransferCategoryItem = InferSelectModel<typeof transferCategories>

// Define relationships
export const transfersRelations = relations(transfers, ({ many }) => ({
  categories: many(transferCategories),
}))

export const organizationsRelations = relations(organizations, ({ many }) => ({
  safes: many(safes),
}))

export const safesRelations = relations(safes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [safes.organizationId],
    references: [organizations.id],
  }),
  transfers: many(transfers),
}))

// TODO: this might be a better way to map relations between safes and transfers
// export const transfersRelations = relations(transfers, ({ one, many }) => ({
//   safe: one(safes, {
//     fields: [transfers.safeAddress],
//     references: [safes.address],
//   }),
//   categories: many(transferCategories),
// }))

export const categoriesRelations = relations(categories, ({ many }) => ({
  transfers: many(transferCategories),
}))

// Types for better type safety
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export type Safe = typeof safes.$inferSelect
export type NewSafe = typeof safes.$inferInsert

export type Transfer = typeof transfers.$inferSelect
export type NewTransfer = typeof transfers.$inferInsert

export type TransferCategory = typeof transferCategories.$inferSelect
export type NewTransferCategory = typeof transferCategories.$inferInsert
