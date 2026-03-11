'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash2, Upload } from 'lucide-react';

import { tradeSchema, type TradeFormValues } from '@/schemas/trade';
import { createTrade, updateTrade, deleteTrade, uploadChartScreenshot } from '@/actions/tradeActions';
import type { Trade } from '@/types';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface TradeFormProps {
  mode: 'create' | 'edit';
  trade?: Trade;
  tradeId?: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-xs mt-1">{message}</p>;
}

function FormField({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

export function TradeForm({ mode, trade, tradeId }: TradeFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTrade, setDeletingTrade] = useState(false);
  const [uploadingChart, setUploadingChart] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: trade
      ? {
          trade_date: trade.trade_date,
          ticker: trade.ticker,
          direction: trade.direction,
          follow_rule: trade.follow_rule,
          entry_price: trade.entry_price,
          entry_time: trade.entry_time ?? '',
          exit_time: trade.exit_time ?? '',
          duration_minutes: trade.duration_minutes ?? undefined,
          exit_price: trade.exit_price ?? undefined,
          position_size: trade.position_size ?? undefined,
          gross_pl: trade.gross_pl ?? undefined,
          net_pl: trade.net_pl ?? undefined,
          risk_amount: trade.risk_amount ?? undefined,
          risk_percent: trade.risk_percent ?? undefined,
          realized_rr: trade.realized_rr ?? undefined,
          initial_stop_price: trade.initial_stop_price ?? undefined,
          planned_target_price: trade.planned_target_price ?? undefined,
          commissions_fees: trade.commissions_fees ?? 0,
          setup_pattern: trade.setup_pattern ?? '',
          timeframe: trade.timeframe ?? '',
          market_session: trade.market_session ?? undefined,
          market_bias: trade.market_bias ?? undefined,
          key_levels_context: trade.key_levels_context ?? '',
          trigger_description: trade.trigger_description ?? '',
          management_actions: trade.management_actions ?? '',
          exit_reason: trade.exit_reason ?? undefined,
          deviation_from_plan: trade.deviation_from_plan ?? false,
          confidence_pre_entry: trade.confidence_pre_entry ?? undefined,
          emotional_state: trade.emotional_state ?? '',
          physical_mental_state: trade.physical_mental_state ?? '',
          pre_trade_checklist: trade.pre_trade_checklist ?? false,
          post_trade_reflection: trade.post_trade_reflection ?? '',
          chart_screenshot_url: trade.chart_screenshot_url ?? '',
        }
      : {
          trade_date: new Date().toISOString().split('T')[0],
          commissions_fees: 0,
          deviation_from_plan: false,
          pre_trade_checklist: false,
        },
  });

  // Auto-calc net_pl from gross_pl - commissions_fees
  const grossPL = watch('gross_pl');
  const commissions = watch('commissions_fees');

  useEffect(() => {
    const gross = typeof grossPL === 'number' ? grossPL : parseFloat(String(grossPL) || '0');
    const fees = typeof commissions === 'number' ? commissions : parseFloat(String(commissions) || '0');
    if (!isNaN(gross) && !isNaN(fees) && (grossPL !== undefined && grossPL !== '')) {
      setValue('net_pl', Math.round((gross - fees) * 100) / 100);
    }
  }, [grossPL, commissions, setValue]);

  const onSubmit = async (data: TradeFormValues) => {
    setSubmitting(true);
    try {
      if (mode === 'create') {
        const result = await createTrade(data);
        if (!result.success) {
          toast.error(result.error ?? 'Failed to save trade');
          return;
        }
        toast.success('Trade logged successfully');
        router.push('/trades');
        router.refresh();
      } else if (mode === 'edit' && tradeId) {
        const result = await updateTrade(tradeId, data);
        if (!result.success) {
          toast.error(result.error ?? 'Failed to update trade');
          return;
        }
        toast.success('Trade updated successfully');
        router.push('/trades');
        router.refresh();
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tradeId) return;
    setDeletingTrade(true);
    try {
      await deleteTrade(tradeId);
      toast.success('Trade deleted');
    } catch {
      toast.error('Failed to delete trade');
      setDeletingTrade(false);
      setShowDeleteDialog(false);
    }
  };

  const handleChartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingChart(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await uploadChartScreenshot(formData);
      if (result.success && result.data) {
        setValue('chart_screenshot_url', result.data.url);
        toast.success('Chart uploaded');
      } else {
        toast.error(result.error ?? 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingChart(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="details">Trade Details</TabsTrigger>
          <TabsTrigger value="entry_exit">Entry &amp; Exit</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
          <TabsTrigger value="psychology">Psychology</TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: Trade Details ─── */}
        <TabsContent value="details">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Trade Date *" error={errors.trade_date?.message}>
                <Input
                  type="date"
                  {...register('trade_date')}
                />
              </FormField>

              <FormField label="Ticker *" error={errors.ticker?.message}>
                <Input
                  {...register('ticker')}
                  placeholder="AAPL"
                  className="uppercase"
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.toUpperCase();
                  }}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Direction *" error={errors.direction?.message}>
                <Controller
                  name="direction"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Long">
                          <span className="text-blue-400 font-semibold">
                            Long
                          </span>
                        </SelectItem>
                        <SelectItem value="Short">
                          <span className="text-orange-400 font-semibold">
                            Short
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Setup Pattern" error={errors.setup_pattern?.message}>
                <Input
                  {...register('setup_pattern')}
                  placeholder="e.g. Bull flag, ORB, VWAP reclaim"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Timeframe" error={errors.timeframe?.message}>
                <Input
                  {...register('timeframe')}
                  placeholder="5m, 15m, 1h, D"
                />
              </FormField>

              <FormField label="Market Session" error={errors.market_session?.message}>
                <Controller
                  name="market_session"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Session" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pre-market">Pre-market</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Mid-day">Mid-day</SelectItem>
                        <SelectItem value="Close">Close</SelectItem>
                        <SelectItem value="After-hours">After-hours</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Market Bias" error={errors.market_bias?.message}>
                <Controller
                  name="market_bias"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Bias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bullish">Bullish</SelectItem>
                        <SelectItem value="Bearish">Bearish</SelectItem>
                        <SelectItem value="Range">Range</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 2: Entry & Exit ─── */}
        <TabsContent value="entry_exit">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Entry Time" error={errors.entry_time?.message}>
                <Input type="datetime-local" {...register('entry_time')} />
              </FormField>

              <FormField label="Exit Time" error={errors.exit_time?.message}>
                <Input type="datetime-local" {...register('exit_time')} />
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Entry Price *"
                error={errors.entry_price?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('entry_price')}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Exit Price" error={errors.exit_price?.message}>
                <Input
                  type="number"
                  step="0.01"
                  {...register('exit_price')}
                  placeholder="0.00"
                />
              </FormField>

              <FormField
                label="Position Size"
                error={errors.position_size?.message}
              >
                <Input
                  type="number"
                  step="1"
                  {...register('position_size')}
                  placeholder="Shares / contracts"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Initial Stop Price"
                error={errors.initial_stop_price?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('initial_stop_price')}
                  placeholder="0.00"
                />
              </FormField>

              <FormField
                label="Planned Target Price"
                error={errors.planned_target_price?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('planned_target_price')}
                  placeholder="0.00"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Gross P/L ($)" error={errors.gross_pl?.message}>
                <Input
                  type="number"
                  step="0.01"
                  {...register('gross_pl')}
                  placeholder="0.00"
                />
              </FormField>

              <FormField
                label="Commissions / Fees ($)"
                error={errors.commissions_fees?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('commissions_fees')}
                  placeholder="0.00"
                />
              </FormField>

              <FormField
                label="Net P/L ($)"
                error={errors.net_pl?.message}
                hint="Auto-calculated from Gross P/L − Fees"
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('net_pl')}
                  placeholder="0.00"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Realized R:R" error={errors.realized_rr?.message}>
                <Input
                  type="number"
                  step="0.01"
                  {...register('realized_rr')}
                  placeholder="e.g. 2.5"
                />
              </FormField>

              <FormField
                label="Risk Amount ($)"
                error={errors.risk_amount?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('risk_amount')}
                  placeholder="0.00"
                />
              </FormField>

              <FormField
                label="Risk % of Account"
                error={errors.risk_percent?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('risk_percent')}
                  placeholder="e.g. 1.0"
                />
              </FormField>
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 3: Context & Plan ─── */}
        <TabsContent value="context">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <FormField
              label="Key Levels / Context"
              error={errors.key_levels_context?.message}
            >
              <Textarea
                {...register('key_levels_context')}
                placeholder="Support at $X, resistance at $Y, VWAP at $Z, daily trend..."
                rows={3}
              />
            </FormField>

            <FormField
              label="Trigger Description"
              error={errors.trigger_description?.message}
            >
              <Textarea
                {...register('trigger_description')}
                placeholder="What specific price action triggered your entry?"
                rows={3}
              />
            </FormField>

            <FormField
              label="Management Actions"
              error={errors.management_actions?.message}
            >
              <Textarea
                {...register('management_actions')}
                placeholder="How did you manage the trade? Scaled in/out, moved stop, etc."
                rows={3}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Exit Reason" error={errors.exit_reason?.message}>
                <Controller
                  name="exit_reason"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How did you exit?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Target">Target Hit</SelectItem>
                        <SelectItem value="Stop">Stop Hit</SelectItem>
                        <SelectItem value="Time-based">Time-based</SelectItem>
                        <SelectItem value="Discretionary">
                          Discretionary
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                label="Deviated from Plan?"
                error={errors.deviation_from_plan?.message}
              >
                <div className="flex items-center gap-3 mt-2">
                  <Controller
                    name="deviation_from_plan"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        id="deviation_from_plan"
                      />
                    )}
                  />
                  <label
                    htmlFor="deviation_from_plan"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {watch('deviation_from_plan')
                      ? 'Yes — deviated from plan'
                      : 'No — followed the plan'}
                  </label>
                </div>
              </FormField>
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 4: Psychology & Review ─── */}
        <TabsContent value="psychology">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            {/* Follow Rule — prominent */}
            <div className="border border-border rounded-xl p-4 bg-accent/30">
              <FormField
                label="Did You Follow Your Rules? *"
                error={errors.follow_rule?.message}
              >
                <Controller
                  name="follow_rule"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-3 mt-1">
                      {(['Yes', 'Partially', 'No'] as const).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => field.onChange(val)}
                          className={`flex-1 py-3 rounded-lg text-sm font-bold border-2 transition-all ${
                            field.value === val
                              ? val === 'Yes'
                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                : val === 'Partially'
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                  : 'bg-red-500/20 border-red-500 text-red-400'
                              : 'bg-input border-border text-muted-foreground hover:border-muted-foreground'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Pre-entry Confidence (1-10)"
                error={errors.confidence_pre_entry?.message}
              >
                <Input
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  {...register('confidence_pre_entry')}
                  placeholder="7"
                />
              </FormField>

              <FormField
                label="Pre-trade Checklist Done?"
                error={errors.pre_trade_checklist?.message}
              >
                <div className="flex items-center gap-3 mt-2">
                  <Controller
                    name="pre_trade_checklist"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        id="pre_trade_checklist"
                      />
                    )}
                  />
                  <label
                    htmlFor="pre_trade_checklist"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {watch('pre_trade_checklist') ? 'Yes' : 'No'}
                  </label>
                </div>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Emotional State"
                error={errors.emotional_state?.message}
              >
                <Input
                  {...register('emotional_state')}
                  placeholder="Calm, anxious, FOMO, confident..."
                />
              </FormField>

              <FormField
                label="Physical / Mental State"
                error={errors.physical_mental_state?.message}
              >
                <Input
                  {...register('physical_mental_state')}
                  placeholder="Well-rested, tired, stressed..."
                />
              </FormField>
            </div>

            <FormField
              label="Post-trade Reflection"
              error={errors.post_trade_reflection?.message}
            >
              <Textarea
                {...register('post_trade_reflection')}
                placeholder="What did you do well? What would you do differently? What did you learn?"
                rows={5}
              />
            </FormField>

            <div className="space-y-2">
              <Label>Chart Screenshot</Label>
              <div className="flex gap-3">
                <Input
                  {...register('chart_screenshot_url')}
                  placeholder="https://... (paste URL or upload below)"
                  className="flex-1"
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer bg-input border border-border rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors">
                  {uploadingChart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingChart ? 'Uploading...' : 'Upload chart image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChartUpload}
                    disabled={uploadingChart}
                  />
                </label>
              </div>
              {watch('chart_screenshot_url') && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={watch('chart_screenshot_url') as string}
                    alt="Chart screenshot"
                    className="w-full object-cover max-h-48"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Submit bar */}
      <div className="mt-6 flex items-center justify-between gap-4 bg-card border border-border rounded-xl px-6 py-4">
        <div>
          {mode === 'edit' && tradeId && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Trade
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/trades')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="gap-2 min-w-[120px]">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Log Trade' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trade</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this trade? This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deletingTrade}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingTrade}
            >
              {deletingTrade ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
