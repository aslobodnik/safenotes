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
    <div className="mb-4">
      <select
        value={safeAddress || ''}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[300px] rounded-md border p-2 text-black"
      >
        <option value="">Select a Safe</option>
        {isLoading && (
          <option value="" disabled>
            Loading safes...
          </option>
        )}
        {safes?.map((safe) => (
          <option key={safe.address} value={safe.address}>
            {safe.name
              ? safe.name
              : `${safe.address.slice(0, 6)}...${safe.address.slice(-4)}`}
          </option>
        ))}
      </select>
    </div>
  )
}
