import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type FinanceData, computeMetrics, formatCurrency, formatPct } from "@/lib/finance";
import { useSnapshots, type Snapshot } from "@/hooks/use-snapshots";
import { useFinancePersistence } from "@/hooks/use-finance-persistence";
import { History, Save, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  data: FinanceData;
  onLoadSnapshot: (data: FinanceData) => void;
  saveSnapshot: (label?: string) => Promise<boolean>;
}

export function ExpenseHistory({ data, onLoadSnapshot, saveSnapshot }: Props) {
  const { snapshots, isLoading, invalidate, deleteSnapshot } = useSnapshots();
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const hasData = data.monthlyIncome > 0 && data.expenses.length > 0;

  const handleSave = async () => {
    if (!hasData) return;
    setSaving(true);
    const ok = await saveSnapshot(label || undefined);
    setSaving(false);
    if (ok) {
      toast({ title: "Snapshot saved!", description: label || "Current financial data saved to history." });
      setLabel("");
      invalidate();
    } else {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSnapshot(id);
    toast({ title: "Snapshot deleted" });
  };

  const handleLoad = (snap: Snapshot) => {
    onLoadSnapshot({ monthlyIncome: snap.monthly_income, expenses: snap.expenses });
    toast({ title: "Loaded snapshot", description: snap.label || formatDate(snap.created_at) });
  };

  const healthColor = (status: string) =>
    status === "Healthy"
      ? "bg-success text-success-foreground"
      : status === "Caution"
        ? "bg-warning text-warning-foreground"
        : "bg-destructive text-destructive-foreground";

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // Compute trend between consecutive snapshots
  const getTrend = (index: number) => {
    if (index >= snapshots.length - 1) return null;
    const current = snapshots[index];
    const previous = snapshots[index + 1];
    const delta = current.savings_rate - previous.savings_rate;
    return delta;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> Expense History
        </h3>
      </div>

      {/* Save current */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Label (optional, e.g. 'March 2026')"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSave}
              disabled={!hasData || saving}
              className="gap-2 shrink-0"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Snapshot"}
            </Button>
          </div>
          {!hasData && (
            <p className="text-xs text-muted-foreground mt-2">Enter income and expenses first to save a snapshot.</p>
          )}
        </CardContent>
      </Card>

      {/* History list */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading history...</div>
      ) : snapshots.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No history yet</p>
          <p className="text-sm">Save your first snapshot to start tracking trends.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {snapshots.map((snap, i) => {
            const trend = getTrend(i);

            return (
              <Card key={snap.id} className="group">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-heading font-semibold text-sm truncate">
                          {snap.label || formatDate(snap.created_at)}
                        </span>
                        <Badge className={healthColor(snap.health_status)} variant="secondary">
                          {snap.health_status}
                        </Badge>
                        {trend !== null && (
                          <span className="flex items-center gap-0.5 text-xs font-medium">
                            {trend > 0.001 ? (
                              <>
                                <TrendingUp className="h-3.5 w-3.5 text-success" />
                                <span className="text-success">+{formatPct(trend)}</span>
                              </>
                            ) : trend < -0.001 ? (
                              <>
                                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                                <span className="text-destructive">{formatPct(trend)}</span>
                              </>
                            ) : (
                              <>
                                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">No change</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Income: {formatCurrency(snap.monthly_income)}</span>
                        <span>Expenses: {formatCurrency(snap.total_expenses)}</span>
                        <span>Cash Flow: {formatCurrency(snap.net_cash_flow)}</span>
                        <span>Savings: {formatPct(snap.savings_rate)}</span>
                      </div>
                      {snap.label && (
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(snap.created_at)}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleLoad(snap)}>
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => handleDelete(snap.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
