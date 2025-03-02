import { ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { type Safe } from '@/db/schema';
import { truncateAddress } from '@/lib/utils';

interface WalletCardProps {
  safe: Safe;
  ensName?: string;
  orgSlug: string;
  onClick?: () => void;
}

export default function WalletCard({ safe, ensName, orgSlug, onClick }: WalletCardProps) {
  const etherscanUrl = `https://etherscan.io/address/${safe.address}`;

  return (
    <div 
      onClick={onClick}
      className="group flex flex-col gap-4 rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-neutral-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold">
            {ensName || truncateAddress(safe.address)}
          </h3>
          <Link 
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1">
              <span>{truncateAddress(safe.address)}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </Link>
        </div>
      </div>

      {/* Action Card */}
      <div className="mt-auto">
        <Link
          href={`/${orgSlug}/${safe.address}`}
          className="flex items-center justify-between rounded-md border bg-muted/50 p-4 transition-colors hover:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm font-medium">View Transactions</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
