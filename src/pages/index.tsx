import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'
import { Address } from 'viem'

import { Layout } from '@/components/Layout'
import SafeSelector from '@/components/SafeSelector'
import TransactionTable from '@/components/TransactionTable'
import { publicClient } from '@/lib/web3'
import { TransferResponse } from '@/types/transfers'

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: signersData } = useQuery({
    queryKey: ['safe-signers', selectedSafe],
    queryFn: async () => {
      const safeApiUrl = new URL(
        `/api/v1/safes/${selectedSafe}/`,
        process.env.NEXT_PUBLIC_SAFES_API_URL
      )

      const response = await fetch(safeApiUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch safe signers')
      }

      return await response.json()
    },
    enabled: !!selectedSafe,
  })

  console.log('signersData', signersData)

  const { data, isLoading } = useQuery<TransferResponse>({
    queryKey: ['transfers', currentPage, selectedSafe],
    queryFn: async () => {
      const url = new URL('/api/transfers', window.location.origin)
      url.searchParams.set('page', currentPage.toString())

      if (selectedSafe) {
        url.searchParams.set('safe', selectedSafe)
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch transfers')
      }

      return await response.json()
    },
  })

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Image
            src="/ens-logo.svg"
            alt="ENS Logo"
            width={120}
            height={120}
            priority
          />
          <div className="flex gap-4">
            <SafeSelector
              safeAddress={selectedSafe}
              onChange={setSelectedSafe}
            />
            <SafeSigners signersData={signersData} />
          </div>
        </div>

        <TransactionTable
          transfers={data?.results || []}
          safeAddress={selectedSafe}
          pagination={data?.pagination || null}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
      </div>
    </Layout>
  )
}

interface SafeInfo {
  owners: string[]
  threshold: number
}

function SafeSigners({ signersData }: { signersData: SafeInfo | null }) {
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
            {name
              ? `${name} (${address})`
              : `${address.slice(0, 6)}...${address.slice(-4)}`}
          </li>
        ))}
      </ul>
    </div>
  )
}
