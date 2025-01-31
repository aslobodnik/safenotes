import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/utils/trpc'

interface SyncStatus {
  [key: string]: {
    status: 'pending' | 'syncing' | 'completed' | 'error'
    message?: string
    progress?: {
      current: number
      total: number
      skipped: number
    }
  }
}

const TRANSFER_LIMITS = [10, 50, 100, 200] as const
type TransferLimit = (typeof TRANSFER_LIMITS)[number]

export function SyncTransactionsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({})
  const [transferLimit, setTransferLimit] = useState<TransferLimit>(50)
  const { data: safes } = api.safes.getAllSafesWithEns.useQuery()
  const utils = api.useUtils()

  const { mutate: writeTransfer } = api.transfers.writeTransfer.useMutation()

  const handleSync = async () => {
    if (!safes) return

    // Initialize all safes as pending
    const initialStatus: SyncStatus = {}
    safes.forEach((safe) => {
      initialStatus[safe.address] = {
        status: 'pending',
        progress: { current: 0, total: 0, skipped: 0 },
      }
    })
    setSyncStatus(initialStatus)

    // Sync each safe sequentially
    for (const safe of safes) {
      setSyncStatus((prev) => ({
        ...prev,
        [safe.address]: {
          status: 'syncing',
          progress: { current: 0, total: 0, skipped: 0 },
        },
      }))

      try {
        // Get existing transfers for this safe
        const existingTransfers =
          await utils.client.transfers.getAllTransfersByWallet.query({
            safeAddress: safe.address,
          })
        const existingTransferIds = new Set(
          existingTransfers.map((t) => t.transferId)
        )

        // Fetch new transfers with selected limit
        const newTransfers =
          await utils.client.transfers.getTransfersPerWallet.query({
            safeAddress: safe.address,
            limit: transferLimit,
          })

        // Update total in progress
        setSyncStatus((prev) => ({
          ...prev,
          [safe.address]: {
            ...prev[safe.address],
            progress: {
              current: 0,
              total: newTransfers.length,
              skipped: 0,
            },
          },
        }))

        // Process transfers one by one
        for (let i = 0; i < newTransfers.length; i++) {
          const transfer = newTransfers[i]

          if (existingTransferIds.has(transfer.transferId)) {
            // Skip existing transfer
            setSyncStatus((prev) => ({
              ...prev,
              [safe.address]: {
                ...prev[safe.address],
                progress: {
                  ...prev[safe.address].progress!,
                  current: i + 1,
                  skipped: prev[safe.address].progress!.skipped + 1,
                },
              },
            }))
            continue
          }

          // Write new transfer
          try {
            await writeTransfer({
              transfer: {
                transferId: transfer.transferId,
                safeAddress: safe.address,
                type: transfer.type,
                executionDate: transfer.executionDate,
                blockNumber: transfer.blockNumber,
                transactionHash: transfer.transactionHash,
                from: transfer.from,
                to: transfer.to,
                value: transfer.value,
                tokenAddress: transfer.tokenAddress,
                tokenInfo: transfer.tokenInfo
                  ? {
                      name: transfer.tokenInfo.name,
                      symbol: transfer.tokenInfo.symbol,
                      decimals: transfer.tokenInfo.decimals,
                      logoUri: transfer.tokenInfo.logoUri,
                      trusted: transfer.tokenInfo.trusted,
                    }
                  : null,
              },
            })

            // Update progress
            setSyncStatus((prev) => ({
              ...prev,
              [safe.address]: {
                ...prev[safe.address],
                progress: {
                  ...prev[safe.address].progress!,
                  current: i + 1,
                },
              },
            }))
          } catch (error) {
            // Set error status and halt the sync
            setSyncStatus((prev) => ({
              ...prev,
              [safe.address]: {
                status: 'error',
                message:
                  error instanceof Error ? error.message : 'Unknown error',
                progress: prev[safe.address].progress,
              },
            }))
            // Exit the entire sync process
            return
          }

          // Add small delay to prevent rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Mark as completed only if we get through all transfers
        setSyncStatus((prev) => ({
          ...prev,
          [safe.address]: {
            status: 'completed',
            progress: prev[safe.address].progress,
          },
        }))
      } catch (error) {
        setSyncStatus((prev) => ({
          ...prev,
          [safe.address]: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            progress: prev[safe.address].progress,
          },
        }))
        // Exit the sync process on any other errors
        return
      }
    }
  }

  const getStatusIcon = (status: SyncStatus[string]['status']) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'syncing':
        return '🔄'
      case 'completed':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Sync Transactions</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2">
          <div className="mb-4 flex items-center justify-between">
            <Select
              value={transferLimit.toString()}
              onValueChange={(value) =>
                setTransferLimit(Number(value) as TransferLimit)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Transactions per wallet" />
              </SelectTrigger>
              <SelectContent>
                {TRANSFER_LIMITS.map((limit) => (
                  <SelectItem key={limit} value={limit.toString()}>
                    {limit} transactions
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {safes?.map((safe) => {
              const status = syncStatus[safe.address]
              const progress = status?.progress

              return (
                <div
                  key={safe.address}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-sm text-gray-600">
                        {formatAddress(safe.address)}
                      </span>
                      {safe.name && (
                        <span className="text-sm text-gray-500">
                          {safe.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {status?.status === 'syncing' ? (
                        <span className="animate-spin">🔄</span>
                      ) : (
                        <span>{getStatusIcon(status?.status)}</span>
                      )}
                      {status?.message && (
                        <span className="text-sm text-red-500">
                          {status.message}
                        </span>
                      )}
                    </div>
                  </div>
                  {progress && (
                    <div className="mt-3 space-y-2">
                      <Progress
                        value={
                          progress.total
                            ? (progress.current / progress.total) * 100
                            : 0
                        }
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {progress.current} / {progress.total} transfers
                        </span>
                        {progress.skipped > 0 && (
                          <span>{progress.skipped} skipped</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="default"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleSync}
            >
              Start Sync ({safes?.length ?? 0} wallets)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
