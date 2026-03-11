import { z } from 'zod';

export const tradeSchema = z.object({
  trade_date: z.string().min(1, 'Trade date is required'),
  ticker: z.string().min(1, 'Ticker is required').toUpperCase(),
  direction: z.enum(['Long', 'Short'], {
    required_error: 'Direction is required',
  }),
  follow_rule: z.enum(['Yes', 'No', 'Partially'], {
    required_error: 'Follow rule is required',
  }),
  entry_price: z.coerce.number().positive('Entry price must be positive'),

  entry_time: z.string().optional().or(z.literal('')),
  exit_time: z.string().optional().or(z.literal('')),
  duration_minutes: z.coerce.number().int().min(0).optional().or(z.literal('')),
  exit_price: z.coerce.number().positive().optional().or(z.literal('')),
  position_size: z.coerce.number().positive().optional().or(z.literal('')),
  gross_pl: z.coerce.number().optional().or(z.literal('')),
  net_pl: z.coerce.number().optional().or(z.literal('')),
  risk_amount: z.coerce.number().optional().or(z.literal('')),
  risk_percent: z.coerce.number().optional().or(z.literal('')),
  realized_rr: z.coerce.number().optional().or(z.literal('')),
  initial_stop_price: z.coerce.number().positive().optional().or(z.literal('')),
  planned_target_price: z.coerce.number().positive().optional().or(z.literal('')),
  commissions_fees: z.coerce.number().min(0).optional().default(0),

  setup_pattern: z.string().optional().or(z.literal('')),
  timeframe: z.string().optional().or(z.literal('')),
  market_session: z
    .enum(['Pre-market', 'Open', 'Mid-day', 'Close', 'After-hours'])
    .optional(),
  market_bias: z.enum(['Bullish', 'Bearish', 'Range']).optional(),

  key_levels_context: z.string().optional().or(z.literal('')),
  trigger_description: z.string().optional().or(z.literal('')),
  management_actions: z.string().optional().or(z.literal('')),
  exit_reason: z
    .enum(['Target', 'Stop', 'Time-based', 'Discretionary'])
    .optional(),
  deviation_from_plan: z.boolean().optional().default(false),

  confidence_pre_entry: z.coerce
    .number()
    .min(1)
    .max(10)
    .optional()
    .or(z.literal('')),
  emotional_state: z.string().optional().or(z.literal('')),
  physical_mental_state: z.string().optional().or(z.literal('')),
  pre_trade_checklist: z.boolean().optional().default(false),
  post_trade_reflection: z.string().optional().or(z.literal('')),
  chart_screenshot_url: z.string().url().optional().or(z.literal('')),
});

export type TradeFormValues = z.infer<typeof tradeSchema>;
