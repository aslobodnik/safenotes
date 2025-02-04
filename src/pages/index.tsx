import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'

import { Layout } from '@/components/Layout'
import SafeSelector from '@/components/SafeSelector'
import { SafeStats } from '@/components/SafeStats'
import { SyncTransactionsDialog } from '@/components/SyncTransactionsDialog'
import { TableSkeleton } from '@/components/TableSkeleton'
import TransactionTable from '@/components/TransactionTable'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/trpc'

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)

  const { data: session } = useSession()

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

  const {
    data: allSafes,
    isLoading: allSafesLoading,
    isError: allSafesError,
  } = api.safes.getAllSafes.useQuery()

  const isLoading =
    transfersLoading ||
    transferCategoriesLoading ||
    categoriesLoading ||
    allSafesLoading

  const isError =
    transfersError ||
    transferCategoriesError ||
    categoriesError ||
    allSafesError

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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
            <SafeSelector
              safeAddress={selectedSafe}
              onChange={setSelectedSafe}
            />
            <SafeStats safeAddress={selectedSafe} />
          </div>
          <Button
            onClick={() => setIsSyncDialogOpen(true)}
            className="hidden whitespace-nowrap bg-neutral-50 text-neutral-900 hover:bg-neutral-100 md:block"
          >
            Sync
          </Button>
        </div>
        {isLoading ? (
          <TableSkeleton isAdmin={!!session} />
        ) : transfers ? (
          <TransactionTable
            transfers={transfers}
            transferCategories={transferCategories || []}
            categories={categories || []}
            safeAddress={selectedSafe}
            isLoading={isLoading}
            allSafes={allSafes || []}
          />
        ) : null}
        {isError && <div> transfers error </div>}
        <SyncTransactionsDialog
          isOpen={isSyncDialogOpen}
          onClose={() => setIsSyncDialogOpen(false)}
        />
      </div>
    </Layout>
  )
}
