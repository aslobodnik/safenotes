import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';
// export API handler
// @link https://trpc.io/docs/v11/server/adapters
export default createNextApiHandler({
  router: appRouter,
  createContext,
});