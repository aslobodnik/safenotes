import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { db } from '@/db'
import { safes } from '@/db/schema'

const ITEMS_PER_PAGE = 20

interface Transfer {
  transferId: string
  transactionHash: string
  to: string
  from: string
  value: string
  executionDate: string
  tokenInfo?: {
    symbol: string
    decimals: number
    trusted: boolean
  }
  safe: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const page = Number(req.query.page) || 1
    const includeRemoved = req.query.includeRemoved === 'true'

    // Get safes using Drizzle
    const safesList = includeRemoved
      ? await db.select().from(safes)
      : await db.select().from(safes).where(eq(safes.removed, false))

    let allTransfers: Transfer[] = []
    for (const safe of safesList) {
      const apiUrl = `https://safe-transaction-mainnet.safe.global/api/v1/safes/${safe.address}/transfers/?limit=1000`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        console.error(`Failed to fetch transfers for safe ${safe.address}`)
        continue
      }

      const data = await response.json()

      const trustedTransfers = data.results
        .filter((transfer: Transfer) => {
          if (!transfer.tokenInfo) return true
          return transfer.tokenInfo.trusted === true
        })
        .map((transfer: Transfer) => ({
          ...transfer,
          safe: safe.address,
        }))

      allTransfers = [...allTransfers, ...trustedTransfers]
    }

    // Sort by execution date, most recent first
    allTransfers.sort(
      (a, b) =>
        new Date(b.executionDate).getTime() -
        new Date(a.executionDate).getTime()
    )

    const totalItems = allTransfers.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const paginatedTransfers = allTransfers.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    )

    return res.status(200).json({
      results: paginatedTransfers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({
      error: 'Failed to fetch transfers',
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
