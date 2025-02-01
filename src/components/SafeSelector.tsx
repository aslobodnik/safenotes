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
  onChange: (value: string | null) => void
}

export default function SafeSelector({
  safeAddress,
  onChange,
}: SafeSelectorProps) {
  const { data: safes, isLoading } = api.safes.getAllSafesWithEns.useQuery()

  const handleChange = (value: string) => {
    // Convert "all" back to null when selected
    onChange(value === 'all' ? null : value)
  }

  return (
    <Select
      value={safeAddress === null ? 'all' : safeAddress}
      onValueChange={handleChange}
    >
      <SelectTrigger className="min-w-[300px] bg-neutral-50 py-5 text-lg font-bold">
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
