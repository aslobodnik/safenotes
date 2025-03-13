import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { categories, transferCategories } from '@/db/schema'
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '@/server/api/trpc'

export const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(categories).orderBy(asc(categories.name))
  }),
  getCategoriesByOrganization: publicProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // If organizationId is provided, filter by it
      return ctx.db
          .select()
          .from(categories)
          .where(eq(categories.organizationId, input.organizationId))
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        organizationId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(categories).values({
        name: input.name,
        organizationId: input.organizationId,
      })

      // Return categories filtered by organization if provided
      return ctx.db
          .select()
          .from(categories)
          .where(eq(categories.organizationId, input.organizationId));
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(categories).where(eq(categories.id, input.id))
      return ctx.db.select().from(categories).orderBy(asc(categories.name))
    }),
  getTransferCategories: publicProcedure
    .input(
      z.object({
        transferId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const query = ctx.db
        .select()
        .from(transferCategories)
        .leftJoin(categories, eq(categories.id, transferCategories.categoryId))

      if (input.transferId) {
        query.where(eq(transferCategories.transferId, input.transferId))
      }

      return query
    }),

  getAllTransferCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.transferCategories.findMany()
  }),
})
