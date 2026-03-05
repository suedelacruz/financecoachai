import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputsSection } from "@/components/InputsSection";
import { DashboardSection } from "@/components/DashboardSection";
import { AICoachSection } from "@/components/AICoachSection";
import { MonthlyPlanSection } from "@/components/MonthlyPlanSection";
import { type FinanceData } from "@/lib/finance";
import { Wallet, BarChart3, Brain, CalendarDays } from "lucide-react";

const Index = () => {
  const [data, setData] = useState<FinanceData>({ monthlyIncome: 0, expenses: [] });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading tracking-tight">FinCoach AI</h1>
            <p className="text-xs text-muted-foreground">Personal Finance Coach</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="inputs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="inputs" className="gap-1.5 py-2.5 text-xs sm:text-sm">
              <Wallet className="h-4 w-4 hidden sm:block" /> Inputs
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-1.5 py-2.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 hidden sm:block" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="coach" className="gap-1.5 py-2.5 text-xs sm:text-sm">
              <Brain className="h-4 w-4 hidden sm:block" /> AI Coach
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-1.5 py-2.5 text-xs sm:text-sm">
              <CalendarDays className="h-4 w-4 hidden sm:block" /> Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inputs">
            <InputsSection data={data} onChange={setData} />
          </TabsContent>
          <TabsContent value="dashboard">
            <DashboardSection data={data} />
          </TabsContent>
          <TabsContent value="coach">
            <AICoachSection data={data} />
          </TabsContent>
          <TabsContent value="plan">
            <MonthlyPlanSection data={data} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-8">
        <p className="text-center text-xs text-muted-foreground">Built with Lovable • Demo project</p>
      </footer>
    </div>
  );
};

export default Index;
