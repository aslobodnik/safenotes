import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDeleteDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean 
  
  /**
   * Function to call when the dialog should be closed
   */
  onOpenChange: (open: boolean) => void
  
  /**
   * The title text for the dialog
   */
  headerText: string
  
  /**
   * The description text for the dialog
   */
  contextText: string
  
  /**
   * Function to call when the delete action is confirmed
   */
  onDelete: () => void
  
  /**
   * Function to call when the delete action is cancelled
   */
  onCancel: () => void
  
  /**
   * Whether the delete operation is currently loading
   */
  isLoading?: boolean
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  headerText,
  contextText,
  onDelete,
  onCancel,
  isLoading = false
}: ConfirmDeleteDialogProps) {
  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }
  
  const handleDelete = () => {
    onDelete()
    // Don't close the dialog here - let the parent component close it when the operation is complete
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl">{headerText}</DialogTitle>
          <DialogDescription className="mt-2">
            {contextText}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-6 flex space-x-2 justify-center">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}