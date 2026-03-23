import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { type FinanceData, computeMetrics, formatCurrency, formatPct, CATEGORIES } from "@/lib/finance";
import { FlaskConical, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  data: FinanceData;
}

export function ScenarioSimulator({ data }: Props) {
  const hasData = data.monthlyIncome > 0 && data.expenses.length > 0;

  // Adjustments as percentage changes per category (-100 to +50)
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const baseMetrics = useMemo(() => computeMetrics(data), [data]);

  const simulatedData = useMemo((): FinanceData => {
    return {
      monthlyIncome: data.monthlyIncome,
      expenses: data.expenses.map((e) => {
        const adj = adjustments[e.category] ?? 0;
        return { ...e, amount: Math.max(0, Math.round(e.amount * (1 + adj / 100))) };
      }),
    };
  }, [data, adjustments]);

  const simMetrics = useMemo(() => computeMetrics(simulatedData), [simulatedData]);

  const resetAll = () => setAdjustments({});

  // Get active categories from expenses
  const activeCategories = useMemo(() => {
    const cats = new Set(data.expenses.map((e) => e.category));
    return CATEGORIES.filter((c) => cats.has(c));
  }, [data]);

  if (!hasData) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">No data to simulate</p>
        <p className="text-sm">Enter your income and expenses first to run scenarios.</p>
      </div>
    );
  }

  const healthColor = (status: string) =>
    status === "Healthy"
      ? "bg-success text-success-foreground"
      : status === "Caution"
        ? "bg-warning text-warning-foreground"
        : "bg-destructive text-destructive-foreground";

  const hasChanges = Object.values(adjustments).some((v) => v !== 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" /> Scenario Simulator
        </h3>
        {hasChanges && (
          <Button variant="outline" size="sm" onClick={resetAll} className="gap-1 ml-auto">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        )}
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Current Savings Rate</p>
            <p className="text-2xl font-bold font-heading">{formatPct(baseMetrics.savingsRate)}</p>
            <Badge className={`mt-2 ${healthColor(baseMetrics.healthStatus)}`}>
              {baseMetrics.healthStatus}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Simulated Savings Rate</p>
            <p className="text-2xl font-bold font-heading">{formatPct(simMetrics.savingsRate)}</p>
            <Badge className={`mt-2 ${healthColor(simMetrics.healthStatus)}`}>
              {simMetrics.healthStatus}
            </Badge>
            {hasChanges && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {simMetrics.savingsRate > baseMetrics.savingsRate ? (
                  <>
                    <TrendingUp className="h-3.5 w-3.5 text-success" />
                    <span className="text-success font-medium">
                      +{formatPct(simMetrics.savingsRate - baseMetrics.savingsRate)}
                    </span>
                  </>
                ) : simMetrics.savingsRate < baseMetrics.savingsRate ? (
                  <>
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-destructive font-medium">
                      {formatPct(simMetrics.savingsRate - baseMetrics.savingsRate)}
                    </span>
                  </>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash flow comparison */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Current Net Cash Flow</p>
            <p className="text-xl font-bold font-heading">{formatCurrency(baseMetrics.netCashFlow)}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Simulated Net Cash Flow</p>
            <p className="text-xl font-bold font-heading">{formatCurrency(simMetrics.netCashFlow)}</p>
            {hasChanges && (
              <p className={`text-xs mt-1 font-medium ${simMetrics.netCashFlow > baseMetrics.netCashFlow ? "text-success" : simMetrics.netCashFlow < baseMetrics.netCashFlow ? "text-destructive" : "text-muted-foreground"}`}>
                {simMetrics.netCashFlow >= baseMetrics.netCashFlow ? "+" : ""}
                {formatCurrency(simMetrics.netCashFlow - baseMetrics.netCashFlow)}/month
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sliders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adjust Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {activeCategories.map((cat) => {
            const adj = adjustments[cat] ?? 0;
            const catExpenses = data.expenses.filter((e) => e.category === cat);
            const currentTotal = catExpenses.reduce((s, e) => s + e.amount, 0);
            const simTotal = Math.max(0, Math.round(currentTotal * (1 + adj / 100)));

            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{cat}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(currentTotal)} → {formatCurrency(simTotal)}{" "}
                    <span className={adj < 0 ? "text-success font-medium" : adj > 0 ? "text-destructive font-medium" : ""}>
                      ({adj >= 0 ? "+" : ""}{adj}%)
                    </span>
                  </span>
                </div>
                <Slider
                  value={[adj]}
                  min={-100}
                  max={50}
                  step={5}
                  onValueChange={([v]) => setAdjustments((prev) => ({ ...prev, [cat]: v }))}
                  className="w-full"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
