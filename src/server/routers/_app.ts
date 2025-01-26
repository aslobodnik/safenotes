// import { eq } from 'drizzle-orm'
import { z } from 'zod'

// import { safes } from '@/db/schema'
import { safeRouter } from '@/server/routers/safe-router'
import { publicProcedure, router } from '@/server/trpc'

export const appRouter = router({
  safes: safeRouter,
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
