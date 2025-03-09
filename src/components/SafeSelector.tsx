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
  organizationId?: string // Optional organization ID parameter
}

export default function SafeSelector({
  safeAddress,
  onChange,
  organizationId,
}: SafeSelectorProps) {
  // Fetch all safes with ENS (used when no organizationId is provided)
  const { data: allSafesWithEns, isLoading: allSafesLoading } = api.safes.getAllSafesWithEns.useQuery(
    undefined,
    { enabled: !organizationId }
  )
  
  // Fetch safes for a specific organization
  const { data: orgSafes, isLoading: orgSafesLoading } = api.safes.getByOrganization.useQuery(
    { organizationId: organizationId || '' },
    { enabled: !!organizationId }
  )
  
  // Fetch ENS names for organization safes if needed
  const { data: orgSafesWithEns, isLoading: orgEnsLoading } = api.safes.getAllSafesWithEns.useQuery(
    undefined,
    { 
      enabled: !!organizationId && !!orgSafes,
      select: (allSafes) => {
        // Filter to only include safes from our organization
        return allSafes.filter(safe => 
          orgSafes?.some(orgSafe => orgSafe.address === safe.address)
        )
      }
    }
  )
  
  // Determine which data and loading state to use
  const safes = organizationId ? orgSafesWithEns : allSafesWithEns
  const isLoading = organizationId 
    ? (orgSafesLoading || orgEnsLoading) 
    : allSafesLoading

  const handleChange = (value: string) => {
    // Convert "all" back to null when selected
    onChange(value === 'all' ? null : value)
  }

  return (
    <Select
      value={safeAddress === null ? 'all' : safeAddress}
      onValueChange={handleChange}
    >
      <SelectTrigger className="min-w-[300px] max-w-[367px] bg-neutral-50 py-5 text-lg font-bold">
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
        {safes?.length === 0 && (
          <SelectItem value="empty" disabled>
            No safes found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
