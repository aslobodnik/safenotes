import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'

import { Layout } from '@/components/Layout'
import SafeSelector from '@/components/SafeSelector'
import TransactionTable from '@/components/TransactionTable'
import { TransferResponse } from '@/types/transfers'
import { trpcNext } from '@/utils/trpc'
import { SafeItem, Transfer } from '@/db/schema'

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = trpcNext.transfers.getTransfers.useQuery({
    page: currentPage,
    safeAddress: selectedSafe,
    includeRemoved: false,
  })
  const { data: safesData } = trpcNext.safes.getSafes.useQuery()
  
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
        {isLoading && <p> Loading transfers... </p>}
        {data && (
          <div>
            <h1> Transfers from tRPC</h1>
            <p> {data.pagination.totalItems} </p>
            {
              data.results.map( (transfer: Transfer) => <p> {transfer.safeAddress} </p>)
            }
          </div>
        )}
        {safesData && safesData.map((safeItem: SafeItem) => <p> {safeItem.address} </p>)}
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
