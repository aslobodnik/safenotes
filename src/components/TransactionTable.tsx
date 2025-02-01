import { format } from 'date-fns'
import Image from 'next/image'
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
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPreviousPage}
              className="relative inline-flex items-center gap-1 rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="relative inline-flex items-center gap-1 rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

const ITEMS_PER_PAGE = 10

interface TransactionDirectionAmountProps {
  isOutgoing: boolean
  transactionHash: string
  amount: string
  tokenSymbol: string
  tokenDecimals: number
}

const TransactionDirectionAmount = ({
  isOutgoing,
  transactionHash,
  amount,
  tokenSymbol,
  tokenDecimals,
}: TransactionDirectionAmountProps) => {
  const formattedAmount =
    tokenSymbol === 'ETH' || tokenSymbol === 'WETH' || !tokenSymbol
      ? `${(Number(amount) / Math.pow(10, 18)).toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })} ${tokenSymbol || 'ETH'}`
      : `${(Number(amount) / Math.pow(10, tokenDecimals || 18)).toLocaleString(
          undefined,
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }
        )} ${tokenSymbol}`

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://etherscan.io/tx/${transactionHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer hover:text-blue-500"
        title="View on Etherscan"
      >
        <Image
          src={isOutgoing ? '/img/out-arrow.svg' : '/img/in-arrow.svg'}
          alt={isOutgoing ? 'Outgoing transaction' : 'Incoming transaction'}
          width={32}
          height={32}
        />
      </a>
      <span>{formattedAmount}</span>
    </div>
  )
}

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
            <TableRow className="h-[50px]">
              <TableHead className="w-[60px]">Edit</TableHead>
              <TableHead className="w-[180px]">Safe</TableHead>
              <TableHead className="w-[200px]">Amount</TableHead>
              <TableHead className="w-[180px]">Address</TableHead>
              <TableHead className="w-[140px]">Category</TableHead>
              <TableHead className="hidden w-[200px] md:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden w-[140px] md:table-cell">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <TableRow key={i} className="h-[50px] animate-pulse">
                <TableCell className="min-h-[50px] w-[60px]">
                  <div className="h-8 w-8 rounded bg-gray-200" />
                </TableCell>
                <TableCell className="min-h-[50px] w-[180px]">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </TableCell>
                <TableCell className="min-h-[50px] w-[200px]">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </TableCell>
                <TableCell className="min-h-[50px] w-[180px]">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </TableCell>
                <TableCell className="min-h-[50px] w-[140px]">
                  <div className="h-4 w-20 rounded bg-gray-200" />
                </TableCell>
                <TableCell className="hidden min-h-[50px] w-[200px] md:table-cell">
                  <div className="h-4 w-40 rounded bg-gray-200" />
                </TableCell>
                <TableCell className="hidden min-h-[50px] w-[140px] md:table-cell">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!transfers || transfers.length === 0) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-[50px]">
              <TableHead className="w-[60px]">Edit</TableHead>
              <TableHead className="w-[180px]">Safe</TableHead>
              <TableHead className="w-[200px]">Amount</TableHead>
              <TableHead className="w-[180px]">Address</TableHead>
              <TableHead className="w-[140px]">Category</TableHead>
              <TableHead className="hidden w-[200px] md:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden w-[140px] md:table-cell">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <TableRow key={i} className="h-[50px]">
                <TableCell className="w-[60px]" />
                <TableCell className="w-[180px]" />
                <TableCell className="w-[200px]" />
                <TableCell className="w-[180px]" />
                <TableCell className="w-[140px]" />
                <TableCell className="hidden w-[200px] md:table-cell" />
                <TableCell className="hidden w-[140px] md:table-cell" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No transfers found</p>
        </div>
      </div>
    )
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
          <TableRow className="h-[50px]">
            <TableHead className="w-[60px]">Edit</TableHead>
            <TableHead className="w-[180px]">Safe</TableHead>
            <TableHead className="w-[200px]">Amount</TableHead>
            <TableHead className="w-[180px]">Address</TableHead>
            <TableHead className="w-[140px]">Category</TableHead>
            <TableHead className="hidden w-[200px] md:table-cell">
              Description
            </TableHead>
            <TableHead className="hidden w-[140px] md:table-cell">
              Date
            </TableHead>
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
              <TableRow key={transfer.transferId} className="h-[50px]">
                <TableCell className="min-h-[50px] w-[60px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(transfer.transferId)}
                  >
                    ✏️
                  </Button>
                </TableCell>
                <TableCell className="min-h-[50px] w-[180px]">
                  {formatAddress(transfer.safeAddress)}
                </TableCell>
                <TableCell className="min-h-[50px] w-[200px]">
                  <TransactionDirectionAmount
                    isOutgoing={isOutgoing}
                    transactionHash={transfer.transactionHash}
                    amount={transfer.value || '0'}
                    tokenSymbol={transfer.tokenSymbol || ''}
                    tokenDecimals={transfer.tokenDecimals || 18}
                  />
                </TableCell>
                <TableCell
                  className="min-h-[50px] w-[180px]"
                  title={counterpartyAddress}
                >
                  {formatAddress(counterpartyAddress)}
                </TableCell>
                <TableCell className="min-h-[50px] w-[140px] whitespace-nowrap font-medium">
                  {categoryName}
                </TableCell>
                <TableCell className="hidden min-h-[50px] w-[200px] text-muted-foreground md:table-cell">
                  {description}
                </TableCell>
                <TableCell className="hidden min-h-[50px] w-[140px] md:table-cell">
                  {format(new Date(transfer.executionDate), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            )
          })}
          {/* Empty rows */}
          {[...Array(ITEMS_PER_PAGE - paginatedTransfers.length)].map(
            (_, i) => (
              <TableRow key={`empty-${i}`} className="h-[50px]">
                <TableCell className="min-h-[50px] w-[60px]" />
                <TableCell className="min-h-[50px] w-[180px]" />
                <TableCell className="min-h-[50px] w-[200px]" />
                <TableCell className="min-h-[50px] w-[180px]" />
                <TableCell className="min-h-[50px] w-[140px]" />
                <TableCell className="hidden min-h-[50px] w-[200px] md:table-cell" />
                <TableCell className="hidden min-h-[50px] w-[140px] md:table-cell" />
              </TableRow>
            )
          )}
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
