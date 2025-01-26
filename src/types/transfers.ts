export interface Transfer {
  transferId: string
  transactionHash: string
  to: string
  from: string
  value: string
  executionDate: string
  tokenInfo?: {
    symbol: string
    decimals: number
    trusted: boolean
  }
  safe: string
}

export interface TokenInfo {
  type: string
  address: string
  name: string
  symbol: string
  decimals: number
  logoUri: string
  trusted: boolean
}


export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface TransferResponse {
  results: Transfer[]
  pagination: PaginationInfo
}

export interface TransactionTableProps {
  transfers: Transfer[]
  safeAddress: string | null // Make it nullable for all safes view
  pagination: PaginationInfo | null
  onPageChange: (page: number) => void
  isLoading: boolean
}

export interface Safe {
  address: string
  removed: boolean
  removed_at: string | null
}
