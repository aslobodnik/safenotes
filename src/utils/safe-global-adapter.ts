import { getAddress } from 'viem'

export interface SafeTransferResponse {
  count: number
  results: SafeTransfer[]
}

export interface SafeTransfer {
  safeAddress: string
  type: 'ETHER_TRANSFER' | 'ERC20_TRANSFER'
  executionDate: string
  blockNumber: number
  transactionHash: string
  transferId: string
  to: string
  from: string
  tokenId: string | null
  value: string
  tokenAddress: string | null
  tokenInfo: {
    type: string
    address: string
    name: string
    symbol: string
    decimals: number
    logoUri?: string
    trusted: boolean
  } | null
}

export async function fetchSafeTransfers(
  safeAddress: string,
  limit: number = 100
): Promise<SafeTransferResponse> {
  const checksummedSafeAddress = getAddress(safeAddress)
  const apiUrl = `https://safe-transaction-mainnet.safe.global/api/v1/safes/${checksummedSafeAddress}/transfers/?limit=${limit}`
  const response = await fetch(apiUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch transfers for safe ${safeAddress}`)
  }
  const data = await response.json()
  const transfers = data.results.map((transfer: SafeTransfer) => ({
    ...transfer,
    safeAddress,
  }))

  return {
    count: transfers.length,
    results: transfers,
  }
}

export function filterTrustedTransfers(
  transfers: SafeTransfer[]
): SafeTransfer[] {
  return transfers.filter((transfer) => {
    if (!transfer.tokenInfo) return true
    return transfer.tokenInfo.trusted === true
  })
}
