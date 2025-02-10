import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'

import { Layout } from '@/components/Layout'
import SafeSelector from '@/components/SafeSelector'
import { SafeStats } from '@/components/SafeStats'
import { SyncTransactionsDialog } from '@/components/SyncTransactionsDialog'
import { TableSkeleton } from '@/components/TableSkeleton'
import TransactionTable from '@/components/TransactionTable'
import { Button } from '@/components/ui/button'
import { adminAddresses } from '@/lib/auth'
import { api } from '@/utils/trpc'

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const { data: session } = useSession()
  const isAdmin = adminAddresses.includes(session?.user?.name || '')

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
    <>
      <Head>
        {/* Basic HTML Meta */}
        <title>SafeNotes</title>
        <meta
          name="description"
          content="Annotate multisig transactions. Build DAO transparency."
        />

        {/* OpenGraph / Facebook */}
        <meta property="og:title" content="ENS Safes Notes" />
        <meta
          property="og:description"
          content="Annotate multisig transactions. Build DAO transparency."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://safenotes.xyz/" />
        <meta
          property="og:image"
          content="https://safenotes.xyz/img/og-image.png"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ENS Safes Notes" />
        <meta
          name="twitter:description"
          content="Annotate multisig transactions. Build DAO transparency."
        />
        <meta
          name="twitter:image"
          content="https://safenotes.xyz/img/og-image.png"
        />
      </Head>

      <Layout>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-bold">Explore ENS Safes</h1>
              <div className="text-neutral-500">
                View transactions and annotations of ENS DAO Working Group
                Safes.
              </div>
            </div>
            <Image
              src="/img/logo-filled.svg"
              alt="ENS Logo"
              width={80}
              height={80}
              className="hidden w-20 -rotate-3 rounded-3xl border-2 border-white shadow-[0_0_22px_0_#00000029] sm:block md:w-28"
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
            {isAdmin && (
              <Button
                onClick={() => setIsSyncDialogOpen(true)}
                className="hidden whitespace-nowrap bg-neutral-50 text-neutral-900 hover:bg-neutral-100 md:block"
              >
                Sync
              </Button>
            )}
          </div>
          {isLoading ? (
            <TableSkeleton isAdmin={isAdmin} />
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
    </>
  )
}
