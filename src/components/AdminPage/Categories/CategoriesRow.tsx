import { useState } from 'react'
import { Trash, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/trpc'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog'
import { toast } from 'sonner'

interface CategoriesRowProps {
  category: {
    id: string
    name: string
  }
  canEditOrDelete: boolean
  onDeleteSuccess?: () => void
  onUpdateSuccess?: () => void
  onEdit: () => void
  organizationId?: string
}

export function CategoriesRow({ category, onDeleteSuccess, onUpdateSuccess, canEditOrDelete, onEdit, organizationId }: CategoriesRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(category.name)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Delete category mutation
  const { mutate: deleteCategory, isPending: deleteLoading } = api.categories.delete.useMutation({
    onSuccess: () => {
      toast.success('Category deleted successfully', {
        duration: 5000,
      })
      if (onDeleteSuccess) onDeleteSuccess()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      setDeleteDialogOpen(false)
      toast.error('Error deleting category', {
        description: error.message || 'An unexpected error occurred. Please try again.',
        duration: 5000,
      })
    }
  })

  // Update category mutation
  const { mutate: updateCategory, isPending: updateLoading } = api.categories.updateCategory.useMutation({
    onSuccess: () => {
      setIsEditing(false)
      if (onUpdateSuccess) onUpdateSuccess()
    }
  })

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteCategory({ id: category.id })
  }

  const handleCancelDelete = () => {
    // Dialog will be closed automatically via onOpenChange
  }

  const handleUpdate = () => {
    if (editedName.trim() === '') return
    
    if (!organizationId) {
      console.error('organizationId is required for updating category')
      return
    }
    
    updateCategory({
      id: category.id,
      name: editedName.trim(),
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedName(category.name)
  }

  return (
    <>
      <div className="flex items-center justify-between py-3 border-b border-gray-100 group">
        {isEditing && canEditOrDelete ? (
          <div className="flex items-center flex-grow gap-2">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="h-9"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleUpdate}
                disabled={updateLoading || editedName.trim() === ''}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-gray-900">{category.name}</span>
            {canEditOrDelete && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onEdit}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDeleteClick}
                  className="h-8 w-8 p-0"
                  disabled={deleteLoading}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        headerText={`Remove category ${category.name}?`}
        contextText={`This will permanently delete the category "${category.name}". This action cannot be undone.`}
        onDelete={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteLoading}
      />
    </>
  )
}
