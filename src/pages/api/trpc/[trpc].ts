import { createNextApiHandler } from '@trpc/server/adapters/next'

import { createContext } from '@/server/context'
import { appRouter } from '@/server/index'

// export API handler
// @link https://trpc.io/docs/v11/server/adapters
export default createNextApiHandler({
  router: appRouter,
  createContext,
})
