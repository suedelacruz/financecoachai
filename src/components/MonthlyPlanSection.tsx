import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type FinanceData, computeMetrics, generateMonthlyPlan, generateInsights, formatCurrency, formatPct } from "@/lib/finance";
import { CalendarDays, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  data: FinanceData;
}

export function MonthlyPlanSection({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const hasData = data.monthlyIncome > 0 && data.expenses.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">No plan to show</p>
        <p className="text-sm">Enter your financial data first to generate a monthly plan.</p>
      </div>
    );
  }

  const metrics = computeMetrics(data);
  const plan = generateMonthlyPlan(data, metrics);
  const insights = generateInsights(data, metrics);

  const buildReport = () => {
    const lines: string[] = [
      "═══ FinCoach AI — Financial Summary ═══",
      "",
      "📊 INPUTS",
      `  Monthly Income: ${formatCurrency(data.monthlyIncome)}`,
      `  Expenses (${data.expenses.length} items):`,
      ...data.expenses.map((e) => `    • ${e.category}: ${formatCurrency(e.amount)}${e.note ? ` (${e.note})` : ""}`),
      "",
      "📈 KEY METRICS",
      `  Total Expenses: ${formatCurrency(metrics.totalExpenses)}`,
      `  Net Cash Flow: ${formatCurrency(metrics.netCashFlow)}`,
      `  Savings Rate: ${formatPct(metrics.savingsRate)}`,
      `  Financial Health: ${metrics.healthStatus}`,
      "",
    ];

    if (metrics.redFlags.length > 0) {
      lines.push("🚩 RED FLAGS");
      metrics.redFlags.forEach((f) => lines.push(`  ⚠ ${f}`));
      lines.push("");
    }

    lines.push("🤖 AI RECOMMENDATIONS");
    insights.recommendations.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`));
    lines.push("", `  💡 Biggest Opportunity: ${insights.biggestOpportunity}`, "");

    lines.push("📅 NEXT MONTH PLAN");
    plan.targets.forEach((t) => {
      const arrow = t.delta < 0 ? "↓" : t.delta > 0 ? "↑" : "→";
      lines.push(`  ${t.category}: ${formatCurrency(t.current)} ${arrow} ${formatCurrency(t.suggested)} (${t.delta >= 0 ? "+" : ""}${formatCurrency(t.delta)})`);
    });
    lines.push(`  🎯 Savings Target: ${formatCurrency(plan.savingsTarget.amount)} (${formatPct(plan.savingsTarget.pct)})`);
    lines.push("", `  ${plan.rationale}`);
    lines.push("", "Built with Lovable • Demo project");

    return lines.join("\n");
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildReport());
      setCopied(true);
      toast({ title: "Copied!", description: "Summary copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-heading text-lg font-semibold">Next Month Budget Plan</h3>
        <Button variant="outline" size="sm" onClick={copyReport} className="gap-2 ml-auto">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Summary"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Category</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">Current</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">Target</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {plan.targets.map((t) => (
                  <tr key={t.category} className="border-b border-border/50">
                    <td className="py-2.5 pr-4">{t.category}</td>
                    <td className="py-2.5 pr-4 text-right">{formatCurrency(t.current)}</td>
                    <td className="py-2.5 pr-4 text-right font-medium">{formatCurrency(t.suggested)}</td>
                    <td className={`py-2.5 text-right font-medium ${t.delta < 0 ? "text-success" : t.delta > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {t.delta >= 0 ? "+" : ""}{formatCurrency(t.delta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-accent/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="font-heading font-semibold">Savings Target</span>
          </div>
          <p className="text-2xl font-bold font-heading">
            {formatCurrency(plan.savingsTarget.amount)}/month
            <span className="text-base font-normal text-muted-foreground ml-2">({formatPct(plan.savingsTarget.pct)})</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{plan.rationale}</p>
        </CardContent>
      </Card>
    </div>
  );
}
