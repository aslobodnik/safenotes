import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import { EditCategoryDialog } from '@/components/EditCategoryDialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  type CategoryItem,
  type TransferCategoryItem,
  type TransferItem,
} from '@/db/schema'
import { truncateAddress } from '@/lib/utils'
import { publicClient } from '@/lib/web3'
import { api } from '@/utils/trpc'

interface AddressMap {
  [key: string]: string | null
}

interface TransactionTableProps {
  transfers: TransferItem[]
  transferCategories: TransferCategoryItem[]
  safeAddress: string | null
  isLoading: boolean
  categories: CategoryItem[]
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

const ITEMS_PER_PAGE = 20

export default function TransactionTable({
  transfers,
  transferCategories,
  safeAddress,
  isLoading,
  categories,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [ensNames, setEnsNames] = useState<AddressMap>({})
  const [editingTransfer, setEditingTransfer] = useState<string | null>(null)
  const utils = api.useUtils()

  // Calculate pagination
  const totalItems = transfers.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTransfers = transfers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  // Collect unique addresses from transfers
  useEffect(() => {
    const fetchEnsNames = async () => {
      const uniqueAddresses = new Set<string>()

      if (!transfers) return

      transfers.forEach((transfer) => {
        uniqueAddresses.add(transfer.fromAddress)
        uniqueAddresses.add(transfer.toAddress)
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
    return truncateAddress(address)
  }

  const handleEditCategory = (transferId: string) => {
    setEditingTransfer(transferId)
  }

  const handleDialogClose = async () => {
    setEditingTransfer(null)
    // Refetch the transfer categories to update the UI
    await Promise.all([
      utils.transfers.getTransfers.invalidate(),
      utils.transfers.getAllTransfersByWallet.invalidate(),
      utils.categories.getTransferCategories.invalidate(),
    ])
  }

  const getCategoryName = (transferId: string): string => {
    const currentMapping = transferCategories.find(
      (tc) => tc.transferId === transferId
    )
    if (!currentMapping) return 'None'

    const category = categories.find((c) => c.id === currentMapping.categoryId)
    return category?.name || 'None'
  }

  const getCategoryDescription = (transferId: string): string => {
    const currentMapping = transferCategories.find(
      (tc) => tc.transferId === transferId
    )
    return currentMapping?.description || '-'
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Edit</TableHead>
              <TableHead>Safe</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell>
                  <div className="h-4 w-8 rounded bg-gray-200"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-4 rounded bg-gray-200"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-4 w-20 rounded bg-gray-200"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 rounded bg-gray-200"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-40 rounded bg-gray-200"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!transfers || transfers.length === 0) {
    return <div className="text-muted-foreground">No transfers found</div>
  }

  return (
    <div className="rounded-lg border">
      <EditCategoryDialog
        isOpen={!!editingTransfer}
        onClose={handleDialogClose}
        transferId={editingTransfer || ''}
        currentCategoryId={
          editingTransfer
            ? transferCategories.find((tc) => tc.transferId === editingTransfer)
                ?.categoryId || null
            : null
        }
        currentDescription={
          editingTransfer
            ? transferCategories.find((tc) => tc.transferId === editingTransfer)
                ?.description || ''
            : ''
        }
        categories={categories}
        safeAddress={
          editingTransfer
            ? transfers.find((t) => t.transferId === editingTransfer)
                ?.safeAddress || ''
            : ''
        }
        transactionHash={
          editingTransfer
            ? transfers.find((t) => t.transferId === editingTransfer)
                ?.transactionHash || ''
            : ''
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Edit</TableHead>
            <TableHead>Safe</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTransfers.map((transfer) => {
            const isOutgoing = safeAddress
              ? transfer.fromAddress.toLowerCase() === safeAddress.toLowerCase()
              : transfer.fromAddress.toLowerCase() ===
                transfer.safeAddress.toLowerCase()

            const counterpartyAddress = isOutgoing
              ? transfer.toAddress
              : transfer.fromAddress

            const categoryName = getCategoryName(transfer.transferId)
            const description = getCategoryDescription(transfer.transferId)

            return (
              <TableRow key={transfer.transferId}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(transfer.transferId)}
                  >
                    ✏️
                  </Button>
                </TableCell>
                <TableCell className="font-mono">
                  {formatAddress(transfer.safeAddress)}
                </TableCell>
                <TableCell className="font-mono">
                  <a
                    href={`https://etherscan.io/tx/${transfer.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer hover:text-blue-500"
                    title="View on Etherscan"
                  >
                    {isOutgoing ? '→' : '←'}
                  </a>
                </TableCell>
                <TableCell className="font-mono" title={counterpartyAddress}>
                  {formatAddress(counterpartyAddress)}
                </TableCell>
                <TableCell className="text-right">
                  {transfer.tokenSymbol === 'ETH' ||
                  transfer.tokenSymbol === 'WETH' ||
                  !transfer.tokenSymbol
                    ? `${(
                        Number(transfer.value) / Math.pow(10, 18)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })} ${transfer.tokenSymbol || 'ETH'}`
                    : `${(
                        Number(transfer.value) /
                        Math.pow(10, transfer.tokenDecimals || 18)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })} ${transfer.tokenSymbol}`}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {categoryName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {description}
                </TableCell>
                <TableCell>
                  {format(new Date(transfer.executionDate), 'd MMM yyyy')}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={currentPage < totalPages}
        hasPreviousPage={currentPage > 1}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
