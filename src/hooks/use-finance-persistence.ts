import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type FinanceData, type Expense } from "@/lib/finance";

export function useFinancePersistence(
  data: FinanceData,
  onChange: (data: FinanceData) => void
) {
  const loaded = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load on mount
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    supabase
      .from("current_finance_data")
      .select("*")
      .eq("id", "current")
      .maybeSingle()
      .then(({ data: row }) => {
        if (row && row.monthly_income > 0) {
          const expenses = (row.expenses as unknown as Expense[]) || [];
          onChange({ monthlyIncome: Number(row.monthly_income), expenses });
        }
      });
  }, [onChange]);

  // Auto-save with debounce
  useEffect(() => {
    if (!loaded.current) return;
    if (data.monthlyIncome === 0 && data.expenses.length === 0) return;

    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      supabase
        .from("current_finance_data")
        .upsert({
          id: "current",
          monthly_income: data.monthlyIncome,
          expenses: data.expenses as unknown as Record<string, unknown>[],
          updated_at: new Date().toISOString(),
        })
        .then(() => {});
    }, 1000);

    return () => clearTimeout(saveTimeout.current);
  }, [data]);

  const saveSnapshot = useCallback(
    async (label?: string) => {
      const { computeMetrics } = await import("@/lib/finance");
      const metrics = computeMetrics(data);
      const { error } = await supabase.from("financial_snapshots").insert({
        monthly_income: data.monthlyIncome,
        expenses: data.expenses as unknown as Record<string, unknown>[],
        total_expenses: metrics.totalExpenses,
        net_cash_flow: metrics.netCashFlow,
        savings_rate: metrics.savingsRate,
        health_status: metrics.healthStatus,
        label: label || null,
      });
      return !error;
    },
    [data]
  );

  return { saveSnapshot };
}
