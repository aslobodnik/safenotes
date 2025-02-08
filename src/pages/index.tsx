import Image from 'next/image'
import { useEffect, useState } from 'react'

import { Layout } from '@/components/Layout'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import SafeSelector from '@/components/SafeSelector'
import { SafeStats } from '@/components/SafeStats'
import { SyncTransactionsDialog } from '@/components/SyncTransactionsDialog'
import TransactionTable from '@/components/TransactionTable'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/trpc'

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const [hasPrefetched, setHasPrefetched] = useState(false)

  const utils = api.useUtils()

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

  // Prefetch transfers for all safes after initial load
  useEffect(() => {
    const prefetchAllSafeTransfers = async () => {
      if (!allSafes || hasPrefetched || isLoading) return

      console.log('🚀 Prefetching transfers for all safes...')

      // Prefetch transfers for each safe
      await Promise.all(
        allSafes.map((safe) =>
          utils.transfers.getTransfers.prefetch({ safeAddress: safe.address })
        )
      )

      setHasPrefetched(true)
      console.log('✅ Prefetched all safe transfers!')
    }

    prefetchAllSafeTransfers()
  }, [allSafes, hasPrefetched, isLoading, utils.transfers.getTransfers])

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
        <div className="relative">
          {/* Loading Indicator */}
          <div
            className={`transition-all duration-500 ${
              isLoading ? 'opacity-100' : 'pointer-events-none opacity-0'
            } absolute inset-0 z-10 h-[600px]`}
          >
            <LoadingIndicator
              steps={[
                {
                  id: 'safes',
                  label: 'Loading safes',
                  status: allSafesLoading ? 'loading' : 'complete',
                },
                {
                  id: 'transfers',
                  label: 'Loading transactions',
                  status: transfersLoading
                    ? 'loading'
                    : allSafesLoading
                      ? 'pending'
                      : 'complete',
                },
                {
                  id: 'categories',
                  label: 'Loading categories',
                  status: categoriesLoading
                    ? 'loading'
                    : transfersLoading
                      ? 'pending'
                      : 'complete',
                },
                {
                  id: 'transfer-categories',
                  label: 'Loading transfer categories',
                  status: transferCategoriesLoading
                    ? 'loading'
                    : categoriesLoading
                      ? 'pending'
                      : 'complete',
                },
              ]}
            />
          </div>

          {/* Table */}
          <div
            className={`transition-opacity duration-500 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ minHeight: '600px' }}
          >
            {transfers && (
              <TransactionTable
                transfers={transfers}
                transferCategories={transferCategories || []}
                categories={categories || []}
                safeAddress={selectedSafe}
                isLoading={false}
                allSafes={allSafes || []}
              />
            )}
          </div>
        </div>
        {isError && <div> transfers error </div>}
        <SyncTransactionsDialog
          isOpen={isSyncDialogOpen}
          onClose={() => setIsSyncDialogOpen(false)}
        />
      </div>
    </Layout>
  )
}
