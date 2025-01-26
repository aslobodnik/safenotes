import Image from 'next/image'
import { useEffect, useState } from 'react'

import { Layout } from '@/components/Layout'
import SafeSelector from '@/components/SafeSelector'
import TransactionTable from '@/components/TransactionTable'
import { PaginationInfo, Transfer, TransferResponse } from '@/types/transfers'

export default function Home() {
  const [selectedSafe, setSelectedSafe] = useState('')
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await fetch(`/api/transfers?page=${currentPage}`)
        if (response.ok) {
          const data: TransferResponse = await response.json()
          setTransfers(data.results)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error('Failed to fetch transfers:', error)
      }
    }

    fetchTransfers()
  }, [currentPage, selectedSafe])

  const filteredTransfers = selectedSafe
    ? transfers.filter(
        (transfer) => transfer.safe.toLowerCase() === selectedSafe.toLowerCase()
      )
    : transfers

  console.log(filteredTransfers.length)

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
          <SafeSelector value={selectedSafe} onChange={setSelectedSafe} />
        </div>
        <TransactionTable
          transfers={filteredTransfers}
          safeAddress={selectedSafe}
          pagination={pagination}
          onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  )
}
