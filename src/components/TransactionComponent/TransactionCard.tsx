import { format } from 'date-fns';
import { ExternalLink, Pencil } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { truncateAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { type TransferItem, type TransferCategoryItem, type CategoryItem } from '@/db/schema';
import { type AddressMap } from '@/utils/fetch-ens-names'


interface TransactionCardProps {
  transfer: TransferItem & { viewType: 'in' | 'out' };
  transferCategories: TransferCategoryItem[];
  categories: CategoryItem[];
  ensNames: AddressMap;
  isAdmin?: boolean;
  onEditCategory?: (transferId: string) => void;
}

export function TransactionCard({
  transfer,
  transferCategories,
  categories,
  ensNames,
  isAdmin,
  onEditCategory,
}: TransactionCardProps) {
  const isOutgoing = transfer.viewType === 'out';
  
  const getCategoryName = (transferId: string): string => {
    const currentMapping = transferCategories.find(
      (tc) => tc.transferId === transferId
    );
    if (!currentMapping) return 'None';

    const category = categories.find((c) => c.id === currentMapping.categoryId);
    return category?.name || 'None';
  };

  const getCategoryDescription = (transferId: string): string => {
    const currentMapping = transferCategories.find(
      (tc) => tc.transferId === transferId
    );
    return currentMapping?.description || '-';
  };

  const formattedAmount = transfer.tokenSymbol === 'ETH' || transfer.tokenSymbol === 'WETH' || !transfer.tokenSymbol
    ? `${(Number(transfer.value) / Math.pow(10, 18)).toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} ${transfer.tokenSymbol || 'ETH'}`
    : `${(Number(transfer.value) / Math.pow(10, transfer.tokenDecimals || 18)).toLocaleString(
        undefined,
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }
      )} ${transfer.tokenSymbol}`;

  return (
    <div className="border-b p-4">
      <div className="space-y-3">
        {/* Header with amount and direction */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={isOutgoing ? '/img/out-arrow.svg' : '/img/in-arrow.svg'}
              alt={isOutgoing ? 'Outgoing' : 'Incoming'}
              width={24}
              height={24}
            />
            <span className="font-medium">{formattedAmount}</span>
          </div>
          <Link
            href={`https://etherscan.io/tx/${transfer.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* From Address */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground font-bold">From</div>
          <Link
            href={`https://etherscan.io/address/${transfer.fromAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-primary"
          >
            {ensNames[transfer.fromAddress] || truncateAddress(transfer.fromAddress)}
          </Link>
        </div>

        {/* To Address */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground font-bold">To</div>
          <Link
            href={`https://etherscan.io/address/${transfer.toAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-primary"
          >
            {ensNames[transfer.toAddress] || truncateAddress(transfer.toAddress)}
          </Link>
        </div>

        {/* Category and Description */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground font-bold">Category</div>
          <span className="text-sm font-medium">
            {getCategoryName(transfer.transferId)}
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-sm text-muted-foreground font-bold">Description</div>
          <HoverCard openDelay={200}>
            <HoverCardTrigger className="block">
              <div className="text-sm truncate">
                {getCategoryDescription(transfer.transferId)}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm font-medium">{getCategoryDescription(transfer.transferId)}</p>
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Date */}
        <div className="text-sm text-muted-foreground">
          {format(new Date(transfer.executionDate), 'MMM d, yyyy')}
        </div>

        {/* Edit Button */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t">
            <Button
              variant="secondary"
              className="w-full bg-muted/50 hover:bg-muted"
              onClick={() => onEditCategory?.(transfer.transferId)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Category & Description
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
