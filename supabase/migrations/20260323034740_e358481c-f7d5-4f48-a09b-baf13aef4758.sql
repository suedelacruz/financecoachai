
-- Create table for financial snapshots (history)
CREATE TABLE public.financial_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monthly_income NUMERIC NOT NULL DEFAULT 0,
  expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_expenses NUMERIC NOT NULL DEFAULT 0,
  net_cash_flow NUMERIC NOT NULL DEFAULT 0,
  savings_rate NUMERIC NOT NULL DEFAULT 0,
  health_status TEXT NOT NULL DEFAULT 'Critical',
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for current working data (single row, upserted)
CREATE TABLE public.current_finance_data (
  id TEXT NOT NULL DEFAULT 'current' PRIMARY KEY,
  monthly_income NUMERIC NOT NULL DEFAULT 0,
  expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_finance_data ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth in this demo)
CREATE POLICY "Public read snapshots" ON public.financial_snapshots FOR SELECT USING (true);
CREATE POLICY "Public insert snapshots" ON public.financial_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete snapshots" ON public.financial_snapshots FOR DELETE USING (true);

CREATE POLICY "Public read current" ON public.current_finance_data FOR SELECT USING (true);
CREATE POLICY "Public insert current" ON public.current_finance_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update current" ON public.current_finance_data FOR UPDATE USING (true);
