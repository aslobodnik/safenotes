import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const organizationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(organizations);
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [org] = await ctx.db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, input.slug));
      return org;
    }),
}); 