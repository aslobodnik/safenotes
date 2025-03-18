import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/utils/trpc'
import { cn } from '@/lib/utils'
import { Users, Wallet, Shapes } from 'lucide-react'
import { CategoriesContainer } from './Categories/CategoriesContainer'
import { SafesContainer } from './Safes/SafesContainer'
import { adminAddresses } from '@/lib/auth';
import { useSession } from 'next-auth/react';
import AdminDesktopView from './AdminDesktopView';
import AdminMobileView from './AdminMobileView';

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

    if (isLoading) {
        return (
            <div className="mt-6 relative w-full overflow-hidden">
                <div className="space-y-4">
                    <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                </div>
            </div>
        )
    }
    if (hasError) {
        return <div className="text-red-500">Error loading data: {hasError.message}</div>
    }

    return (
        <div className="mt-6 relative w-full overflow-hidden">
            <div className="hidden md:block">
                <AdminDesktopView 
                    orgId={orgId} 
                    categories={categories || []} 
                    safes={safes ? safes.map(safe => ({ ...safe, name: safe.name || undefined })) : []} 
                    admins={admins || []} 
                    isAdmin={isAdmin} 
                    isLoading={isLoading} 
                />
            </div>
            <div className="md:hidden">
                <AdminMobileView 
                    orgId={orgId} 
                    categories={categories || []} 
                    safes={safes ? safes.map(safe => ({ ...safe, name: safe.name || undefined })) : []} 
                    admins={admins || []} 
                    isAdmin={isAdmin} 
                    isLoading={isLoading} 
                />
            </div>
        </div>
    )
}
