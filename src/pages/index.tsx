import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'

import { Layout } from '@/components/Layout'
import SafeSelector from '@/components/SafeSelector'
import TransactionTable from '@/components/TransactionTable'
import { TransferResponse } from '@/types/transfers'

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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
          <SafeSelector safeAddress={selectedSafe} onChange={setSelectedSafe} />
        </div>

        <TransactionTable
          transfers={data?.results || []}
          safeAddress={selectedSafe}
          pagination={data?.pagination || null}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
      </div>
    </Layout>
  )
}
