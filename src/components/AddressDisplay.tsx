import { useState } from 'react'
import { CheckCircle2, Copy } from 'lucide-react'

export interface AddressDisplayProps {
    address: string;
    chain?: string;
}

// Component for displaying addresses in a mobile-friendly way
export function AddressDisplay({ address, chain }: AddressDisplayProps) {
    const [copied, setCopied] = useState(false)
  
    const formatAddress = (addr: string) => {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }
  
    const copyToClipboard = () => {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  
    return (
      <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
        <div className="flex items-center">
          {chain && (
            <span className="mr-2 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
              {chain}
            </span>
          )}
          <span className="font-mono text-sm">{formatAddress(address)}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center text-blue-500 hover:text-blue-700"
          title="Copy address"
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="ml-1 text-xs sm:hidden">Copy</span>
        </button>
      </div>
    )
  }