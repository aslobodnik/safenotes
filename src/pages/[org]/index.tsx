import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { api } from '@/utils/trpc';

import { useState, useEffect } from 'react';
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
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session } = useSession();

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

  // Fetch organization admins to check if current user is an admin
  const { data: admins, isLoading: adminsLoading, error: adminsError } = api.admin.getOrgAdmins.useQuery(
    { organizationId: organization?.id ?? '' },
    { enabled: !!organization?.id }
  );

  // Determine if the current user is an admin for this organization
  useEffect(() => {
    const isSuperAdmin = adminAddresses.includes(session?.user?.name || '');
    if (isSuperAdmin) {
      setIsAdmin(true);
      return;
    }

    if (admins && session?.user?.name) {
      const userWalletAddress = session.user.name.toLowerCase();
      const isOrgAdmin = admins.some(
        (admin: { walletAddress: string }) => admin.walletAddress.toLowerCase() === userWalletAddress
      );
      setIsAdmin(isOrgAdmin);
    }
  }, [admins, session]);

  const isLoading = transfersLoading || transferCategoriesLoading || categoriesLoading || adminsLoading;
  const isError = transfersError || transferCategoriesError || categoriesError || adminsError;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{organization?.name}</BreadcrumbPage>
              </BreadcrumbItem>
              {isAdmin && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/${org}/admin`}>Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSyncDialogOpen(true)}
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
                Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/${org}/admin`)}
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Admin
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold">{organization?.name}</h1>
            <div className="text-neutral-500">{organization?.description}</div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <img
              src={organization?.logoImage}
              alt={`${organization?.name} Logo`}
              className="w-20 h-20"
            />
            {isAdmin && (
              <div className="md:hidden flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsSyncDialogOpen(true)}
                  className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                    <path d="M3 22v-6h6"></path>
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                  </svg>
                  Sync
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${org}/admin`)}
                  className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Admin
                </Button>
              </div>
            )}
          </div>
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