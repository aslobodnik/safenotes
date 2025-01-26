import Image from 'next/image'
import { useState } from 'react'

import { Layout } from '@/components/Layout'
import SafeSelector from '@/components/SafeSelector'
import TransactionTable from '@/components/TransactionTable'
import { api } from '@/utils/trpc'

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = api.transfers.getTransfers.useQuery({
    page: currentPage,
    safeAddress: selectedSafe,
    includeRemoved: false,
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
