import { eq } from 'drizzle-orm'
import { Address } from 'viem'
import { z } from 'zod'

import { safes } from '@/db/schema'
import { publicClient } from '@/lib/web3'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import type { SafeWithEns } from '@/types/transfers'

export const safesRouter = createTRPCRouter({
  getAllSafes: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(safes)
  }),

  getAllSafesWithEns: publicProcedure.query(
    async ({ ctx }): Promise<SafeWithEns[]> => {
      const safesList = await ctx.db.select().from(safes)

      const safesWithEns = await Promise.all(
        safesList.map(async (safe) => {
          const name = await publicClient.getEnsName({
            address: safe.address as Address,
          })

          return {
            ...safe,
            name,
          }
        })
      )

      return safesWithEns
    }
  ),

  create: publicProcedure
    .input(
      z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(safes).values({
        address: input.address,
      })

      return ctx.db.select().from(safes)
    }),

  delete: publicProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(safes).where(eq(safes.address, input.address))
      return ctx.db.select().from(safes)
    }),

  softDelete: publicProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(safes)
        .set({
          removed: true,
          removedAt: new Date(),
        })
        .where(eq(safes.address, input.address))

      return {
        message: 'Safe removed successfully',
      }
    }),

  restore: publicProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(safes)
        .set({
          removed: false,
          removedAt: null,
        })
        .where(eq(safes.address, input.address))

      return {
        message: 'Safe restored successfully',
      }
    }),
})
