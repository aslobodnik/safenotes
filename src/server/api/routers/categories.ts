import { asc, eq, and } from 'drizzle-orm'
import { z } from 'zod'

import { categories, transferCategories } from '@/db/schema'
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'

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
      // Check if the category already exists for the organization
      const existingCategory = await ctx.db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.name, input.name),
            eq(categories.organizationId, input.organizationId)
          )
        )
        .limit(1);
      
      // If category exists, throw an error
      if (existingCategory.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Category '${input.name}' already exists for this organization`,
        });
      }

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
      // First check if the category is associated with any transfers
      const associatedTransfers = await ctx.db
        .select()
        .from(transferCategories)
        .where(eq(transferCategories.categoryId, input.id));
      
      // If there is more than one transfer, throw an error
      if (associatedTransfers.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "Cannot delete category that is associated with transfers",
        });
      }
      
      // If no transfers are associated, proceed with deletion
      await ctx.db.delete(categories).where(eq(categories.id, input.id));
      
      return ctx.db.select().from(categories).orderBy(asc(categories.name));
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
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
      })
    ).mutation(async ({ ctx, input }) => {
      await ctx.db.update(categories).set({ name: input.name }).where(eq(categories.id, input.id))
      return ctx.db.select().from(categories).orderBy(asc(categories.name))
    })
})
