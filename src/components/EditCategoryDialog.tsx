import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CategoryItem } from '@/db/schema'
import { api } from '@/utils/trpc'

interface EditCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  transferId: string
  currentCategoryId: string | null
  currentDescription: string
  categories: CategoryItem[]
  safeName?: string
  safeAddress: string
  transactionHash: string
}

export function EditCategoryDialog({
  isOpen,
  onClose,
  transferId,
  currentCategoryId,
  currentDescription,
  categories,
  safeName,
  safeAddress,
  transactionHash,
}: EditCategoryDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    currentCategoryId
  )
  const [description, setDescription] = useState(currentDescription)
  const utils = api.useUtils()

  // Update selected category and description when props change or dialog opens
  useEffect(() => {
    setSelectedCategory(currentCategoryId)
    setDescription(currentDescription)
  }, [currentCategoryId, currentDescription, isOpen])

  const { mutate: updateCategory } = api.transfers.updateCategory.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.transfers.getTransfers.invalidate(),
        utils.transfers.getAllTransfersByWallet.invalidate(),
        utils.categories.getAllTransferCategories.invalidate(),
      ])
      onClose()
    },
  })

  const handleSave = async () => {
    await updateCategory({
      transferId,
      categoryId: selectedCategory,
      description: description.trim() || null,
    })
  }

  const handleValueChange = (value: string) => {
    setSelectedCategory(value === 'none' ? null : value)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <div className="mt-2 space-y-1 text-sm text-gray-500">
            <p>
              Safe:{' '}
              {safeName
                ? `${safeName} (${formatAddress(safeAddress)})`
                : formatAddress(safeAddress)}
            </p>
            <p>
              Transaction:{' '}
              <a
                href={`https://etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                {formatAddress(transactionHash)}
              </a>
            </p>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={selectedCategory || 'none'}
              onValueChange={handleValueChange}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border p-2"
              placeholder="Add a description (optional)"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
