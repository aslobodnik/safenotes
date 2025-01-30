import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { safes, transfers } from '@/db/schema'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import type { Transfer, TransferResponse } from '@/types/transfers'

const ITEMS_PER_PAGE = 20

export const transfersRouter = createTRPCRouter({
  getTransfers: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        safeAddress: z.string().nullable().optional(),
        includeRemoved: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }): Promise<TransferResponse> => {
      const { page, safeAddress, includeRemoved } = input

      // Get safes using Drizzle
      const safesList = safeAddress
        ? await ctx.db
            .select()
            .from(safes)
            .where(eq(safes.address, safeAddress))
        : includeRemoved
          ? await ctx.db.select().from(safes)
          : await ctx.db.select().from(safes).where(eq(safes.removed, false))

      let allTransfers: Transfer[] = []
      for (const safe of safesList) {
        const apiUrl = `https://safe-transaction-mainnet.safe.global/api/v1/safes/${safe.address}/transfers/?limit=1000`
        const response = await fetch(apiUrl)

        if (!response.ok) {
          console.error(`Failed to fetch transfers for safe ${safe.address}`)
          continue
        }

        const data = await response.json()

        const trustedTransfers = data.results
          .filter((transfer: Transfer) => {
            if (!transfer.tokenInfo) return true
            return transfer.tokenInfo.trusted === true
          })
          .map((transfer: Transfer) => ({
            ...transfer,
            safe: safe.address,
          }))

        allTransfers = [...allTransfers, ...trustedTransfers]
      }

      // Sort by execution date, most recent first
      allTransfers.sort(
        (a, b) =>
          new Date(b.executionDate).getTime() -
          new Date(a.executionDate).getTime()
      )

      const totalItems = allTransfers.length
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
      const startIndex = (page - 1) * ITEMS_PER_PAGE
      const paginatedTransfers = allTransfers.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
      )

      return {
        results: paginatedTransfers,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: ITEMS_PER_PAGE,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }
    }),
  getTransfersPerWallet: publicProcedure
    .input(
      z.object({
        safeAddress: z.string(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx, input }): Promise<Transfer[]> => {
      const apiUrl = `https://safe-transaction-mainnet.safe.global/api/v1/safes/${input.safeAddress}/transfers/?limit=${input.limit}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch transfers for safe ${input.safeAddress}`
        )
      }

      const data = await response.json()
      return data.results
        .filter((transfer: Transfer) => {
          if (!transfer.tokenInfo) return true
          return transfer.tokenInfo.trusted === true
        })
        .map((transfer: Transfer) => ({
          ...transfer,
          safe: input.safeAddress,
        }))
    }),
  writeTransfer: publicProcedure
    .input(
      z.object({
        transfer: z.object({
          transferId: z.string(),
          safeAddress: z.string(),
          type: z.enum(['ETHER_TRANSFER', 'ERC20_TRANSFER']),
          executionDate: z.string(),
          blockNumber: z.number(),
          transactionHash: z.string(),
          fromAddress: z.string(),
          toAddress: z.string(),
          value: z.string(),
          tokenAddress: z.string().nullable(),
          tokenInfo: z
            .object({
              name: z.string(),
              symbol: z.string(),
              decimals: z.number(),
              logoUri: z.string().optional(),
            })
            .nullable(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(transfers)
        .values({
          transferId: input.transfer.transferId,
          safeAddress: input.transfer.safeAddress,
          type: input.transfer.type,
          executionDate: new Date(input.transfer.executionDate),
          blockNumber: input.transfer.blockNumber,
          transactionHash: input.transfer.transactionHash,
          fromAddress: input.transfer.fromAddress,
          toAddress: input.transfer.toAddress,
          value: input.transfer.value,
          tokenAddress: input.transfer.tokenAddress,
          tokenName: input.transfer.tokenInfo?.name,
          tokenSymbol: input.transfer.tokenInfo?.symbol,
          tokenDecimals: input.transfer.tokenInfo?.decimals,
          tokenLogoUri: input.transfer.tokenInfo?.logoUri,
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
})
