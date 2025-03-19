import { eq, and } from 'drizzle-orm'
import { Address } from 'viem'
import { z } from 'zod'

import { safes } from '@/db/schema'
import { publicClient } from '@/lib/web3'
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'

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
  create: protectedProcedure
    .input(
      z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        chain: z.enum(['ETH', 'ARB', 'UNI']).default('ETH'),
        organizationId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if the safe already exists in the database
      const existingSafe = await ctx.db.select()
        .from(safes)
        .where(
          and(
            eq(safes.address, input.address),
            eq(safes.organizationId, input.organizationId)
          )
        )
        .limit(1)

      if (existingSafe.length > 0 && !existingSafe[0].removed) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Safe '${input.address}' already exists for this organization`,
        });
      }

      // If safe exists, restore it instead of creating a new one
      if (existingSafe.length > 0 && existingSafe[0].removed) {
        await ctx.db
          .update(safes)
          .set({
            removed: false,
            removedAt: null,
          })
          .where(
            and(
              eq(safes.address, input.address),
              eq(safes.organizationId, input.organizationId)
            )
          )
        return ctx.db.select().from(safes)
      }

      // If safe doesn't exist, insert it
      await ctx.db.insert(safes).values({
        address: input.address,
        chain: input.chain,
        organizationId: input.organizationId,
      })

      return ctx.db.select().from(safes)
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

  softDelete: protectedProcedure
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
      return ctx.db.query.safes.findMany({
        where: and(
          eq(safes.organizationId, input.organizationId),
          eq(safes.removed, false)
        )
      })
    }),
    getByOrganizationWithEns: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const safesList = await ctx.db.query.safes.findMany({
        where: and(eq(safes.organizationId, input.organizationId), eq(safes.removed, false)),
      })

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
})
