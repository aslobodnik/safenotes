import type { SafeItem } from '@/db/schema'

interface SafeListItemProps {
  safe: SafeItem
  onDelete: (address: string) => void
}

export function SafeListItem({ safe, onDelete }: SafeListItemProps) {
  return (
    <div className="flex items-center justify-between rounded border p-2">
      <span className="font-mono">{safe.address}</span>
      <div className="flex items-center gap-2">
        {safe.removed && (
          <span className="text-sm text-gray-500">
            Removed: {safe.removedAt?.toLocaleDateString()}
          </span>
        )}
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => onDelete(safe.address)}
        >
          ×
        </button>
      </div>
    </div>
  )
}
