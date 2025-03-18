import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useSession } from 'next-auth/react'
import { Layout } from '@/components/Layout'
import { api } from '@/utils/trpc'
import { AdminContainer } from '@/components/AdminPage/AdminContainer'
import { OrgHeader } from '@/components/OrgHeader'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,

    SelectValue
} from '@/components/ui/select'
export default function TestAdmin() {
    const { address } = useAccount()
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

    // Fetch organizations where the current user is an admin
    const { data: adminOrgs, isLoading: orgsLoading } = api.admin.getOrgsByAdmin.useQuery(
        { walletAddress: address || session?.user?.name || '' },
        { enabled: !!(address || session?.user?.name) }
    )

    const { data: organization } = api.organizations.getById.useQuery(
        { id: selectedOrgId || '' },
        { enabled: !!selectedOrgId }
    )

    // Auto-select the organization if there's only one
    useEffect(() => {
        if (!orgsLoading && adminOrgs) {
            setIsLoading(false)

            // If there's only one organization, auto-select it
            if (adminOrgs.length === 1) {
                setSelectedOrgId(adminOrgs[0].id)
            }
        }
    }, [adminOrgs, orgsLoading])

    // Handle organization selection from dropdown
    const handleOrgChange = (orgId: string) => {
        setSelectedOrgId(orgId)
    }
    return (
        <Layout>
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-2">Manage Admins, Safes, and categories.</p>
                    </div>
                </div>
                {isLoading && (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
                        <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
                        <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
                    </div>
                )}
                {
                    (!adminOrgs || adminOrgs.length === 0) && (
                        <div className="rounded-lg border p-6 text-center">
                            <p className="text-gray-500">You don&apos;t have admin access to any organizations</p>
                        </div>
                    )
                }

                <div>
                    {/* Organization Selector (only show when multiple orgs) */}
                    {adminOrgs && adminOrgs.length > 1 && (
                        <Card className="mb-6">
                            <CardHeader className="pb-3">
                                <CardTitle>Select Organization</CardTitle>
                                <CardDescription>
                                    Choose which organization to manage
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={selectedOrgId || undefined}
                                    onValueChange={handleOrgChange}
                                >
                                    <SelectTrigger className="w-full md:w-[300px]">
                                        <SelectValue placeholder="Select an organization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {adminOrgs.map((org) => (
                                            <SelectItem key={org.id} value={org.id}>
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    )}
                    {organization && (
                        <OrgHeader organization={organization} />
                    )}
                    {/* Admin Container - Only show when an org is selected */}
                    {selectedOrgId && (
                        <div className="w-full">
                            <AdminContainer orgId={selectedOrgId} />
                        </div>
                    )}

                    {/* Show a message if no org is selected and there are multiple orgs */}
                    {/* {!selectedOrgId && adminOrgs && adminOrgs.length > 1 && (
                        <div className="rounded-lg border p-6 text-center">
                            <p className="text-gray-500">Please select an organization to manage</p>
                        </div>
                    )} */}
                </div>

            </div>
        </Layout>
    );
}
