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
  const { data: safesWithEns } = useQuery({
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
      <div className="mb-4 text-2xl font-bold">
        {signersData.threshold}/{signersData.owners.length}
      </div>
      <div className="mb-1 font-medium">Signers:</div>
      <ul className="space-y-1">
        {safesWithEns?.map(({ address, name }) => (
          <li key={address} className="font-mono text-gray-600">
            {name ? `${name}` : `${address.slice(0, 6)}...${address.slice(-4)}`}
          </li>
        ))}
      </ul>
    </div>
  )
}
