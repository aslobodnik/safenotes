import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

import { publicClient } from '@/lib/web3'
import { Safe } from '@/types/transfers'

interface SafeSelectorProps {
  safeAddress: string | null
  onChange: (value: string) => void
}

export default function SafeSelector({
  safeAddress,
  onChange,
}: SafeSelectorProps) {
  const safes = useQuery({
    queryKey: ['safe-selector'],
    queryFn: async () => {
      const response = await fetch(`/api/safes`)

      if (!response.ok) {
        throw new Error('Failed to fetch safe transfers')
      }

      const data: Safe[] = await response.json()

      const names = await Promise.all(
        data.map(async (safe) => {
          const name = await publicClient.getEnsName({
            address: safe.address as Address,
          })

          return {
            ...safe,
            name,
          }
        })
      )

      return names
    },
  })

  return (
    <div className="mb-4">
      <select
        value={safeAddress || ''}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[300px] rounded-md border p-2 text-black"
      >
        <option value="">Select a Safe</option>
        {safes.data?.map((safe) => (
          <option key={safe.address} value={safe.address}>
            {safe.name
              ? safe.name
              : `${safe.address.slice(0, 6)}...${safe.address.slice(-4)}`}
          </option>
        ))}
      </select>
    </div>
  )
}
