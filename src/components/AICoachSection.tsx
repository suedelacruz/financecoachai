import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type FinanceData, computeMetrics, generateInsights } from "@/lib/finance";
import { Brain, Lightbulb, Zap, Target } from "lucide-react";

interface Props {
  data: FinanceData;
}

export function AICoachSection({ data }: Props) {
  const [insights, setInsights] = useState<ReturnType<typeof generateInsights> | null>(null);
  const [loading, setLoading] = useState(false);

  const hasData = data.monthlyIncome > 0 && data.expenses.length > 0;

  const generate = () => {
    setLoading(true);
    // Simulate brief delay for UX
    setTimeout(() => {
      const metrics = computeMetrics(data);
      setInsights(generateInsights(data, metrics));
      setLoading(false);
    }, 800);
  };

  if (!hasData) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Brain className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">AI Coach needs your data</p>
        <p className="text-sm">Enter income and expenses first, then come back for personalized insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={generate} disabled={loading} className="gap-2">
        <Brain className="h-4 w-4" />
        {loading ? "Analyzing..." : insights ? "Regenerate Insights" : "Generate Insights"}
      </Button>

      {insights && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{insights.diagnosis}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" /> Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 list-decimal list-inside">
                {insights.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm leading-relaxed">{rec}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-accent/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" /> Biggest Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed font-medium">{insights.biggestOpportunity}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ 3 Quick Wins This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.quickWins.map((win, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {win}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
