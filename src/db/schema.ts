import { InferSelectModel, relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core'

// Define transfer type enum
export const transferTypeEnum = pgEnum('transfer_type', [
  'ETHER_TRANSFER',
  'ERC20_TRANSFER',
])

export const chainEnum = pgEnum('chain', [
  'ETH', // ethereum | 1
  'ARB', // arbitrum | 42161
  'UNI', // uni | 130 | 0x82
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

// New table for organization admins
export const organizationAdmins = pgTable('organization_admins', {
  id: uuid('id').defaultRandom().notNull(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  walletAddress: text('wallet_address').notNull(), // Admin wallet address
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Ensure a wallet can only be added once per organization
    uniqAdminPerOrg: primaryKey({ columns: [table.organizationId, table.walletAddress] }),
  }
})

export type OrganizationAdmin = InferSelectModel<typeof organizationAdmins>

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: text('name').notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Ensure category names are unique within an organization but keep id as primary key
    uniqNamePerOrg: unique('unique_org_category_name').on(table.organizationId, table.name),
  }
})

export type CategoryItem = InferSelectModel<typeof categories>

export const safes = pgTable('safes', {
  address: text('address').notNull(),
  chain: chainEnum('chain').notNull(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  removed: boolean('removed').default(false).notNull(),
  removedAt: timestamp('removed_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.address, table.chain] }),
  }
})

export type SafeItem = InferSelectModel<typeof safes>

export const transfers = pgTable('transfers', {
  transferId: text('transfer_id').primaryKey(),
  safeAddress: text('safe_address').notNull(),
  safeChain: chainEnum('chain').notNull(),
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

export const organizationsRelations = relations(organizations, ({ many }) => ({
  safes: many(safes),
  categories: many(categories),
  admins: many(organizationAdmins),
}))

export const organizationAdminsRelations = relations(organizationAdmins, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationAdmins.organizationId],
    references: [organizations.id],
  }),
}))

export const safesRelations = relations(safes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [safes.organizationId],
    references: [organizations.id],
  }),
  transfers: many(transfers),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [categories.organizationId],
    references: [organizations.id],
  }),
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

export type OrgAdmin = typeof organizationAdmins.$inferSelect
export type NewOrgAdmin = typeof organizationAdmins.$inferInsert
