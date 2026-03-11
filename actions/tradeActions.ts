'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { TradeFormValues } from '@/schemas/trade';
import type { Trade, DashboardStats, ServerActionResult } from '@/types';
import {
  calcWinRate,
  calcAvgRR,
  calcTotalNetPL,
  calcRuleAdherence,
  buildEquityCurve,
} from '@/lib/utils';

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return { supabase, user };
}

function sanitizeFormValues(data: TradeFormValues) {
  const nullIfEmpty = (val: unknown) => {
    if (val === '' || val === undefined || val === null) return null;
    return val;
  };

  return {
    trade_date: data.trade_date,
    ticker: data.ticker.toUpperCase(),
    direction: data.direction,
    follow_rule: data.follow_rule,
    entry_price: data.entry_price,
    entry_time: nullIfEmpty(data.entry_time),
    exit_time: nullIfEmpty(data.exit_time),
    duration_minutes: nullIfEmpty(data.duration_minutes),
    exit_price: nullIfEmpty(data.exit_price),
    position_size: nullIfEmpty(data.position_size),
    gross_pl: nullIfEmpty(data.gross_pl),
    net_pl: nullIfEmpty(data.net_pl),
    risk_amount: nullIfEmpty(data.risk_amount),
    risk_percent: nullIfEmpty(data.risk_percent),
    realized_rr: nullIfEmpty(data.realized_rr),
    initial_stop_price: nullIfEmpty(data.initial_stop_price),
    planned_target_price: nullIfEmpty(data.planned_target_price),
    commissions_fees: data.commissions_fees ?? 0,
    setup_pattern: nullIfEmpty(data.setup_pattern),
    timeframe: nullIfEmpty(data.timeframe),
    market_session: nullIfEmpty(data.market_session),
    market_bias: nullIfEmpty(data.market_bias),
    key_levels_context: nullIfEmpty(data.key_levels_context),
    trigger_description: nullIfEmpty(data.trigger_description),
    management_actions: nullIfEmpty(data.management_actions),
    exit_reason: nullIfEmpty(data.exit_reason),
    deviation_from_plan: data.deviation_from_plan ?? false,
    confidence_pre_entry: nullIfEmpty(data.confidence_pre_entry),
    emotional_state: nullIfEmpty(data.emotional_state),
    physical_mental_state: nullIfEmpty(data.physical_mental_state),
    pre_trade_checklist: data.pre_trade_checklist ?? false,
    post_trade_reflection: nullIfEmpty(data.post_trade_reflection),
    chart_screenshot_url: nullIfEmpty(data.chart_screenshot_url),
  };
}

export async function createTrade(
  formData: TradeFormValues
): Promise<ServerActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const payload = { ...sanitizeFormValues(formData), user_id: user.id };

    const { data, error } = await supabase
      .from('trades')
      .insert(payload)
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/trades');
    revalidatePath('/dashboard');
    return { success: true, data: { id: data.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function updateTrade(
  id: string,
  formData: TradeFormValues
): Promise<ServerActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const payload = sanitizeFormValues(formData);

    const { error } = await supabase
      .from('trades')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/trades');
    revalidatePath(`/trades/${id}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function deleteTrade(id: string): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();

  await supabase
    .from('trades')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  revalidatePath('/trades');
  revalidatePath('/dashboard');
  redirect('/trades');
}

export async function getTrades(): Promise<ServerActionResult<Trade[]>> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Trade[] };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function getTrade(
  id: string
): Promise<ServerActionResult<Trade>> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Trade };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function getDashboardStats(): Promise<
  ServerActionResult<DashboardStats>
> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false });

    if (error) return { success: false, error: error.message };

    const trades = data as Trade[];

    const stats: DashboardStats = {
      totalTrades: trades.length,
      winRate: calcWinRate(trades),
      avgRR: calcAvgRR(trades),
      totalNetPL: calcTotalNetPL(trades),
      ruleAdherencePct: calcRuleAdherence(trades).pct,
      ruleAdherence: calcRuleAdherence(trades),
      equityCurveData: buildEquityCurve(trades),
      recentTrades: trades.slice(0, 5),
    };

    return { success: true, data: stats };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function uploadChartScreenshot(
  formData: FormData
): Promise<ServerActionResult<{ url: string }>> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file provided' };

    const ext = file.name.split('.').pop() ?? 'png';
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('charts')
      .upload(fileName, file, { upsert: false });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from('charts')
      .getPublicUrl(fileName);

    return { success: true, data: { url: urlData.publicUrl } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
