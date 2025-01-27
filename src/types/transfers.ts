export interface TokenInfo {
  type: string
  address: string
  name: string
  symbol: string
  decimals: number
  logoUri: string
  trusted: boolean
}

export interface Transfer {
  type: 'ETHER_TRANSFER' | 'ERC20_TRANSFER'
  executionDate: string
  blockNumber: number
  transactionHash: string
  to: string
  from: string
  value: string
  tokenId: string | null
  tokenAddress: string | null
  transferId: string
  tokenInfo: TokenInfo | null
  safe: string // Adding safe address to track which safe it belongs to
  category?: string
  description?: string
  categoryId?: string
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
  categories: { id: string; name: string }[]
}

export interface Safe {
  address: string
  removed: boolean
  removed_at: string | null
}
