import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'

import { Context } from './context'

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape }) => {
    return shape
  },
})

/**
 * Define public, private and admin procedures
 */
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const createTRPCRouter = t.router
