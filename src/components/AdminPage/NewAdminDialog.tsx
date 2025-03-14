import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAddress } from 'viem'
import { Plus } from 'lucide-react'

interface NewAdminDialogProps {
  /**
   * Function to call when a new admin is added
   */
  onAddAdmin: (walletAddress: string) => void
  
  /**
   * Whether the add operation is currently loading
   */
  isLoading?: boolean
}

export function NewAdminDialog({ onAddAdmin, isLoading = false }: NewAdminDialogProps) {
  const [open, setOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [error, setError] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      // Validate and normalize the address
      const normalizedAddress = getAddress(walletAddress)
      
      // Call the parent component's function
      onAddAdmin(normalizedAddress)
      
      // Reset form and close dialog
      setWalletAddress('')
      setOpen(false)
    } catch (err) {
      console.error(err)
      setError('Invalid Ethereum address format')
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Add New Admin</DialogTitle>
          <DialogDescription>
            Enter the wallet address of the admin you want to add to this organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoading ? 'Adding...' : 'Add Admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
