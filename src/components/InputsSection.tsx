import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Category, type Expense, type FinanceData, SAMPLE_DATA, generateId } from "@/lib/finance";
import { Plus, Trash2, RotateCcw, Sparkles } from "lucide-react";

interface Props {
  data: FinanceData;
  onChange: (data: FinanceData) => void;
}

export function InputsSection({ data, onChange }: Props) {
  const [incomeError, setIncomeError] = useState("");
  const [expenseErrors, setExpenseErrors] = useState<Record<string, string>>({});

  const setIncome = (val: string) => {
    const n = val === "" ? 0 : Number(val);
    if (val !== "" && (isNaN(n) || n < 0)) {
      setIncomeError("Enter a valid positive number");
      return;
    }
    setIncomeError(n <= 0 && val !== "" ? "Income must be greater than 0" : "");
    onChange({ ...data, monthlyIncome: n });
  };

  const addExpense = () => {
    const expense: Expense = { id: generateId(), category: "Other", amount: 0 };
    onChange({ ...data, expenses: [...data.expenses, expense] });
  };

  const updateExpense = (id: string, field: keyof Expense, value: string | number) => {
    if (field === "amount") {
      const n = Number(value);
      if (isNaN(n) || n < 0) {
        setExpenseErrors((prev) => ({ ...prev, [id]: "Must be ≥ 0" }));
        return;
      }
      setExpenseErrors((prev) => ({ ...prev, [id]: "" }));
    }
    onChange({
      ...data,
      expenses: data.expenses.map((e) =>
        e.id === id ? { ...e, [field]: field === "amount" ? Number(value) : value } : e
      ),
    });
  };

  const deleteExpense = (id: string) => {
    onChange({ ...data, expenses: data.expenses.filter((e) => e.id !== id) });
  };

  const loadSample = () => {
    onChange({ ...SAMPLE_DATA, expenses: SAMPLE_DATA.expenses.map((e) => ({ ...e, id: generateId() })) });
    setIncomeError("");
    setExpenseErrors({});
  };

  const reset = () => {
    onChange({ monthlyIncome: 0, expenses: [] });
    setIncomeError("");
    setExpenseErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={loadSample} className="gap-2">
          <Sparkles className="h-4 w-4" /> Try with sample data
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 4200"
                className="pl-7"
                value={data.monthlyIncome || ""}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
            {incomeError && <p className="text-sm text-destructive mt-1">{incomeError}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Expenses</CardTitle>
          <Button size="sm" onClick={addExpense} className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {data.expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No expenses yet</p>
              <p className="text-sm">Click "Add" or "Try with sample data" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header for md+ */}
              <div className="hidden md:grid md:grid-cols-[1fr_120px_1fr_40px] gap-3 text-xs font-medium text-muted-foreground px-1">
                <span>Category</span>
                <span>Amount</span>
                <span>Note (optional)</span>
                <span></span>
              </div>
              {data.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_120px_1fr_40px] gap-3 items-start p-3 rounded-lg bg-muted/50"
                >
                  <Select
                    value={expense.category}
                    onValueChange={(v) => updateExpense(expense.id, "category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        min={0}
                        className="pl-7"
                        value={expense.amount || ""}
                        onChange={(e) => updateExpense(expense.id, "amount", e.target.value)}
                      />
                    </div>
                    {expenseErrors[expense.id] && (
                      <p className="text-xs text-destructive mt-1">{expenseErrors[expense.id]}</p>
                    )}
                  </div>
                  <Input
                    placeholder="Note..."
                    value={expense.note || ""}
                    onChange={(e) => updateExpense(expense.id, "note", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteExpense(expense.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
