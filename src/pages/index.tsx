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
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)

  const {
    data: transfers,
    isLoading: transfersLoading,
    isError: transfersError,
  } = api.transfers.getTransfers.useQuery({
    safeAddress: selectedSafe,
  })

  const {
    data: transferCategories,
    isLoading: transferCategoriesLoading,
    isError: transferCategoriesError,
  } = api.categories.getAllTransferCategories.useQuery()

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = api.categories.getAll.useQuery()

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
                className="whitespace-nowrap bg-blue-500 hover:bg-blue-600"
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

        {(transfersLoading ||
          transferCategoriesLoading ||
          categoriesLoading) && <div> transfers loading </div>}
        {(transfersError || transferCategoriesError || categoriesError) && (
          <div> transfers error </div>
        )}
        {transfers && (
          <TransactionTable
            transfers={transfers || []}
            transferCategories={transferCategories || []}
            categories={categories || []}
            safeAddress={selectedSafe}
            isLoading={transfersLoading || transferCategoriesLoading}
          />
        )}

        <SyncTransactionsDialog
          isOpen={isSyncDialogOpen}
          onClose={() => setIsSyncDialogOpen(false)}
        />
      </div>
    </Layout>
  )
}
