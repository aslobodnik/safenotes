import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'

import { Layout } from '@/components/Layout'
import SafeBalances from '@/components/SafeBalances'
import SafeSelector from '@/components/SafeSelector'
import SafeSigners from '@/components/SafeSigners'
import { SyncTransactionsDialog } from '@/components/SyncTransactionsDialog'
import TransactionTable from '@/components/TransactionTable'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/trpc'

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)

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
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-4">
            <Image
              src="/img/logo-filled.svg"
              alt="ENS Logo"
              width={128}
              height={128}
              className="w-28 -rotate-3 rounded-3xl border-4 border-white shadow-[0_0_22px_0_#00000029] md:w-32"
            />

            <div className="flex items-center gap-4">
              <SafeSelector
                safeAddress={selectedSafe}
                onChange={setSelectedSafe}
              />
              <Button
                onClick={() => setIsSyncDialogOpen(true)}
                className="whitespace-nowrap"
              >
                Sync Transactions
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-12">
            <SafeSigners signersData={signersData} />
            <SafeBalances safeAddress={selectedSafe} />
          </div>
        </div>

        <TransactionTable
          transfers={transfers?.results || []}
          safeAddress={selectedSafe}
          pagination={transfers?.pagination || null}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
          categories={categories || []}
        />

        <SyncTransactionsDialog
          isOpen={isSyncDialogOpen}
          onClose={() => setIsSyncDialogOpen(false)}
        />
      </div>
    </Layout>
  )
}
