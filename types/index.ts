export type TradeDirection = 'Long' | 'Short';
export type MarketSession = 'Pre-market' | 'Open' | 'Mid-day' | 'Close' | 'After-hours';
export type MarketBias = 'Bullish' | 'Bearish' | 'Range';
export type ExitReason = 'Target' | 'Stop' | 'Time-based' | 'Discretionary';
export type FollowRule = 'Yes' | 'No' | 'Partially';

export interface Trade {
  id: string;
  user_id: string;
  trade_date: string;
  entry_time: string | null;
  exit_time: string | null;
  duration_minutes: number | null;
  ticker: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number | null;
  position_size: number | null;
  gross_pl: number | null;
  net_pl: number | null;
  risk_amount: number | null;
  risk_percent: number | null;
  realized_rr: number | null;
  initial_stop_price: number | null;
  planned_target_price: number | null;
  commissions_fees: number;
  setup_pattern: string | null;
  timeframe: string | null;
  market_session: MarketSession | null;
  market_bias: MarketBias | null;
  key_levels_context: string | null;
  trigger_description: string | null;
  management_actions: string | null;
  exit_reason: ExitReason | null;
  deviation_from_plan: boolean;
  follow_rule: FollowRule;
  confidence_pre_entry: number | null;
  emotional_state: string | null;
  physical_mental_state: string | null;
  pre_trade_checklist: boolean;
  post_trade_reflection: string | null;
  chart_screenshot_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalTrades: number;
  winRate: number;
  avgRR: number;
  totalNetPL: number;
  ruleAdherencePct: number;
  ruleAdherence: {
    yes: number;
    no: number;
    partially: number;
    pct: number;
  };
  equityCurveData: Array<{
    date: string;
    cumulativePL: number;
    netPL: number;
    ticker: string;
  }>;
  recentTrades: Trade[];
}

export interface TradeFilters {
  search: string;
  direction: TradeDirection | 'All';
  followRule: FollowRule | 'All';
  dateFrom: string;
  dateTo: string;
}

export interface ServerActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}
