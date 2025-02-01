import Image from 'next/image'
import { useState } from 'react'

import { Layout } from '@/components/Layout'
import SafeSelector from '@/components/SafeSelector'
import { SafeStats } from '@/components/SafeStats'
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

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold">Explore ENS Safes</h1>
            <div className="text-neutral-500">
              View transactions and annotations of ENS DAO Working Group Safes.
            </div>
          </div>
          <Image
            src="/img/logo-filled.svg"
            alt="ENS Logo"
            width={80}
            height={80}
            className="w-28 -rotate-3 rounded-3xl border-2 border-white shadow-[0_0_22px_0_#00000029]"
          />
        </div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <SafeSelector
              safeAddress={selectedSafe}
              onChange={setSelectedSafe}
            />
            <SafeStats safeAddress={selectedSafe} />
          </div>
          <Button
            onClick={() => setIsSyncDialogOpen(true)}
            className="whitespace-nowrap bg-blue-500 hover:bg-blue-600"
          >
            Sync Transactions
          </Button>
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
