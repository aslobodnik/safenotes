import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/trpc'
import { SafesRow } from './SafesRow'
import { NewSafeDialog } from './NewSafeDialog'
import { Safe } from '@/db/schema'
import { toast } from 'sonner'

interface SafesContainerProps {
  organizationId: string
  safes: Array<Safe & { name?: string }>
  isLoading: boolean
  isAdmin: boolean
}

export function SafesContainer({ organizationId, safes, isLoading, isAdmin }: SafesContainerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const utils = api.useUtils()

  // Create safe mutation
  const { mutate: createSafe, isPending: createLoading } = api.safes.create.useMutation({
    onSuccess: () => {
      utils.safes.getByOrganizationWithEns.invalidate({ organizationId })
      toast.success("Safe added successfully", {
        duration: 5000,
      })
    },
    onError: (error) => {
      console.error('Error adding safe:', error)
      toast.error("Error adding safe", {
        description: error.message || "An unexpected error occurred. Please try again.",
        duration: 5000,
      })
    }
  })

  // Filter safes based on search term (check both address and ENS name)
  const filteredSafes = safes?.filter(safe => {
    const searchLower = searchTerm.toLowerCase()
    const addressMatch = safe.address.toLowerCase().includes(searchLower)
    const ensMatch = safe.name?.toLowerCase().includes(searchLower)
    
    return addressMatch || ensMatch
  }) || []

  const handleAddSafe = (address: string) => {
    if (!address.trim()) return
    
    createSafe({
      address: address.trim(),
      organizationId
    })
  }

  const invalidateSafes = () => {
    utils.safes.getByOrganizationWithEns.invalidate({ organizationId })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left side - Description */}
      <div className="md:col-span-1">
        <h3 className="text-xl font-semibold mb-4">Safes</h3>
        <p className="text-gray-500">
          Manage safe addresses for your organization. Add Safe wallets for tracking transactions and categorizing them.
        </p>
        <p className="text-gray-500 mt-4">
          Each safe can have transactions categorized for easier accounting and reporting.
        </p>
      </div>

      {/* Right side - Safes Table */}
      <div className="md:col-span-2">
        {/* Search and Add section */}
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <div className="flex justify-between items-center gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search safes by address or ENS..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isAdmin && (
                <NewSafeDialog
                  onAddSafe={handleAddSafe}
                  isLoading={createLoading}
                />
              )}
            </div>
          </div>

          {/* Safes List */}
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
            ) : filteredSafes.length > 0 ? (
              <div>
                {filteredSafes.map(safe => (
                  <SafesRow
                    key={safe.address}
                    safe={safe}
                    canEditOrDelete={isAdmin}
                    onDeleteSuccess={invalidateSafes}
                  />
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-gray-500 py-4 text-center">
                No safes found matching &quot;{searchTerm}&quot;
              </div>
            ) : (
              <div className="text-gray-500 py-4 text-center">
                No safes found. Add your first safe to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
