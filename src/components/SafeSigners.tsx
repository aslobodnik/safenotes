import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

import { publicClient } from '@/lib/web3'

interface SafeInfo {
  owners: string[]
  threshold: number
}

export default function SafeSigners({
  signersData,
}: {
  signersData: SafeInfo | null
}) {
  const { data: safesWithEns, isLoading } = useQuery({
    queryKey: ['safe-signers-ens', signersData?.owners],
    queryFn: async () => {
      if (!signersData) return []

      const names = await Promise.all(
        signersData.owners.map(async (address: string) => {
          const name = await publicClient.getEnsName({
            address: address as Address,
          })

          return {
            address,
            name,
          }
        })
      )

      return names
    },
    enabled: !!signersData?.owners,
  })

  if (!signersData) return null

  return (
    <div className="text-sm">
      <div className="mb-1 font-semibold">
        Signers ({signersData.threshold}/{signersData.owners.length}):
      </div>
      <ul className="space-y-1">
        {isLoading ? (
          <>
            <li className="h-6 w-32 animate-pulse rounded bg-gray-200"></li>
            <li className="h-6 w-32 animate-pulse rounded bg-gray-200"></li>
            <li className="h-6 w-32 animate-pulse rounded bg-gray-200"></li>
          </>
        ) : (
          safesWithEns?.map(({ address, name }) => (
            <li key={address} className="font-mono text-gray-600">
              {name
                ? `${name}`
                : `${address.slice(0, 6)}...${address.slice(-4)}`}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
