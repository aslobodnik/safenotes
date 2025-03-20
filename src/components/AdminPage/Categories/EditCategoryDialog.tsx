import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface EditCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  category: {
    id: string
    name: string
  }
  allCategories: Array<{
    id: string
    name: string
  }>
  onSave: (id: string, name: string) => void
  isLoading: boolean
}

export function EditCategoryDialog({
  isOpen,
  onClose,
  category,
  allCategories,
  onSave,
  isLoading,
}: EditCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState(category.name)
  const [error, setError] = useState<string | null>(null)

  // Reset form when dialog opens or category changes
  useEffect(() => {
    if (isOpen) {
      setCategoryName(category.name)
      setError(null)
    }
  }, [isOpen, category])

  // Check for duplicate and validate changes
  const validateName = (name: string): boolean => {
    const trimmedName = name.trim()
    
    // Check if empty
    if (!trimmedName) {
      setError('Category name cannot be empty')
      return false
    }
    
    // Check if unchanged
    if (trimmedName.toLowerCase() === category.name.toLowerCase()) {
      return false
    }
    
    // Check for duplicates (case insensitive)
    const isDuplicate = allCategories.some(
      cat => cat.id !== category.id && cat.name.toLowerCase() === trimmedName.toLowerCase()
    )
    
    if (isDuplicate) {
      setError(`A category with name "${trimmedName}" already exists`)
      return false
    }
    
    setError(null)
    return true
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setCategoryName(newName)
    
    // Only validate if there's content to validate
    if (newName.trim()) {
      validateName(newName)
    } else {
      setError('Category name cannot be empty')
    }
  }

  const handleSave = () => {
    const trimmedName = categoryName.trim()
    
    if (validateName(trimmedName)) {
      onSave(category.id, trimmedName)
    }
  }

  // Check if save should be enabled
  const isSaveDisabled = 
    isLoading ||
    !categoryName.trim() ||
    categoryName.trim() === category.name ||
    !!error

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Name</label>
            <Input
              value={categoryName}
              onChange={handleNameChange}
              className="w-full"
              placeholder="Enter category name"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className={`${isSaveDisabled ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isLoading ? 'Saving...' : 'Done'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
