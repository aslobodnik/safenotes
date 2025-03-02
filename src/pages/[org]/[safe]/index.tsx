import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { api } from '@/utils/trpc';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import TransactionTable from '@/components/TransactionTable';

export default function SafePage() {
  const router = useRouter();
  const { org, safe } = router.query;

  const { data: organization } = api.organizations.getBySlug.useQuery(
    { slug: org as string },
    { enabled: !!org }
  );

  const { data: transfers } = api.transfers.getTransfers.useQuery({
    safeAddress: safe as string,
  });

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
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${org}`}>
                {organization?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Safe: {safe}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <TransactionTable
          transfers={transfers || []}
          safeAddress={safe as string}
          transferCategories={transferCategories || []}
          categories={categories || []}
          allSafes={[]}
          isLoading={false}
          // ... other props
        />
      </div>
    </Layout>
  );
} 