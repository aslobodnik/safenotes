import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import db from '@/db';

export async function createContext(opts: CreateNextContextOptions) {
  return {
    db,
    // Add any other context items you need
    req: opts.req,
    res: opts.res,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
