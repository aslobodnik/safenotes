import { useState } from 'react'
import { Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/trpc'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog'
import { Safe } from '@/db/schema'
import { toast } from 'sonner'

interface SafesRowProps {
  safe: Safe & { name?: string }
  canEditOrDelete: boolean
  onDeleteSuccess: () => void
}

export function SafesRow({ safe, onDeleteSuccess, canEditOrDelete }: SafesRowProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Delete safe mutation
  const { mutate: deleteSafe, isPending: deleteLoading } = api.safes.softDelete.useMutation({
    onSuccess: () => {
      if (onDeleteSuccess) onDeleteSuccess()
      setDeleteDialogOpen(false)
      toast.success("Safe removed", {
        description: `Safe ${safe.name || truncateAddress(safe.address)} has been successfully removed.`,
        duration: 4000,
        id: `delete-safe-success-${safe.address}`, // Unique ID to prevent duplicates
      })
    },
    onError: (error) => {
      setDeleteDialogOpen(false)
      toast.error("Error removing safe", {
        description: error.message || "An unexpected error occurred. Please try again.",
        duration: 5000,
        id: `delete-safe-error-${safe.address}`, // Unique ID to prevent duplicates
      })
    }
  })

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteSafe({ address: safe.address })
  }

  const handleCancelDelete = () => {
    // Dialog will be closed automatically via onOpenChange
  }

  // Truncate the address for display
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Generate Etherscan link
  const getEtherscanLink = (address: string) => {
    return `https://etherscan.io/address/${address}`
  }

  return (
    <>
      <div className="flex items-center justify-between py-3 border-b border-gray-100 group">
          <>
            <div className="flex flex-col">
              {safe?.name && (
                <span className="text-gray-900 font-medium">{safe.name}</span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-mono text-sm">
                  {truncateAddress(safe.address)}
                </span>
                <a 
                  href={getEtherscanLink(safe.address)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            {canEditOrDelete && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDeleteClick}
                  className="h-8 w-8 p-0"
                  disabled={deleteLoading}
                >
                  <Trash2 size={16} className="text-gray-500" />
                </Button>
              </div>
            )}
          </>
        </div>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        headerText={`Remove safe ${safe.name || truncateAddress(safe.address)}?`}
        contextText={`Transfers from this safe will no longer be visible.`}
        onDelete={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteLoading}
      />
    </>
  )
}
