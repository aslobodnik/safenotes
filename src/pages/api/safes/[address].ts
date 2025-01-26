import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { db } from '@/db'
import { safes } from '@/db/schema'
import { verifySession } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await verifySession(req, res)
  const { address } = req.query

  if (req.method === 'DELETE') {
    try {
      await db
        .update(safes)
        .set({ removed: true, removedAt: new Date() })
        .where(eq(safes.address, address as string))
      return res.status(200).json({ message: 'Safe removed successfully' })
    } catch (error) {
      console.error('Error removing safe:', error)
      return res.status(500).json({ error: 'Failed to remove safe' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
