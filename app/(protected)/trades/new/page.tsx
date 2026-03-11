import { TradeForm } from '@/components/TradeForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewTradePage() {
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
        <h1 className="text-2xl font-bold">Log New Trade</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Record every detail while it&apos;s fresh
        </p>
      </div>

      <TradeForm mode="create" />
    </div>
  );
}
