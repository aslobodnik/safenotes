import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { publicClient } from '@/lib/web3'
import { TransactionTableProps } from '@/types/transfers'

interface AddressMap {
  [key: string]: string | null
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="mt-4 flex items-center justify-between px-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}

export default function TransactionTable({
  transfers,
  safeAddress,
  pagination,
  onPageChange,
  isLoading,
}: TransactionTableProps) {
  const [ensNames, setEnsNames] = useState<AddressMap>({})

  // Collect unique addresses from transfers
  useEffect(() => {
    const fetchEnsNames = async () => {
      const uniqueAddresses = new Set<string>()

      // Add null check for transfers
      if (!transfers) return

      transfers.forEach((transfer) => {
        uniqueAddresses.add(transfer.from)
        uniqueAddresses.add(transfer.to)
      })

      const names: AddressMap = {}

      // Batch resolve ENS names
      await Promise.all(
        Array.from(uniqueAddresses).map(async (address) => {
          try {
            const name = await publicClient.getEnsName({
              address: address as `0x${string}`,
            })
            names[address] = name
          } catch (err) {
            console.error(`Failed to resolve ENS for ${address}:`, err)
            names[address] = null
          }
        })
      )

      setEnsNames(names)
    }

    fetchEnsNames()
  }, [transfers])

  const formatAddress = (address: string) => {
    const ensName = ensNames[address]
    if (ensName) {
      return ensName
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return <Loader2 className="animate-spin" />
  }

  if (!transfers || transfers.length === 0) {
    return <div>No transfers found</div>
  }

  return (
    <div>
      <table className="min-w-full">
        <thead className="border-b">
          <tr>
            <th className="p-4 text-left">Safe</th>
            <th className="p-4 text-left">Action</th>
            <th className="p-4 text-left">Address</th>
            <th className="p-4 text-right">Amount</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-left">Description</th>
            <th className="p-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer) => {
            // If a safe is selected, use it to determine direction
            // Otherwise use the transfer's safe
            const isOutgoing = safeAddress
              ? transfer.from.toLowerCase() === safeAddress.toLowerCase()
              : transfer.from.toLowerCase() === transfer.safe?.toLowerCase()

            const counterpartyAddress = isOutgoing ? transfer.to : transfer.from

            return (
              <tr key={transfer.transferId} className="border-b">
                <td className="p-4 font-mono">
                  {formatAddress(transfer.safe || '')}
                </td>
                <td className="p-4 font-mono">
                  <a
                    href={`https://etherscan.io/tx/${transfer.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer hover:text-blue-500"
                    title="View on Etherscan"
                  >
                    {isOutgoing ? '→' : '←'}
                  </a>
                </td>
                <td className="p-4 font-mono" title={counterpartyAddress}>
                  {formatAddress(counterpartyAddress)}
                </td>
                <td className="p-4 text-right">
                  {transfer.tokenInfo?.symbol === 'ETH' ||
                  transfer.tokenInfo?.symbol === 'WETH' ||
                  !transfer.tokenInfo
                    ? `${(
                        Number(transfer.value) / Math.pow(10, 18)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })} ${transfer.tokenInfo?.symbol || 'ETH'}`
                    : `${(
                        Number(transfer.value) /
                        Math.pow(10, transfer.tokenInfo.decimals)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })} ${transfer.tokenInfo.symbol}`}
                </td>
                <td className="p-4">{transfer.category || '-'}</td>
                <td className="p-4">{transfer.description || '-'}</td>
                <td className="p-4">
                  {format(new Date(transfer.executionDate), 'd MMM yyyy')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
