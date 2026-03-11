import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import type { Trade } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  try {
    return format(parseISO(date), 'dd MMM yyyy');
  } catch {
    return date;
  }
}

export function formatDateTime(date: string): string {
  try {
    return format(parseISO(date), 'dd MMM yyyy HH:mm');
  } catch {
    return date;
  }
}

export function calcWinRate(trades: Trade[]): number {
  const closedTrades = trades.filter((t) => t.net_pl !== null);
  if (closedTrades.length === 0) return 0;
  const winners = closedTrades.filter((t) => (t.net_pl ?? 0) > 0);
  return (winners.length / closedTrades.length) * 100;
}

export function calcAvgRR(trades: Trade[]): number {
  const tradesWithRR = trades.filter(
    (t) => t.realized_rr !== null && t.realized_rr !== undefined
  );
  if (tradesWithRR.length === 0) return 0;
  const sum = tradesWithRR.reduce((acc, t) => acc + (t.realized_rr ?? 0), 0);
  return sum / tradesWithRR.length;
}

export function calcTotalNetPL(trades: Trade[]): number {
  return trades.reduce((acc, t) => acc + (t.net_pl ?? 0), 0);
}

export function calcRuleAdherence(trades: Trade[]): {
  yes: number;
  no: number;
  partially: number;
  pct: number;
} {
  if (trades.length === 0) {
    return { yes: 0, no: 0, partially: 0, pct: 0 };
  }
  const yes = trades.filter((t) => t.follow_rule === 'Yes').length;
  const no = trades.filter((t) => t.follow_rule === 'No').length;
  const partially = trades.filter((t) => t.follow_rule === 'Partially').length;
  const pct = Math.round(((yes + partially * 0.5) / trades.length) * 100);
  return { yes, no, partially, pct };
}

export function buildEquityCurve(
  trades: Trade[]
): Array<{ date: string; cumulativePL: number; netPL: number; ticker: string }> {
  const sorted = [...trades].sort(
    (a, b) =>
      new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  let cumulative = 0;
  return sorted.map((trade) => {
    const netPL = trade.net_pl ?? 0;
    cumulative += netPL;
    return {
      date: trade.trade_date,
      cumulativePL: Math.round(cumulative * 100) / 100,
      netPL: Math.round(netPL * 100) / 100,
      ticker: trade.ticker,
    };
  });
}
