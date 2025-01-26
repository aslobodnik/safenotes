import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { categories } from '@/db/schema'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(categories).orderBy(asc(categories.name))
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).trim(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(categories).values({
          name: input.name,
        })

        return ctx.db.select().from(categories).orderBy(asc(categories.name))
      } catch (error) {
        // Handle Postgres unique constraint violation
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === '23505'
        ) {
          throw new Error('Category already exists')
        }
        throw error
      }
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(categories).where(eq(categories.id, input.id))

      return ctx.db.select().from(categories).orderBy(asc(categories.name))
    }),
})
