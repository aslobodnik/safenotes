import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const ITEMS_PER_PAGE = 10

export function TableSkeleton({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="h-[50px]">
            {isAdmin && <TableHead className="w-[60px]">Edit</TableHead>}
            <TableHead className="w-[180px]">Safe</TableHead>
            <TableHead className="w-[200px] min-w-[200px]">Amount</TableHead>
            <TableHead className="w-[180px]">Address</TableHead>
            <TableHead className="w-[140px]">Category</TableHead>
            <TableHead className="hidden w-[200px] md:table-cell">
              Description
            </TableHead>
            <TableHead className="hidden w-[140px] md:table-cell">
              Date
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <TableRow key={i} className="h-[50px]">
              {isAdmin && (
                <TableCell className="w-[60px]">
                  <div className="h-8 w-8 animate-pulse rounded bg-neutral-200" />
                </TableCell>
              )}
              <TableCell className="w-[180px]">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
              </TableCell>
              <TableCell className="w-[200px] min-w-[200px]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded bg-neutral-200" />
                  <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
                </div>
              </TableCell>
              <TableCell className="w-[180px]">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
              </TableCell>
              <TableCell className="w-[140px]">
                <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
              </TableCell>
              <TableCell className="hidden w-[200px] md:table-cell">
                <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
              </TableCell>
              <TableCell className="hidden w-[140px] md:table-cell">
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
