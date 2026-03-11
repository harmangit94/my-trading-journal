-- ============================================================
-- Trading Journal — Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Updated-at trigger function
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- 2. Profiles table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated-at trigger for profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- 3. Trades table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trades (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core identification
  trade_date            DATE NOT NULL,
  entry_time            TIMESTAMPTZ,
  exit_time             TIMESTAMPTZ,
  duration_minutes      INTEGER,
  ticker                TEXT NOT NULL,
  direction             TEXT NOT NULL CHECK (direction IN ('Long', 'Short')),

  -- Prices & sizing
  entry_price           NUMERIC(18, 6) NOT NULL,
  exit_price            NUMERIC(18, 6),
  position_size         NUMERIC(18, 4),

  -- P/L
  gross_pl              NUMERIC(18, 2),
  net_pl                NUMERIC(18, 2),
  commissions_fees      NUMERIC(18, 2) NOT NULL DEFAULT 0,

  -- Risk
  risk_amount           NUMERIC(18, 2),
  risk_percent          NUMERIC(10, 4),
  realized_rr           NUMERIC(10, 4),

  -- Levels
  initial_stop_price    NUMERIC(18, 6),
  planned_target_price  NUMERIC(18, 6),

  -- Setup & context
  setup_pattern         TEXT,
  timeframe             TEXT,
  market_session        TEXT CHECK (
                          market_session IS NULL OR
                          market_session IN ('Pre-market','Open','Mid-day','Close','After-hours')
                        ),
  market_bias           TEXT CHECK (
                          market_bias IS NULL OR
                          market_bias IN ('Bullish','Bearish','Range')
                        ),
  key_levels_context    TEXT,
  trigger_description   TEXT,
  management_actions    TEXT,

  -- Exit
  exit_reason           TEXT CHECK (
                          exit_reason IS NULL OR
                          exit_reason IN ('Target','Stop','Time-based','Discretionary')
                        ),
  deviation_from_plan   BOOLEAN NOT NULL DEFAULT FALSE,

  -- Psychology
  follow_rule           TEXT NOT NULL CHECK (follow_rule IN ('Yes','No','Partially')),
  confidence_pre_entry  SMALLINT CHECK (confidence_pre_entry BETWEEN 1 AND 10),
  emotional_state       TEXT,
  physical_mental_state TEXT,
  pre_trade_checklist   BOOLEAN NOT NULL DEFAULT FALSE,
  post_trade_reflection TEXT,
  chart_screenshot_url  TEXT,

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated-at trigger for trades
DROP TRIGGER IF EXISTS set_trades_updated_at ON trades;
CREATE TRIGGER set_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- 4. Indexes
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trades_user_id    ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_trade_date ON trades(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_ticker      ON trades(ticker);
CREATE INDEX IF NOT EXISTS idx_trades_follow_rule ON trades(follow_rule);

-- ────────────────────────────────────────────────────────────
-- 5. Row-Level Security
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades   ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trades policies
DROP POLICY IF EXISTS "trades_select_own" ON trades;
CREATE POLICY "trades_select_own"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trades_insert_own" ON trades;
CREATE POLICY "trades_insert_own"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "trades_update_own" ON trades;
CREATE POLICY "trades_update_own"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trades_delete_own" ON trades;
CREATE POLICY "trades_delete_own"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 6. Storage bucket for chart screenshots
-- Note: Run the storage section below in the Supabase dashboard
-- or via the Storage API if the SQL editor doesn't support it.
-- ────────────────────────────────────────────────────────────

-- Create the charts bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('charts', 'charts', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload their own files
DROP POLICY IF EXISTS "charts_upload_own" ON storage.objects;
CREATE POLICY "charts_upload_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'charts'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Storage policy: public read access for chart images
DROP POLICY IF EXISTS "charts_public_read" ON storage.objects;
CREATE POLICY "charts_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'charts');

-- Storage policy: owners can delete their own files
DROP POLICY IF EXISTS "charts_delete_own" ON storage.objects;
CREATE POLICY "charts_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'charts'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
