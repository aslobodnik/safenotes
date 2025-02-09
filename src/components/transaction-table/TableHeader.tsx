import { TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TransactionTableHeaderProps {
  showEditColumn: boolean
}

export function TransactionTableHeader({
  showEditColumn,
}: TransactionTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="h-[50px]">
        {showEditColumn && <TableHead className="w-[60px]">Edit</TableHead>}
        <TableHead className="w-[180px]">Safe</TableHead>
        <TableHead className="w-[200px]">Amount</TableHead>
        <TableHead className="w-[180px]">To / From</TableHead>
        <TableHead className="w-[140px]">Category</TableHead>
        <TableHead className="hidden w-[200px] md:table-cell">
          Description
        </TableHead>
        <TableHead className="hidden w-[140px] md:table-cell">Date</TableHead>
      </TableRow>
    </TableHeader>
  )
}
