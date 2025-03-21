'use client'

import { useState } from 'react'
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select'
import { Shapes, Wallet, Users } from 'lucide-react'
import { CategoriesContainer } from './Categories/CategoriesContainer'
import { SafesContainer } from './Safes/SafesContainer'
import { AdminsContainer } from './Admins/AdminsContainer'
import { Category, Safe, OrgAdmin} from '@/db/schema'

interface AdminMobileViewProps {
    orgId: string;
    categories: Category[];
    safes: (Safe & { name?: string })[];
    admins: (OrgAdmin & { ensName?: string })[];
    isAdmin: boolean;
    isLoading: boolean;
}

export default function AdminMobileView({ orgId, categories, safes, admins, isAdmin, isLoading }: AdminMobileViewProps) {
    const [activeTab, setActiveTab] = useState('categories')

    // Get the appropriate label for the active tab
    const getTabLabel = (tab: string) => {
        switch (tab) {
            case 'categories':
                return (
                    <span className="flex items-center gap-2">
                        <Shapes size={20} className="text-blue-600" />
                        Categories
                        {categories && (
                            <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                {categories.length}
                            </span>
                        )}
                    </span>
                );
            case 'safes':
                return (
                    <span className="flex items-center gap-2">
                        <Wallet size={20} className="text-blue-600" />
                        Safes
                        {safes && (
                            <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                {safes.length}
                            </span>
                        )}
                    </span>
                );
            case 'admins':
                return (
                    <span className="flex items-center gap-2">
                        <Users size={20} className="text-blue-600" />
                        Admins
                        {admins && (
                            <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                {admins.length}
                            </span>
                        )}
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="w-full mb-4">
                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full border-gray-200 border-b rounded-none pb-3 px-1">
                        <SelectValue>{getTabLabel(activeTab)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="categories">
                            <span className="flex items-center gap-2">
                                <Shapes size={20} />
                                Categories
                                {categories && (
                                    <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                        {categories.length}
                                    </span>
                                )}
                            </span>
                        </SelectItem>
                        <SelectItem value="safes">
                            <span className="flex items-center gap-2">
                                <Wallet size={20} />
                                Safes
                                {safes && (
                                    <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                        {safes.length}
                                    </span>
                                )}
                            </span>
                        </SelectItem>
                        <SelectItem value="admins">
                            <span className="flex items-center gap-2">
                                <Users size={20} />
                                Admins
                                {admins && (
                                    <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                        {admins.length}
                                    </span>
                                )}
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="relative w-full">
                {/* Categories Content */}
                <div className={`${activeTab === 'categories' ? 'block' : 'hidden'} rounded-lg bg-white relative w-full`}>
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                        </div>
                    ) : (
                        <CategoriesContainer
                            organizationId={orgId}
                            categories={categories || []}
                            isLoading={isLoading}
                            isAdmin={isAdmin}
                        />
                    )}
                </div>

                {/* Safes Content */}
                <div className={`${activeTab === 'safes' ? 'block' : 'hidden'} rounded-lg bg-white relative w-full`}>
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                        </div>
                    ) : (
                        <SafesContainer
                            organizationId={orgId}
                            safes={safes}
                            isLoading={isLoading}
                            isAdmin={isAdmin}
                        />
                    )}
                </div>

                {/* Admins Content */}
                <div className={`${activeTab === 'admins' ? 'block' : 'hidden'} rounded-lg bg-white relative w-full`}>
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                        </div>
                    ) : (
                        <AdminsContainer
                            organizationId={orgId}
                            admins={admins}
                            isLoading={isLoading}
                            isAdmin={isAdmin}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}


