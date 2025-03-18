import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/utils/trpc';
import { Layout } from '@/components/Layout';
import { useSession } from 'next-auth/react';
import { adminAddresses } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useEffect } from 'react';
import { SafeItem, CategoryItem, OrgAdmin } from '@/db/schema';
import { AddressDisplay } from '@/components/AddressDisplay';
import { NewSafeDialog, type Chain } from '@/components/AdminPage/NewSafeDialog';
import { NewCategoryDialog } from '@/components/AdminPage/Categories/NewCategoryDialog';
import { NewAdminDialog } from '@/components/AdminPage/NewAdminDialog';

export default function AdminPage() {
  const router = useRouter();
  const { org } = router.query;
  const { data: session } = useSession();
  
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Get organization data
  const { data: organization } = api.organizations.getBySlug.useQuery(
    { slug: org as string },
    { enabled: !!org }
  );
  
  // Get safes for this organization
  const { 
    data: safes, 
    isLoading: safesLoading,
    error: safesError
  } = api.safes.getByOrganization.useQuery(
    { organizationId: organization?.id ?? '' },
    { enabled: !!organization }
  );
  
  // Get categories for this organization
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = api.categories.getCategoriesByOrganization.useQuery(
    { organizationId: organization?.id ?? '' },
    { enabled: !!organization?.id }
  );
  
  // Get admins for this organization
  const { 
    data: admins, 
    isLoading: adminsLoading,
    error: adminsError 
  } = api.admin.getOrgAdmins.useQuery(
    { organizationId: organization?.id ?? '' },
    { enabled: !!organization?.id }
  );
  
  // tRPC utils for invalidating queries
  const utils = api.useUtils();
  
  // Mutations
  const { mutate: createSafe, isPending: createSafeLoading } = api.safes.create.useMutation({
    onSuccess: () => {
      void utils.safes.getByOrganization.invalidate({ organizationId: organization?.id ?? '' });
    },
    onError: (err) => {
      setError(`Failed to create safe: ${err.message}`);
    }
  });
  
  const { mutate: deleteSafe } = api.safes.softDelete.useMutation({
    onSuccess: () => {
      void utils.safes.getByOrganization.invalidate({ organizationId: organization?.id ?? '' });
    },
    onError: (err) => {
      setError(`Failed to remove safe: ${err.message}`);
    }
  });
  
  const { mutate: createCategory, isPending: createCategoryLoading } = api.categories.create.useMutation({
    onSuccess: () => {
      void utils.categories.getCategoriesByOrganization.invalidate({ organizationId: organization?.id ?? '' });
    },
    onError: (err) => {
      setError(`Failed to create category: ${err.message}`);
    }
  });
  
  const { mutate: deleteCategory } = api.categories.delete.useMutation({
    onSuccess: () => {
      void utils.categories.getCategoriesByOrganization.invalidate({ organizationId: organization?.id ?? '' });
    },
    onError: (err) => {
      setError(`Failed to remove category: ${err.message}`);
    }
  });
  
  const { mutate: addAdmin, isPending: addAdminLoading } = api.admin.addAdminToOrg.useMutation({
    onSuccess: () => {
      void utils.admin.getOrgAdmins.invalidate({ organizationId: organization?.id ?? '' });
    },
    onError: (err) => {
      setError(`Failed to add admin: ${err.message}`);
    }
  });
  
  const { mutate: removeAdmin } = api.admin.removeAdminFromOrg.useMutation({
    onSuccess: () => {
      void utils.admin.getOrgAdmins.invalidate({ organizationId: organization?.id ?? '' });
    },
    onError: (err) => {
      setError(`Failed to remove admin: ${err.message}`);
    }
  });
  
  // Determine if the current user is an admin for this organization
  useEffect(() => {
    if (adminsLoading) {
      return;
    }

    const isSuperAdmin = adminAddresses.includes(session?.user?.name || '');
    if (isSuperAdmin) {
      setIsAdmin(true);
      return;
    }

    if (admins && session?.user?.name) {
      const userWalletAddress = session.user.name.toLowerCase();
      const isOrgAdmin = admins.some(
        (admin) => admin.walletAddress.toLowerCase() === userWalletAddress
      );
      setIsAdmin(isOrgAdmin);
      return;
    }
    router.push(`/${org}`);
  }, [isAdmin, adminsLoading, admins, org, router, session]);
  
  // Handler functions for the dialog components
  const handleAddSafe = (address: string, chain: Chain) => {
    if (organization?.id) {
      createSafe({
        address,
        chain,
        organizationId: organization.id
      });
    }
  };
  
  const handleRemoveSafe = (safeAddress: string) => {
    if (confirm('Are you sure you want to remove this safe?')) {
      deleteSafe({ address: safeAddress });
    }
  };
  
  const handleAddCategory = (name: string) => {
    if (organization?.id) {
      createCategory({
        name,
        organizationId: organization.id
      });
    }
  };
  
  const handleRemoveCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to remove this category?')) {
      deleteCategory({ id: categoryId });
    }
  };
  
  const handleAddAdmin = (walletAddress: string) => {
    if (organization?.id) {
      addAdmin({
        organizationId: organization.id,
        walletAddress
      });
    }
  };
  
  const handleRemoveAdmin = (walletAddress: string) => {
    if (confirm('Are you sure you want to remove this admin?')) {
      if (organization?.id) {
        removeAdmin({
          organizationId: organization.id,
          walletAddress
        });
      }
    }
  };
  
  const isLoading = safesLoading || categoriesLoading || adminsLoading;
  const isError = safesError || categoriesError || adminsError;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Error loading data</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${org}`}>{organization?.name}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Admin</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            {/* Mobile back button */}
            <Button 
              variant="outline" 
              className="md:hidden w-full flex items-center justify-center gap-2"
              onClick={() => router.push(`/${org}`)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {organization?.name}
            </Button>
          </div>
          
          {/* Desktop back button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => router.push(`/${org}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Transactions
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row md:justify-between gap-4 items-center">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-bold">Admin Dashboard</h1>
            <div className="text-neutral-500 text-sm md:text-base">{organization?.description}</div>
          </div>
          <img
            src={organization?.logoImage}
            alt={`${organization?.name} Logo`}
            className="w-16 h-16 md:w-20 md:h-20"
          />
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Safes Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Safes</CardTitle>
              <CardDescription>Manage safes for this organization</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {safes && safes.length === 0 ? (
              <div className="flex flex-col items-center py-6 space-y-4">
                <p className="text-gray-500">No safes found.</p>
                <NewSafeDialog 
                  onAddSafe={handleAddSafe} 
                  isLoading={createSafeLoading}
                />
              </div>
            ) : (
              <ul className="bg-white shadow rounded-lg divide-y">
                {safes?.map((safe: SafeItem) => (
                  <li key={safe.address} className="px-3 py-4 md:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <AddressDisplay 
                      address={safe.address} 
                      chain={safe.chain}
                    />
                    <Button 
                      variant="outline"
                      onClick={() => handleRemoveSafe(safe.address)}
                      className="w-full sm:w-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </li>
                ))}
                <li className="px-3 py-4 md:px-6 flex justify-center">
                  <NewSafeDialog 
                    onAddSafe={handleAddSafe} 
                    isLoading={createSafeLoading}
                  />
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
        
        {/* Categories Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage transaction categories</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {categories && categories.length === 0 ? (
              <div className="flex flex-col items-center py-6 space-y-4">
                <p className="text-gray-500">No categories found.</p>
                <NewCategoryDialog 
                  onAddCategory={handleAddCategory} 
                  isLoading={createCategoryLoading}
                />
              </div>
            ) : (
              <ul className="bg-white shadow rounded-lg divide-y">
                {categories?.map((category: CategoryItem) => (
                  <li key={category.id} className="px-3 py-4 md:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span>{category.name}</span>
                    <Button 
                      variant="outline"
                      onClick={() => handleRemoveCategory(category.id)}
                      className="w-full sm:w-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </li>
                ))}
                <li className="px-3 py-4 md:px-6 flex justify-center">
                  <NewCategoryDialog 
                    onAddCategory={handleAddCategory} 
                    isLoading={createCategoryLoading}
                  />
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
        
        {/* Admins Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Admins</CardTitle>
              <CardDescription>Manage organization administrators</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {admins && admins.length === 0 ? (
              <div className="flex flex-col items-center py-6 space-y-4">
                <p className="text-gray-500">No admins found.</p>
                <NewAdminDialog 
                  onAddAdmin={handleAddAdmin} 
                  isLoading={addAdminLoading}
                />
              </div>
            ) : (
              <ul className="bg-white shadow rounded-lg divide-y">
                {admins?.map((admin: OrgAdmin) => (
                  <li key={admin.id} className="px-3 py-4 md:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <AddressDisplay 
                      address={admin.walletAddress}
                    />
                    <Button 
                      variant="outline"
                      onClick={() => handleRemoveAdmin(admin.walletAddress)}
                      className="w-full sm:w-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </li>
                ))}
                <li className="px-3 py-4 md:px-6 flex justify-center">
                  <NewAdminDialog 
                    onAddAdmin={handleAddAdmin} 
                    isLoading={addAdminLoading}
                  />
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
