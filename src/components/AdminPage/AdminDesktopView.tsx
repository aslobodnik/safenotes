'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Shapes, Wallet, Users } from 'lucide-react'
import { CategoriesContainer } from './Categories/CategoriesContainer'
import { SafesContainer } from './Safes/SafesContainer'
import { AdminsContainer } from './Admins/AdminsContainer'
import { Category, Safe, OrgAdmin} from '@/db/schema'

interface AdminDesktopViewProps {
    orgId: string;
    categories: Category[];
    safes: (Safe & { name?: string })[];
    admins: (OrgAdmin & { ensName?: string })[];
    isAdmin: boolean;
    isLoading: boolean;
}

export default function AdminDesktopView({ orgId, categories, safes, admins, isAdmin, isLoading }: AdminDesktopViewProps) {
    const [activeTab, setActiveTab] = useState('categories')

    return (
        <div>
            <Tabs defaultValue="categories" onValueChange={setActiveTab} value={activeTab} className="w-full">
                <div className="relative">
                    <TabsList className="mb-4 bg-transparent border-b border-gray-200 p-0 h-auto flex w-full relative overflow-visible justify-start">
                        <TabsTrigger
                            value="categories"
                            className={cn(
                                "px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none relative rounded-none border-0 text-base whitespace-nowrap flex-shrink-0",
                                "after:absolute after:content-[''] after:bottom-0 after:left-0 after:right-0 after:h-0.5 data-[state=active]:after:bg-blue-600 data-[state=inactive]:after:bg-transparent",
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
                                "px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none relative rounded-none border-0 text-base whitespace-nowrap flex-shrink-0",
                                "after:absolute after:content-[''] after:bottom-0 after:left-0 after:right-0 after:h-0.5 data-[state=active]:after:bg-blue-600 data-[state=inactive]:after:bg-transparent",
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
                                "px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none relative rounded-none border-0 text-base whitespace-nowrap flex-shrink-0",
                                "after:absolute after:content-[''] after:bottom-0 after:left-0 after:right-0 after:h-0.5 data-[state=active]:after:bg-blue-600 data-[state=inactive]:after:bg-transparent",
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
                </div>

                <div className="relative w-full">
                    <TabsContent value="categories" className="p-6 rounded-lg bg-white border border-gray-100 relative w-full">
                        {isLoading && activeTab === 'categories' ? (
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
                    </TabsContent>

                    <TabsContent value="safes" className="p-6 rounded-lg bg-white border border-gray-100 relative w-full">
                        {isLoading && activeTab === 'safes' ? (
                            <div className="space-y-4">
                                <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            </div>
                        ) : (
                            <SafesContainer
                                organizationId={orgId}
                                safes={safes ? safes.map(safe => ({ ...safe, name: safe.name || undefined })) : []}
                                isLoading={isLoading}
                                isAdmin={isAdmin}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="admins" className="p-6 rounded-lg bg-white border border-gray-100 relative w-full">
                        {isLoading && activeTab === 'admins' ? (
                            <div className="space-y-4">
                                <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full max-w-md"></div>
                            </div>
                        ) : (
                            <AdminsContainer
                                organizationId={orgId}
                                admins={admins || []}
                                isLoading={isLoading}
                                isAdmin={isAdmin}
                            />
                        )}
                    </TabsContent>
                </div>
            </Tabs>       </div>
    )
}
