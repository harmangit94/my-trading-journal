'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { formatDate, formatCurrency } from '@/lib/utils';

interface EquityCurvePoint {
  date: string;
  cumulativePL: number;
  netPL: number;
  ticker: string;
}

interface EquityCurveProps {
  trades: EquityCurvePoint[];
}

interface TooltipPayload {
  payload?: EquityCurvePoint;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (active && payload && payload.length && payload[0].payload) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
        <p className="text-muted-foreground mb-1">
          {formatDate(data.date)} · {data.ticker}
        </p>
        <p className="font-semibold">
          Trade:{' '}
          <span
            className={data.netPL >= 0 ? 'text-green-400' : 'text-red-400'}
          >
            {data.netPL >= 0 ? '+' : ''}
            {formatCurrency(data.netPL)}
          </span>
        </p>
        <p className="font-semibold">
          Total:{' '}
          <span
            className={
              data.cumulativePL >= 0 ? 'text-green-400' : 'text-red-400'
            }
          >
            {data.cumulativePL >= 0 ? '+' : ''}
            {formatCurrency(data.cumulativePL)}
          </span>
        </p>
      </div>
    );
  }
  return null;
}

export function EquityCurve({ trades }: EquityCurveProps) {
  const isPositive =
    trades.length > 0 && trades[trades.length - 1]?.cumulativePL >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-sm">Equity Curve</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cumulative net P/L over time
          </p>
        </div>
        {trades.length > 0 && (
          <span
            className={`text-sm font-mono font-semibold ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(trades[trades.length - 1]?.cumulativePL ?? 0)}
          </span>
        )}
      </div>

      {trades.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            No trades to display yet
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={trades}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 30%, 18%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => {
                try {
                  return formatDate(val).split(' ').slice(0, 2).join(' ');
                } catch {
                  return val;
                }
              }}
              tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(val) => `$${val}`}
              tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="hsl(222, 30%, 25%)" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="cumulativePL"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
              dot={{ fill: isPositive ? '#22c55e' : '#ef4444', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
