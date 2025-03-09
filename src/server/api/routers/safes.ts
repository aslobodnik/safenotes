import { eq } from 'drizzle-orm'
import { Address } from 'viem'
import { z } from 'zod'

import { safes } from '@/db/schema'
import { publicClient } from '@/lib/web3'
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from '@/server/api/trpc'

export const safesRouter = createTRPCRouter({
  getAllSafes: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(safes)
  }),

  getAllSafesWithEns: publicProcedure.query(async ({ ctx }) => {
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
  }),
  create: adminProcedure
    .input(
      z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        chain: z.enum(['ETH', 'ARB', 'UNI']).default('ETH'),
        organizationId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(safes).values({
        address: input.address,
        chain: input.chain,
        organizationId: input.organizationId,
      }),
  delete: adminProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(safes).where(eq(safes.address, input.address))
      return ctx.db.select().from(safes)
    }),

  softDelete: adminProcedure
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

  restore: adminProcedure
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

  getByOrganization: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(safes)
        .where(eq(safes.organizationId, input.organizationId));
    }),
})
