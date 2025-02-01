import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/utils/trpc'

interface SafeSelectorProps {
  safeAddress: string | null
  onChange: (value: string) => void
}

export default function SafeSelector({
  safeAddress,
  onChange,
}: SafeSelectorProps) {
  const { data: safes, isLoading } = api.safes.getAllSafesWithEns.useQuery()

  return (
    <Select
      value={safeAddress === null ? 'all' : safeAddress}
      onValueChange={onChange}
    >
      <SelectTrigger className="min-w-[300px] bg-white text-lg font-bold">
        <SelectValue placeholder="All Safes" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Safes</SelectItem>
        {isLoading && (
          <SelectItem value="loading" disabled>
            Loading safes...
          </SelectItem>
        )}
        {safes?.map((safe) => (
          <SelectItem key={safe.address} value={safe.address}>
            {safe.name
              ? safe.name
              : `${safe.address.slice(0, 6)}...${safe.address.slice(-4)}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
