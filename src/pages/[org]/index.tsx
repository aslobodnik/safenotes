import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { api } from '@/utils/trpc';
import { useEffect, useState, useRef } from 'react';
import { type AddressMap, fetchEnsNames } from '@/utils/fetch-ens-names';
import { truncateAddress } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import WalletCard from '@/components/WalletCard';
import TransactionTable from '@/components/TransactionTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrganizationPage() {
  const router = useRouter();
  const transactionsRef = useRef<HTMLDivElement>(null);
  const { org } = router.query;
  const [ensNames, setEnsNames] = useState<AddressMap>({});
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);

  const { data: organization } = api.organizations.getBySlug.useQuery(
    { slug: org as string },
    { enabled: !!org }
  );

  const { data: safes } = api.safes.getByOrganization.useQuery(
    { organizationId: organization?.id ?? '' },
    { enabled: !!organization }
  );

  // Get all transactions for this organization's safes
  const { data: transfers } = api.transfers.getTransfers.useQuery(
    { safeAddress: selectedSafe },
    { enabled: !!safes?.length }
  );

  const {
    data: transferCategories,
    isLoading: transferCategoriesLoading,
  } = api.categories.getAllTransferCategories.useQuery();

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = api.categories.getAll.useQuery();

  // Fetch ENS names for safe addresses
  useEffect(() => {
    const getEnsNames = async () => {
      if (!safes) return;
      const addresses = safes.map(safe => safe.address);
      const names = await fetchEnsNames(addresses);
      setEnsNames(names);
    };

    getEnsNames();
  }, [safes]);

  const formatAddress = (address: string) => {
    const ensName = ensNames[address];
    if (ensName) {
      return ensName;
    }
    return truncateAddress(address);
  };

  const handleSafeClick = (safeAddress: string) => {
    router.push(`/${org}/${safeAddress}`);
  };

  const scrollToTransactions = () => {
    transactionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

        {/* Mobile Transactions Button */}
        <div className="md:hidden">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={scrollToTransactions}
          >
            View All Transactions
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Safes Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Safes
            {safes && (
              <span className="text-sm font-normal text-muted-foreground">
                ({safes.length})
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safes?.map((safe) => (
              <WalletCard
                key={safe.address}
                safe={safe}
                ensName={ensNames[safe.address] || undefined}
                orgSlug={org as string}
                onClick={() => handleSafeClick(safe.address)}
              />
            ))}
          </div>
        </div>

        {/* Transactions Section */}
        <div ref={transactionsRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Transactions</h2>
            <div className="w-[250px]">
              <Select
                value={selectedSafe || "all"}
                onValueChange={(value) => setSelectedSafe(value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Safe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Safes
                  </SelectItem>
                  {safes?.map((safe) => (
                    <SelectItem key={safe.address} value={safe.address}>
                      {ensNames[safe.address] || truncateAddress(safe.address)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TransactionTable
            transfers={transfers || []}
            transferCategories={transferCategories || []}
            categories={categories || []}
            safeAddress={selectedSafe}
            isLoading={transferCategoriesLoading || categoriesLoading}
            allSafes={safes || []}
          />
        </div>
      </div>
    </Layout>
  );
} 