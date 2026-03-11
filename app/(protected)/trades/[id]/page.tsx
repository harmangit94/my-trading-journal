import { getTrade } from '@/actions/tradeActions';
import { TradeForm } from '@/components/TradeForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TradePage({ params }: Props) {
  const { id } = await params;
  const result = await getTrade(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const trade = result.data;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/trades"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to trades
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{trade.ticker}</h1>
          <span
            className={`px-2.5 py-0.5 rounded text-sm font-medium ${
              trade.direction === 'Long'
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-orange-500/15 text-orange-400'
            }`}
          >
            {trade.direction}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded text-sm font-medium ${
              trade.follow_rule === 'Yes'
                ? 'bg-green-500/15 text-green-400'
                : trade.follow_rule === 'No'
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {trade.follow_rule}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {formatDate(trade.trade_date)}
          {trade.setup_pattern ? ` · ${trade.setup_pattern}` : ''}
        </p>
      </div>

      <TradeForm mode="edit" trade={trade} tradeId={id} />
    </div>
  );
}
