import { getTrades } from '@/actions/tradeActions';
import { TradeTable } from '@/components/TradeTable';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TradesPage() {
  const result = await getTrades();

  const trades = result.success && result.data ? result.data : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trade Log</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {trades.length} trade{trades.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Trade
        </Link>
      </div>

      <TradeTable trades={trades} />
    </div>
  );
}
