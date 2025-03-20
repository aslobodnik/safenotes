import { useState } from 'react'
import { Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/trpc'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog'
import { OrgAdmin } from '@/db/schema'
import { toast } from 'sonner'

interface AdminRowProps {
  admin: OrgAdmin & { ensName?: string }
  canEditOrDelete: boolean
  onDeleteSuccess: () => void
}

export function AdminRow({ admin, onDeleteSuccess, canEditOrDelete }: AdminRowProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Delete admin mutation
  const { mutate: deleteAdmin, isPending: deleteLoading } = api.admin.removeAdminFromOrg.useMutation({
    onSuccess: () => {
      if (onDeleteSuccess) onDeleteSuccess()
      setDeleteDialogOpen(false)
      toast.success("Admin removed", {
        description: `Admin ${truncateAddress(admin.walletAddress)} has been successfully removed.`,
        duration: 4000,
        id: `delete-admin-success-${admin.walletAddress}`, // Unique ID to prevent duplicates
      })
    },
    onError: (error) => {
      setDeleteDialogOpen(false)
      toast.error("Error removing admin", {
        description: error.message || "An unexpected error occurred. Please try again.",
        duration: 5000,
        id: `delete-admin-error-${admin.walletAddress}`, // Unique ID to prevent duplicates
      })
    }
  })

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteAdmin({ 
      organizationId: admin.organizationId,
      walletAddress: admin.walletAddress 
    })
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
        <div className="flex flex-col">
          <div className="flex flex-col gap-2">
            {admin.ensName && (
              <span className="text-gray-900 font-medium">{admin.ensName}</span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-mono text-sm">
                {truncateAddress(admin.walletAddress)}
              </span>
              <a 
              href={getEtherscanLink(admin.walletAddress)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              <ExternalLink size={14} />
              </a>
            </div>
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
      </div>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        headerText={`Remove admin ${admin.ensName || truncateAddress(admin.walletAddress)}?`}
        contextText={`This admin will no longer have access to this organization.`}
        onDelete={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteLoading}
      />
    </>
  )
}
