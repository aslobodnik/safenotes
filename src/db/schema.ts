import { relations, InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Define transfer type enum
export const transferTypeEnum = pgEnum('transfer_type', ['ETHER_TRANSFER', 'ERC20_TRANSFER']);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: text('name').notNull().unique(),
});

export type CategoryItem = InferSelectModel<typeof categories>;

export const safes = pgTable('safes', {
  address: text('address').primaryKey(),
  removed: boolean('removed').default(false),
  removedAt: timestamp('removed_at'),
});

export type SafeItem = InferSelectModel<typeof safes>;
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
  createdAt: timestamp('created_at')
    .defaultNow(),
});

export type TransferItem = InferSelectModel<typeof transfers>;

export const transferCategories = pgTable(
  'transfer_categories',
  {
    transferId: text('transfer_id').notNull().references(() => transfers.transferId),
    categoryId: uuid('category_id').notNull().references(() => categories.id),
  },
  (table) => ({
    pk: primaryKey(table.transferId, table.categoryId),
  }),
);

export type TransferCategoryItem = InferSelectModel<typeof transferCategories>;

// Define relationships
export const transfersRelations = relations(transfers, ({ many }) => ({
  categories: many(transferCategories)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transfers: many(transferCategories)
}));

// Types for better type safety
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;



export type Safe = typeof safes.$inferSelect;
export type NewSafe = typeof safes.$inferInsert;

export type Transfer = typeof transfers.$inferSelect;
export type NewTransfer = typeof transfers.$inferInsert;

export type TransferCategory = typeof transferCategories.$inferSelect;
export type NewTransferCategory = typeof transferCategories.$inferInsert;
