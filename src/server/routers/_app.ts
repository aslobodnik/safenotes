import { eq } from 'drizzle-orm'
import { Address } from 'viem'
import { z } from 'zod'

import { safes } from '@/db/schema'
import { publicClient } from '@/lib/web3'

import { publicProcedure, router } from '../trpc'

export const appRouter = router({
  // Example procedure using db
  getSafes: publicProcedure.query(async ({ ctx }) => {
    const safesList = await ctx.db
      .select()
      .from(safes)
      .where(eq(safes.removed, false))

    const enrichedSafes = await Promise.all(
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

    return enrichedSafes
  }),

  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      console.log(input)
      return {
        greeting: `Hello ${input.text}`,
      }
    }),
})

// export type definition of API
export type AppRouter = typeof appRouter
