'use client';

import {
  Hash,
  Target,
  TrendingUp,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Trades',
      value: stats.totalTrades.toString(),
      icon: Hash,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      valueColor: 'text-foreground',
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      icon: Target,
      iconColor: stats.winRate >= 50 ? 'text-green-400' : 'text-red-400',
      iconBg: stats.winRate >= 50 ? 'bg-green-500/10' : 'bg-red-500/10',
      valueColor: stats.winRate >= 50 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Avg R:R',
      value: stats.avgRR === 0 ? '—' : `${stats.avgRR.toFixed(2)}R`,
      icon: TrendingUp,
      iconColor:
        stats.avgRR >= 1 ? 'text-green-400' : 'text-muted-foreground',
      iconBg: stats.avgRR >= 1 ? 'bg-green-500/10' : 'bg-muted/50',
      valueColor:
        stats.avgRR >= 1 ? 'text-green-400' : 'text-muted-foreground',
    },
    {
      label: 'Total Net P/L',
      value:
        stats.totalTrades === 0 ? '—' : formatCurrency(stats.totalNetPL),
      icon: DollarSign,
      iconColor:
        stats.totalNetPL >= 0 ? 'text-green-400' : 'text-red-400',
      iconBg:
        stats.totalNetPL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      valueColor:
        stats.totalNetPL >= 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Rule Adherence',
      value:
        stats.totalTrades === 0
          ? '—'
          : `${stats.ruleAdherencePct}%`,
      icon: ShieldCheck,
      iconColor:
        stats.ruleAdherencePct >= 70
          ? 'text-green-400'
          : stats.ruleAdherencePct >= 50
            ? 'text-amber-400'
            : 'text-red-400',
      iconBg:
        stats.ruleAdherencePct >= 70
          ? 'bg-green-500/10'
          : stats.ruleAdherencePct >= 50
            ? 'bg-amber-500/10'
            : 'bg-red-500/10',
      valueColor:
        stats.ruleAdherencePct >= 70
          ? 'text-green-400'
          : stats.ruleAdherencePct >= 50
            ? 'text-amber-400'
            : 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">
                {card.label}
              </span>
              <div className={`${card.iconBg} p-1.5 rounded-lg`}>
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.valueColor} font-mono`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
