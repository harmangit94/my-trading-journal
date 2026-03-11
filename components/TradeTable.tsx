'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Trash2,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatCurrency } from '@/lib/utils';
import { deleteTrade } from '@/actions/tradeActions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Trade, TradeFilters } from '@/types';

type SortKey = keyof Trade | '';
type SortDir = 'asc' | 'desc';

interface TradeTableProps {
  trades: Trade[];
}

function SortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: string;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (sortKey !== column)
    return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
  return sortDir === 'asc' ? (
    <ChevronUp className="h-3.5 w-3.5 ml-1 text-primary" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5 ml-1 text-primary" />
  );
}

export function TradeTable({ trades }: TradeTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>('trade_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState<TradeFilters>({
    search: '',
    direction: 'All',
    followRule: 'All',
    dateFrom: '',
    dateTo: '',
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (
        filters.search &&
        !t.ticker.toLowerCase().includes(filters.search.toLowerCase()) &&
        !(t.setup_pattern ?? '')
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.direction !== 'All' && t.direction !== filters.direction)
        return false;
      if (filters.followRule !== 'All' && t.follow_rule !== filters.followRule)
        return false;
      if (filters.dateFrom && t.trade_date < filters.dateFrom) return false;
      if (filters.dateTo && t.trade_date > filters.dateTo) return false;
      return true;
    });
  }, [trades, filters]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof Trade];
      const bVal = b[sortKey as keyof Trade];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDir === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filtered, sortKey, sortDir]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTrade(deleteId);
      toast.success('Trade deleted');
    } catch {
      toast.error('Failed to delete trade');
      setDeleting(false);
      setDeleteId(null);
    }
    router.refresh();
  };

  const ThButton = ({
    column,
    label,
    className,
  }: {
    column: SortKey;
    label: string;
    className?: string;
  }) => (
    <th
      className={`text-left text-muted-foreground font-medium px-4 py-3 cursor-pointer select-none hover:text-foreground transition-colors ${className ?? ''}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon column={column} sortKey={sortKey} sortDir={sortDir} />
      </div>
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ticker or setup..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              className="w-full bg-input border border-border rounded-md pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>

          <select
            value={filters.direction}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                direction: e.target.value as TradeFilters['direction'],
              }))
            }
            className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="All">All Directions</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>

          <select
            value={filters.followRule}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                followRule: e.target.value as TradeFilters['followRule'],
              }))
            }
            className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="All">All Rules</option>
            <option value="Yes">Yes</option>
            <option value="Partially">Partially</option>
            <option value="No">No</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateFrom: e.target.value }))
              }
              className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateTo: e.target.value }))
              }
              className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {(filters.search ||
            filters.direction !== 'All' ||
            filters.followRule !== 'All' ||
            filters.dateFrom ||
            filters.dateTo) && (
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  direction: 'All',
                  followRule: 'All',
                  dateFrom: '',
                  dateTo: '',
                })
              }
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Showing {sorted.length} of {trades.length} trades
        </p>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {sorted.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground text-sm">
              {trades.length === 0
                ? 'No trades yet. Log your first trade!'
                : 'No trades match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide">
                  <ThButton column="trade_date" label="Date" />
                  <ThButton column="ticker" label="Ticker" />
                  <ThButton column="direction" label="Dir" />
                  <th className="text-left text-muted-foreground font-medium px-4 py-3">
                    Setup
                  </th>
                  <ThButton
                    column="entry_price"
                    label="Entry"
                    className="text-right"
                  />
                  <ThButton
                    column="exit_price"
                    label="Exit"
                    className="text-right"
                  />
                  <ThButton
                    column="net_pl"
                    label="Net P/L"
                    className="text-right"
                  />
                  <ThButton
                    column="realized_rr"
                    label="R:R"
                    className="text-right"
                  />
                  <ThButton column="follow_rule" label="Rule" />
                  <th className="text-left text-muted-foreground font-medium px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-border/50 hover:bg-accent/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(trade.trade_date)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/trades/${trade.id}`}
                        className="font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {trade.ticker}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          trade.direction === 'Long'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-orange-500/15 text-orange-400'
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">
                      {trade.setup_pattern ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {trade.entry_price != null
                        ? `$${trade.entry_price.toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">
                      {trade.exit_price != null
                        ? `$${trade.exit_price.toFixed(2)}`
                        : '—'}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-semibold ${
                        trade.net_pl === null
                          ? 'text-muted-foreground'
                          : (trade.net_pl ?? 0) >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                      }`}
                    >
                      {trade.net_pl !== null
                        ? `${(trade.net_pl ?? 0) >= 0 ? '+' : ''}${formatCurrency(trade.net_pl ?? 0)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">
                      {trade.realized_rr != null
                        ? `${trade.realized_rr.toFixed(2)}R`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/trades/${trade.id}`}
                          className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                          title="View/Edit"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(trade.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trade</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trade? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
