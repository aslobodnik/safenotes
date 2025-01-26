import { safeRouter } from '@/server/routers/safe-router'
import { transfersRouter } from '@/server/routers/transfers-router'
import { createTRPCRouter } from '@/server/trpc'

export const appRouter = createTRPCRouter({
  safes: safeRouter,
  transfers: transfersRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
