import { safesRouter } from '@/server/api/routers/safes'
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'

import { categoriesRouter } from './routers/categories'
import { transfersRouter } from './routers/transfers'
import { organizationsRouter } from './routers/organizations'
import { adminRouter } from './routers/admin'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  safes: safesRouter,
  transfers: transfersRouter,
  categories: categoriesRouter,
  organizations: organizationsRouter,
  admin: adminRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = createCallerFactory(appRouter)
