import { useQuery } from '@tanstack/react-query'

interface Token {
  name: string
  symbol: string
  decimals: number
  logoUri: string
}

interface Balance {
  tokenAddress: string | null
  token: Token | null
  balance: string
}

export default function SafeBalances({
  safeAddress,
}: {
  safeAddress: string | null
}) {
  const { data: balances, isLoading } = useQuery({
    queryKey: ['safe-balances', safeAddress],
    queryFn: async () => {
      const safeApiUrl = new URL(
        `/api/v1/safes/${safeAddress}/balances/`,
        process.env.NEXT_PUBLIC_SAFES_API_URL
      )
      safeApiUrl.searchParams.set('trusted', 'true')
      safeApiUrl.searchParams.set('exclude_spam', 'true')

      const response = await fetch(safeApiUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch safe balances')
      }

      return (await response.json()) as Balance[]
    },
    enabled: !!safeAddress,
  })

  if (!safeAddress) return null

  return (
    <div className="text-sm">
      <div className="mb-1 font-semibold">Balances:</div>
      <ul className="space-y-2">
        {isLoading ? (
          <>
            <li className="h-6 w-48 animate-pulse rounded bg-gray-200"></li>
            <li className="h-6 w-48 animate-pulse rounded bg-gray-200"></li>
            <li className="h-6 w-48 animate-pulse rounded bg-gray-200"></li>
          </>
        ) : (
          balances?.map((balance) => (
            <li
              key={balance.tokenAddress || 'eth'}
              className="flex items-center gap-2"
            >
              {' '}
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-600">
                  {formatBalance(
                    balance.balance,
                    balance.token?.decimals || 18,
                    balance.token?.symbol || 'ETH'
                  )}{' '}
                  {balance.token?.symbol || 'ETH'}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

function formatBalance(
  balance: string,
  decimals: number,
  symbol: string | null
): string {
  const value = Number(balance) / Math.pow(10, decimals)
  const isEthLike = symbol === 'ETH' || symbol === 'WETH'

  return value.toLocaleString(undefined, {
    minimumFractionDigits: isEthLike ? 1 : 0,
    maximumFractionDigits: isEthLike ? 1 : 0,
  })
}
