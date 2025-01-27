import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'

import { Layout } from '@/components/Layout'
import SafeBalances from '@/components/SafeBalances'
import SafeSelector from '@/components/SafeSelector'
import SafeSigners from '@/components/SafeSigners'
import TransactionTable from '@/components/TransactionTable'
import { TransferResponse } from '@/types/transfers'
import { publicClient } from '@/lib/web3'
import { api } from '@/utils/trpc'


export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: transfers, isLoading } = api.transfers.getTransfers.useQuery({
    page: currentPage,
    safeAddress: selectedSafe,
    includeRemoved: false,
  })

  const { data: signersData } = useQuery({
    queryKey: ['safe-signers', selectedSafe],
    queryFn: async () => {
      const safeApiUrl = new URL(
        `/api/v1/safes/${selectedSafe}/`,
        process.env.NEXT_PUBLIC_SAFES_API_URL
      )

      const response = await fetch(safeApiUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch safe signers')
      }

      return await response.json()
    },
    enabled: !!selectedSafe,
  })

  const { data, isLoading } = useQuery<TransferResponse>({
    queryKey: ['transfers', currentPage, selectedSafe],
    queryFn: async () => {
      const url = new URL('/api/transfers', window.location.origin)
      url.searchParams.set('page', currentPage.toString())

      if (selectedSafe) {
        url.searchParams.set('safe', selectedSafe)
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch transfers')
      }

      return await response.json()
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      return await response.json()
    },
  })

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Image
            src="/ens-logo.svg"
            alt="ENS Logo"
            width={120}
            height={120}
            priority
          />
          <div className="flex items-center gap-4">
            <SafeSelector
              safeAddress={selectedSafe}
              onChange={setSelectedSafe}
            />
            <SafeSigners signersData={signersData} />
            <SafeBalances safeAddress={selectedSafe} />
          </div>
        </div>
        <TransactionTable
          transfers={data?.results || []}
          safeAddress={selectedSafe}
          pagination={data?.pagination || null}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
          categories={categories || []}
        />
      </div>
    </Layout>
  )
}
