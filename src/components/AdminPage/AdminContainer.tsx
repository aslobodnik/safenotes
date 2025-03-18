import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/utils/trpc'
import { cn } from '@/lib/utils'
import { Users, Wallet, Shapes } from 'lucide-react'
import { CategoriesContainer } from './Categories/CategoriesContainer'
import { SafesContainer } from './Safes/SafesContainer'
import { adminAddresses } from '@/lib/auth';
import { useSession } from 'next-auth/react';

interface AdminContainerProps {
    orgId: string
}

export function AdminContainer({ orgId }: AdminContainerProps) {
    const { data: session } = useSession();

    const [activeTab, setActiveTab] = useState('categories')
    const [isAdmin, setIsAdmin] = useState(false);

    // Fetch categories for this organization
    const {
        data: categories,
        isLoading: categoriesLoading,
        error: categoriesError
    } = api.categories.getCategoriesByOrganization.useQuery(
        { organizationId: orgId },
        { enabled: !!orgId }
    )

    // Fetch safes for this organization
    const {
        data: safes,
        isLoading: safesLoading,
        error: safesError
    } = api.safes.getByOrganizationWithEns.useQuery(
        { organizationId: orgId },
        { enabled: !!orgId }
    )

    // Fetch admins for this organization
    const {
        data: admins,
        isLoading: adminsLoading,
        error: adminsError
    } = api.admin.getOrgAdmins.useQuery(
        { organizationId: orgId },
        { enabled: !!orgId }
    )

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
    }, [isAdmin, adminsLoading, admins, session]);



    // Check if any data is still loading
    const isLoading = categoriesLoading || safesLoading || adminsLoading

    // Check for any errors
    const hasError = categoriesError || safesError || adminsError

    if (hasError) {
        return <div className="text-red-500">Error loading data: {hasError.message}</div>
    }

    return (
        <div className="mt-6">
            <Tabs defaultValue="categories" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="mb-4 bg-transparent border-b border-gray-200 p-0 h-auto w-full justify-start">
                    <TabsTrigger
                        value="categories"
                        className={cn(
                            "px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none relative rounded-none border-0 text-base",
                            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-blue-600",
                            activeTab !== 'categories' && "text-black"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Shapes
                                size={20}
                                className={activeTab === 'categories' ? 'text-blue-600' : 'text-black'}
                            />
                            Categories
                            {categories && (
                                <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                    {categories.length}
                                </span>
                            )}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="safes"
                        className={cn(
                            "px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none relative rounded-none border-0 text-base",
                            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-blue-600",
                            activeTab !== 'safes' && "text-black"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Wallet
                                size={20}
                                className={activeTab === 'safes' ? 'text-blue-600' : 'text-black'}
                            />
                            Safes
                            {safes && (
                                <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                    {safes.length}
                                </span>
                            )}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="admins"
                        className={cn(
                            "px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none relative rounded-none border-0 text-base",
                            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-blue-600",
                            activeTab !== 'admins' && "text-black"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Users
                                size={20}
                                className={activeTab === 'admins' ? 'text-blue-600' : 'text-black'}
                            />
                            Admins
                            {admins && (
                                <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                    {admins.length}
                                </span>
                            )}
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="p-6 rounded-lg bg-white">
                    {isLoading && activeTab === 'categories' ? (
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                        </div>
                    ) : categoriesError ? (
                        <div className="text-red-500">Error loading categories: {categoriesError}</div>
                    ) : (
                        <CategoriesContainer
                            organizationId={orgId}
                            categories={categories || []}
                            isLoading={categoriesLoading}
                            isAdmin={isAdmin}
                        />
                    )}
                </TabsContent>

                <TabsContent value="safes" className="p-6 rounded-lg bg-white">
                    {isLoading && activeTab === 'safes' ? (
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                        </div>
                    ) : safesError ? (
                        <div className="text-red-500">Error loading safes: {safesError}</div>
                    ) : (
                        <SafesContainer
                            organizationId={orgId}
                            safes={safes ? safes.map(safe => ({ ...safe, name: safe.name || undefined })) : []}
                            isLoading={safesLoading}
                            isAdmin={isAdmin}
                        />
                    )}
                </TabsContent>

                <TabsContent value="admins" className="p-6 rounded-lg bg-white">
                    <h3 className="text-xl font-semibold mb-4">Admins</h3>
                    <p className="text-gray-500 mb-4">Manage admin users who have access to this organization.</p>

                    {isLoading && activeTab === 'admins' ? (
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                        </div>
                    ) : adminsError ? (
                        <div className="text-red-500">Error loading admins: {adminsError}</div>
                    ) : admins && admins.length > 0 ? (
                        <div className="space-y-4">
                            {/* Admin list will be implemented here */}
                            <div className="text-gray-500">Found {admins.length} admins</div>
                        </div>
                    ) : (
                        <div className="text-gray-500">No admins found. Add your first admin.</div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
