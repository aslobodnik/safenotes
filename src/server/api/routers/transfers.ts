import { desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { transferCategories, transfers } from '@/db/schema'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import {
  fetchSafeTransfers,
  filterTrustedTransfers,
} from '@/utils/safe-global-adapter'

const safeTransferSchema = z.object({
  type: z.enum(['ETHER_TRANSFER', 'ERC20_TRANSFER']),
  executionDate: z.string(),
  blockNumber: z.number(),
  transactionHash: z.string(),
  transferId: z.string(),
  to: z.string(),
  from: z.string(),
  value: z.string(),
  tokenAddress: z.string().nullable(),
  tokenInfo: z
    .object({
      name: z.string(),
      symbol: z.string(),
      decimals: z.number(),
      logoUri: z.string().optional(),
      trusted: z.boolean(),
    })
    .nullable(),
  safeAddress: z.string(),
})

export const transfersRouter = createTRPCRouter({
  getTransfersPerWallet: publicProcedure
    .input(
      z.object({
        safeAddress: z.string(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      const { results } = await fetchSafeTransfers(
        input.safeAddress,
        input.limit
      )
      return filterTrustedTransfers(results)
    }),
  writeTransfer: publicProcedure
    .input(
      z.object({
        transfer: safeTransferSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { transfer } = input

      await ctx.db
        .insert(transfers)
        .values({
          transferId: transfer.transferId,
          safeAddress: transfer.safeAddress,
          safeChain: 'ETH',
          type: transfer.type,
          executionDate: new Date(transfer.executionDate),
          blockNumber: transfer.blockNumber,
          transactionHash: transfer.transactionHash,
          fromAddress: transfer.from,
          toAddress: transfer.to,
          value: transfer.value,
          tokenAddress: transfer.tokenAddress,
          tokenName: transfer.tokenInfo?.name ?? null,
          tokenSymbol: transfer.tokenInfo?.symbol ?? null,
          tokenDecimals: transfer.tokenInfo?.decimals ?? null,
          tokenLogoUri: transfer.tokenInfo?.logoUri ?? null,
          createdAt: new Date(),
        })
        .onConflictDoNothing()

      return { success: true }
    }),
  getAllTransfersByWallet: publicProcedure
    .input(
      z.object({
        safeAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(transfers)
        .where(eq(transfers.safeAddress, input.safeAddress))
    }),
  getTransfers: publicProcedure
    .input(
      z.object({
        safeAddress: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const query = ctx.db
        .select()
        .from(transfers)
        .orderBy(desc(transfers.executionDate))

      if (input.safeAddress) {
        const address = input.safeAddress.toLowerCase()
        query.where(
          sql`LOWER(${transfers.fromAddress}) = ${address} OR LOWER(${transfers.toAddress}) = ${address}`
        )
      }

      return query
    }),
  updateCategory: protectedProcedure
    .input(
      z.object({
        transferId: z.string(),
        categoryId: z.string().nullable(),
        description: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First delete any existing category mapping
      await ctx.db
        .delete(transferCategories)
        .where(eq(transferCategories.transferId, input.transferId))

      // If a new category is selected, create the mapping
      if (input.categoryId) {
        await ctx.db.insert(transferCategories).values({
          transferId: input.transferId,
          categoryId: input.categoryId,
          description: input.description,
        })
      }

      return { success: true }
    }),
})
