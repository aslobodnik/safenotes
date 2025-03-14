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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAddress } from 'viem'
import { chainEnum } from '@/db/schema'
import { Plus } from 'lucide-react'

export type Chain = typeof chainEnum.enumValues[number]

interface NewSafeDialogProps {
  /**
   * Function to call when a new safe is added
   */
  onAddSafe: (address: string, chain: Chain) => void
  
  /**
   * Whether the add operation is currently loading
   */
  isLoading?: boolean
}

export function NewSafeDialog({ onAddSafe, isLoading = false }: NewSafeDialogProps) {
  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [chain, setChain] = useState<Chain>('ETH')
  const [error, setError] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      // Validate and normalize the address
      const normalizedAddress = getAddress(address)
      
      // Call the parent component's function
      onAddSafe(normalizedAddress, chain)
      
      // Reset form and close dialog
      setAddress('')
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
          Add Safe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Add New Safe</DialogTitle>
          <DialogDescription>
            Enter the details of the safe you want to add to this organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="address">Safe Address</Label>
              <Input
                id="address"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chain">Blockchain</Label>
              <Select value={chain} onValueChange={(value: Chain) => setChain(value)}>
                <SelectTrigger id="chain">
                  <SelectValue placeholder="Select blockchain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">Ethereum</SelectItem>
                  <SelectItem value="ARB">Arbitrum</SelectItem>
                  <SelectItem value="UNI">Uniswap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoading ? 'Adding...' : 'Add Safe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
