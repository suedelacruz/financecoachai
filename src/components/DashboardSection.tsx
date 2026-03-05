import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type FinanceData, type Metrics, computeMetrics, formatCurrency, formatPct } from "@/lib/finance";
import { DollarSign, TrendingDown, TrendingUp, PiggyBank, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const CHART_COLORS = [
  "hsl(174, 58%, 40%)", "hsl(175, 75%, 25%)", "hsl(172, 66%, 50%)",
  "hsl(210, 60%, 50%)", "hsl(38, 92%, 50%)", "hsl(280, 50%, 55%)",
  "hsl(0, 72%, 55%)", "hsl(152, 50%, 45%)", "hsl(320, 50%, 55%)",
  "hsl(180, 40%, 50%)", "hsl(210, 40%, 65%)",
];

interface Props {
  data: FinanceData;
}

export function DashboardSection({ data }: Props) {
  if (data.monthlyIncome <= 0 && data.expenses.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">No data yet</p>
        <p className="text-sm">Enter your income and expenses in the Inputs tab to see your dashboard.</p>
      </div>
    );
  }

  const metrics = computeMetrics(data);
  const { totalExpenses, netCashFlow, savingsRate, healthStatus, redFlags, byCategory } = metrics;

  const healthColor = healthStatus === "Healthy" ? "bg-success text-success-foreground"
    : healthStatus === "Caution" ? "bg-warning text-warning-foreground"
    : "bg-destructive text-destructive-foreground";

  const kpis = [
    { label: "Income", value: formatCurrency(data.monthlyIncome), icon: DollarSign, color: "text-primary" },
    { label: "Total Expenses", value: formatCurrency(totalExpenses), icon: TrendingDown, color: "text-destructive" },
    { label: "Net Cash Flow", value: formatCurrency(netCashFlow), icon: netCashFlow >= 0 ? TrendingUp : TrendingDown, color: netCashFlow >= 0 ? "text-success" : "text-destructive" },
    { label: "Savings Rate", value: formatPct(savingsRate), icon: PiggyBank, color: "text-primary" },
  ];

  const pieData = byCategory.map((c) => ({ name: c.category, value: c.amount }));

  return (
    <div className="space-y-6">
      {/* Health badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Financial Health:</span>
        <Badge className={healthColor}>{healthStatus}</Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold font-heading">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Red flags */}
      {redFlags.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
