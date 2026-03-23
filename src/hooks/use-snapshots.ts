import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Expense } from "@/lib/finance";

export interface Snapshot {
  id: string;
  monthly_income: number;
  expenses: Expense[];
  total_expenses: number;
  net_cash_flow: number;
  savings_rate: number;
  health_status: string;
  label: string | null;
  created_at: string;
}

export function useSnapshots() {
  const queryClient = useQueryClient();

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ["financial_snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_snapshots")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map((row) => ({
        ...row,
        expenses: (row.expenses as unknown as Expense[]) || [],
      })) as Snapshot[];
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["financial_snapshots"] });

  const deleteSnapshot = async (id: string) => {
    await supabase.from("financial_snapshots").delete().eq("id", id);
    invalidate();
  };

  return { snapshots, isLoading, invalidate, deleteSnapshot };
}
