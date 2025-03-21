import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/trpc'
import { OrgAdmin } from '@/db/schema'
import { AdminRow } from './AdminRow'
import { NewAdminDialog } from './NewAdminDialog'
import { toast } from 'sonner'

interface AdminsContainerProps {
  organizationId: string
  admins: Array<OrgAdmin & { ensName?: string }>
  isLoading: boolean
  isAdmin: boolean
}

export function AdminsContainer({ organizationId, admins, isLoading, isAdmin }: AdminsContainerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const utils = api.useUtils()

  // Create admin mutation
  const { mutate: createAdmin, isPending: createLoading } = api.admin.addAdminToOrg.useMutation({
    onSuccess: () => {
      utils.admin.getOrgAdmins.invalidate({ organizationId })
      toast.success("Admin added successfully", {
        duration: 5000,
      })
    },
    onError: (error) => {
        console.error('Error adding admin:', error)
        toast.error("Error adding admin", {
            description: error.message || "An unexpected error occurred. Please try again.",
            duration: 5000,
          })
    }
  })

  // Filter admins based on search term
  const filteredAdmins = admins?.filter(admin => {
    const searchLower = searchTerm.toLowerCase()
    return admin.walletAddress.toLowerCase().includes(searchLower)
  }) || []

  const handleAddAdmin = (address: string) => {
    if (!address.trim()) return
    
    createAdmin({
      walletAddress: address.trim(),
      organizationId
    })
  }

  const invalidateAdmins = () => {
    utils.admin.getOrgAdmins.invalidate({ organizationId })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left side - Description */}
      <div className="md:col-span-1">
        <h3 className="text-xl font-semibold mb-4">Admins</h3>
        <p className="text-gray-500">
          Manage admin users for your organization. Admins can add and remove safes, categories, and other admins.
        </p>
        <p className="text-gray-500 mt-4">
          Each admin needs to have a valid Ethereum wallet address.
        </p>
      </div>

      {/* Right side - Admins Table */}
      <div className="md:col-span-2">
        {/* Search and Add section */}
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <div className="flex justify-between items-center gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search admins by wallet address..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isAdmin && (
                <NewAdminDialog
                  onAddAdmin={handleAddAdmin}
                  isLoading={createLoading}
                />
              )}
            </div>
          </div>

          {/* Admins List */}
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
            ) : filteredAdmins.length > 0 ? (
              <div>
                {filteredAdmins.map(admin => (
                  <AdminRow
                    key={admin.walletAddress}
                    admin={admin}
                    canEditOrDelete={isAdmin}
                    onDeleteSuccess={invalidateAdmins}
                  />
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-gray-500 py-4 text-center">
                No admins found matching &quot;{searchTerm}&quot;
              </div>
            ) : (
              <div className="text-gray-500 py-4 text-center">
                No admins found. Add your first admin to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}