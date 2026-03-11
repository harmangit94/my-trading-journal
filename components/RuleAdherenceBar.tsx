'use client';

import { ShieldCheck } from 'lucide-react';

interface AdherenceData {
  yes: number;
  no: number;
  partially: number;
  pct: number;
}

interface RuleAdherenceBarProps {
  adherence: AdherenceData;
}

export function RuleAdherenceBar({ adherence }: RuleAdherenceBarProps) {
  const total = adherence.yes + adherence.no + adherence.partially;

  const yesPct = total > 0 ? (adherence.yes / total) * 100 : 0;
  const partialPct = total > 0 ? (adherence.partially / total) * 100 : 0;
  const noPct = total > 0 ? (adherence.no / total) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <div>
          <h2 className="font-semibold text-sm">Rule Adherence</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Follow rule breakdown
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">No data yet</p>
        </div>
      ) : (
        <>
          {/* Score */}
          <div className="text-center mb-5">
            <span
              className={`text-4xl font-bold font-mono ${
                adherence.pct >= 70
                  ? 'text-green-400'
                  : adherence.pct >= 50
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}
            >
              {adherence.pct}%
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              adherence score
            </p>
          </div>

          {/* Stacked bar */}
          <div className="flex rounded-full overflow-hidden h-3 mb-4 bg-muted">
            {yesPct > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${yesPct}%` }}
              />
            )}
            {partialPct > 0 && (
              <div
                className="bg-amber-500 transition-all"
                style={{ width: `${partialPct}%` }}
              />
            )}
            {noPct > 0 && (
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${noPct}%` }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Yes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{adherence.yes}</span>
                <span className="text-muted-foreground text-xs w-10 text-right">
                  {yesPct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Partially</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{adherence.partially}</span>
                <span className="text-muted-foreground text-xs w-10 text-right">
                  {partialPct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-muted-foreground">No</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{adherence.no}</span>
                <span className="text-muted-foreground text-xs w-10 text-right">
                  {noPct.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
