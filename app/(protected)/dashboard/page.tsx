import { getDashboardStats } from '@/actions/tradeActions';
import { StatsCards } from '@/components/StatsCards';
import { EquityCurve } from '@/components/EquityCurve';
import { RuleAdherenceBar } from '@/components/RuleAdherenceBar';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Trade } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const result = await getDashboardStats();

  if (!result.success || !result.data) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">
          Error loading dashboard. Please refresh.
        </p>
      </div>
    );
  }

  const stats = result.data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your trading performance at a glance
          </p>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Trade
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EquityCurve trades={stats.equityCurveData} />
        </div>
        <div>
          <RuleAdherenceBar adherence={stats.ruleAdherence} />
        </div>
      </div>

      {/* Recent trades */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Trades</h2>
          <Link
            href="/trades"
            className="text-primary text-sm hover:underline"
          >
            View all
          </Link>
        </div>
        {stats.recentTrades.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No trades yet.{' '}
              <Link href="/trades/new" className="text-primary hover:underline">
                Log your first trade
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground font-medium px-5 py-3">
                    Date
                  </th>
                  <th className="text-left text-muted-foreground font-medium px-5 py-3">
                    Ticker
                  </th>
                  <th className="text-left text-muted-foreground font-medium px-5 py-3">
                    Direction
                  </th>
                  <th className="text-left text-muted-foreground font-medium px-5 py-3">
                    Setup
                  </th>
                  <th className="text-right text-muted-foreground font-medium px-5 py-3">
                    Net P/L
                  </th>
                  <th className="text-center text-muted-foreground font-medium px-5 py-3">
                    Follow Rule
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTrades.map((trade: Trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(trade.trade_date)}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/trades/${trade.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {trade.ticker}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          trade.direction === 'Long'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-orange-500/15 text-orange-400'
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {trade.setup_pattern ?? '—'}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-mono font-medium ${
                        (trade.net_pl ?? 0) >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {trade.net_pl !== null
                        ? `${(trade.net_pl ?? 0) >= 0 ? '+' : ''}$${(trade.net_pl ?? 0).toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          trade.follow_rule === 'Yes'
                            ? 'bg-green-500/15 text-green-400'
                            : trade.follow_rule === 'No'
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {trade.follow_rule}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
