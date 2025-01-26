'server only'

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import { getAuthOptions } from '@/pages/api/auth/[...nextauth]'

export async function verifySession(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, getAuthOptions(req))

  if (!session) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  return session
}
