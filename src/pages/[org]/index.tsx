import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { api } from '@/utils/trpc';
import { useState } from 'react';
import SafeSelector from '@/components/SafeSelector'
import { useSession } from 'next-auth/react'
import { TableSkeleton } from '@/components/TableSkeleton'
import { SafeStats } from '@/components/SafeStats'
import { adminAddresses } from '@/lib/auth'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SyncTransactionsDialog } from '@/components/SyncTransactionsDialog'
import TransactionTable from '@/components/TransactionTable';
import { Button } from '@/components/ui/button';

export default function OrganizationPage() {
  const router = useRouter();
  const { org } = router.query;
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const { data: session } = useSession()
  const isAdmin = adminAddresses.includes(session?.user?.name || '')

  const { data: organization } = api.organizations.getBySlug.useQuery(
    { slug: org as string },
    { enabled: !!org }
  );

  const { data: safes } = api.safes.getByOrganization.useQuery(
    { organizationId: organization?.id ?? '' },
    { enabled: !!organization }
  );

  // Get all transactions for this organization's safes
  const { data: transfers, isLoading: transfersLoading, error: transfersError } = api.transfers.getTransfers.useQuery(
    { safeAddress: selectedSafe },
    { enabled: !!safes?.length }
  );

  const {
    data: transferCategories,
    isLoading: transferCategoriesLoading,
    error: transferCategoriesError,
  } = api.categories.getAllTransferCategories.useQuery();

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = api.categories.getCategoriesByOrganization.useQuery(
    { organizationId: organization?.id ?? '' },
    { enabled: !!organization?.id }
  );

  const isLoading = transfersLoading || transferCategoriesLoading || categoriesLoading
  const isError = transfersError || transferCategoriesError || categoriesError

  return (
    <Layout>
      <div className="space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{organization?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold">{organization?.name}</h1>
            <div className="text-neutral-500">{organization?.description}</div>
          </div>
          <img
            src={organization?.logoImage}
            alt={`${organization?.name} Logo`}
            className="w-20 h-20"
          />
        </div>

        {/* Transactions Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
            <SafeSelector
              safeAddress={selectedSafe}
              onChange={setSelectedSafe}
              organizationId={organization?.id ?? ''}
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
            allSafes={safes || []}
          />
        ) : null}
        {isError && <div> transfers error </div>}
        <SyncTransactionsDialog
          isOpen={isSyncDialogOpen}
          onClose={() => setIsSyncDialogOpen(false)}
          organizationId={organization?.id ?? ''}
        />
      </div>
    </Layout>
  );
} 