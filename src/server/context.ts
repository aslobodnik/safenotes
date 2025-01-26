import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getSession } from 'next-auth/react'

import { db } from '@/db'

export async function createContext(opts: CreateNextContextOptions) {
  const session = await getSession({ req: opts.req })

  return {
    db,
    session,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
