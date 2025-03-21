import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react';

import { EditCategoryDialog } from '@/components/EditCategoryDialog'
import { TableSkeleton } from '@/components/TableSkeleton'
import { TransactionTableHeader } from '@/components/transaction-table/TableHeader'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import {
  type CategoryItem,
  type SafeItem,
  type TransferCategoryItem,
  type TransferItem,
} from '@/db/schema'
import { truncateAddress } from '@/lib/utils'
import { type AddressMap, fetchEnsNames } from '@/utils/fetch-ens-names'
import { api } from '@/utils/trpc'
import { TransactionCard } from '@/components/TransactionComponent/TransactionCard'

interface TransactionTableProps {
  transfers: TransferItem[]
  transferCategories: TransferCategoryItem[]
  safeAddress: string | null
  isLoading: boolean
  categories: CategoryItem[]
  allSafes: SafeItem[]
  isAdmin: boolean
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
    <div className="flex flex-col items-center gap-2 lg:flex-row">
      <Link
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
      </Link>
      <span className="w-full text-center lg:text-left">{formattedAmount}</span>
    </div>
  )
}

export default function TransactionTable({
  transfers,
  transferCategories,
  safeAddress,
  isLoading,
  categories,
  allSafes,
  isAdmin,
}: TransactionTableProps) {
  const { data: session } = useSession()

  const [currentPage, setCurrentPage] = useState(1)
  const [ensNames, setEnsNames] = useState<AddressMap>({})
  const [editingTransfer, setEditingTransfer] = useState<string | null>(null)
  const utils = api.useUtils()

  // Process transfers to create rows for each safe involved
  const processedTransfers = transfers
    .filter((transfer) => {
      const decimals = transfer.tokenDecimals || 18
      const value = Number(transfer.value) / Math.pow(10, decimals)
      return value >= 0.99 // threshold to show transfers
    })
    .flatMap((transfer) => {
      const rows: (TransferItem & { viewType: 'in' | 'out' })[] = []
      const trackedSafeAddresses = safeAddress
        ? new Set([safeAddress.toLowerCase()])
        : new Set(allSafes.map((safe) => safe.address.toLowerCase()))

      // Check if from address is a tracked safe
      if (trackedSafeAddresses.has(transfer.fromAddress.toLowerCase())) {
        rows.push({
          ...transfer,
          viewType: 'out',
        })
      }

      // Check if to address is a tracked safe
      if (trackedSafeAddresses.has(transfer.toAddress.toLowerCase())) {
        rows.push({
          ...transfer,
          viewType: 'in',
        })
      }

      return rows
    })

  // Calculate pagination based on processed transfers
  const totalItems = processedTransfers.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTransfers = processedTransfers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  // Collect unique addresses and fetch ENS names
  useEffect(() => {
    const getEnsNames = async () => {
      if (!transfers) return

      const addresses = transfers.flatMap((transfer) => [
        transfer.fromAddress,
        transfer.toAddress,
      ])

      const names = await fetchEnsNames(addresses)
      setEnsNames(names)
    }

    getEnsNames()
  }, [transfers])

  const formatAddress = (address: string) => {
    const ensName = ensNames[address]
    if (ensName) {
      return ensName
    }
    return truncateAddress(address)
  }

  const handleEditCategory = (transferId: string) => {
    if (!session) {
      // Optionally add a toast notification here
      return
    }
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
    return <TableSkeleton isAdmin={isAdmin} />
  }

  if (!processedTransfers || processedTransfers.length === 0) {
    return (
      <div className="relative rounded-lg border">
        <Table>
          <TransactionTableHeader showEditColumn={isAdmin} />
          <TableBody>
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <TableRow key={i} className="h-[50px]">
                {isAdmin && <TableCell className="w-[60px]" />}
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
      {isAdmin && (
        <EditCategoryDialog
          isOpen={!!editingTransfer}
          onClose={handleDialogClose}
          transferId={editingTransfer || ''}
          currentCategoryId={
            editingTransfer
              ? transferCategories.find(
                  (tc) => tc.transferId === editingTransfer
                )?.categoryId || null
              : null
          }
          currentDescription={
            editingTransfer
              ? transferCategories.find(
                  (tc) => tc.transferId === editingTransfer
                )?.description || ''
              : ''
          }
          categories={categories}
          safeAddress={
            editingTransfer
              ? processedTransfers.find((t) => t.transferId === editingTransfer)
                  ?.safeAddress || ''
              : ''
          }
          transactionHash={
            editingTransfer
              ? processedTransfers.find((t) => t.transferId === editingTransfer)
                  ?.transactionHash || ''
              : ''
          }
        />
      )}
      
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TransactionTableHeader showEditColumn={isAdmin} />
          <TableBody>
            {paginatedTransfers.map((transfer) => {
              const isOutgoing = transfer.viewType === 'out'
              const mainPartyAddress = isOutgoing
                ? transfer.fromAddress
                : transfer.toAddress
              const counterpartyAddress = isOutgoing
                ? transfer.toAddress
                : transfer.fromAddress
              const categoryName = getCategoryName(transfer.transferId)
              const description = getCategoryDescription(transfer.transferId)

              return (
                <TableRow
                  key={`${transfer.transferId}-${transfer.viewType}`}
                  className="h-[50px]"
                >
                  {isAdmin && (
                    <TableCell className="w-[60px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(transfer.transferId)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                  {/* Safe address */}
                  <TableCell className="min-w-48 sm:min-w-72">
                    <Link
                      target="_blank"
                      href={`https://etherscan.io/address/${transfer.safeAddress}`}
                    >
                      {formatAddress(mainPartyAddress)}
                    </Link>
                  </TableCell>
                  {/* Amount */}
                  <TableCell className="w-[200px]">
                    <TransactionDirectionAmount
                      isOutgoing={isOutgoing}
                      transactionHash={transfer.transactionHash}
                      amount={transfer.value || '0'}
                      tokenSymbol={transfer.tokenSymbol || ''}
                      tokenDecimals={transfer.tokenDecimals || 18}
                    />
                  </TableCell>
                  {/* Counterparty address */}
                  <TableCell className="min-w-48" title={counterpartyAddress}>
                    <Link
                      target="_blank"
                      href={`https://etherscan.io/address/${counterpartyAddress}`}
                    >
                      {formatAddress(counterpartyAddress)}
                    </Link>
                  </TableCell>
                  {/* Category */}
                  <TableCell className="min-w-48 whitespace-nowrap font-medium">
                    {categoryName}
                  </TableCell>
                  {/* Description */}
                  <TableCell className="hidden max-w-[200px] md:table-cell">
                    <HoverCard openDelay={200}>
                      <HoverCardTrigger asChild>
                        <span className="block cursor-help overflow-hidden truncate text-ellipsis text-muted-foreground">
                          {description}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <p className="break-words text-sm">{description}</p>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>

                  <TableCell className="hidden w-[140px] md:table-cell">
                    {format(new Date(transfer.executionDate), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              )
            })}
            {/* Empty rows */}
            {[...Array(ITEMS_PER_PAGE - paginatedTransfers.length)].map(
              (_, i) => (
                <TableRow key={`empty-${i}`} className="h-[50px]">
                  {isAdmin && <TableCell className="w-[60px]" />}
                  <TableCell className="w-[180px]" />
                  <TableCell className="w-[200px]" />
                  <TableCell className="w-[180px]" />
                  <TableCell className="w-[140px]" />
                  <TableCell className="hidden w-[200px] md:table-cell" />
                  <TableCell className="hidden w-[140px] md:table-cell" />
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {paginatedTransfers.map((transfer) => (
          <TransactionCard
            key={`${transfer.transferId}-${transfer.viewType}`}
            transfer={transfer}
            transferCategories={transferCategories}
            categories={categories}
            ensNames={ensNames}
            isAdmin={isAdmin}
            onEditCategory={handleEditCategory}
          />
        ))}
      </div>

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
