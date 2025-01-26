import { eq } from 'drizzle-orm'

// import { z } from 'zod'

import { safes } from '@/db/schema'
import { publicProcedure, createTRPCRouter } from '@/server/trpc'

export const safeRouter = createTRPCRouter({
  getSafes: publicProcedure.query(async ({ ctx }) => {
    const safesList = await ctx.db
      .select()
      .from(safes)
      .where(eq(safes.removed, false))

    return safesList
  }),
})
