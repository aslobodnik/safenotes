import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { safes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const appRouter = router({
  // Example procedure using db
  getSafes: publicProcedure.query(async ({ ctx }) => {
    const safesList = await ctx.db
      .select()
      .from(safes)
      .where(eq(safes.removed, false));
    
    return safesList;
  }),

  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(({ input }) => {
      console.log(input);
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;