import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useFinance, type CategoryKey, type FixedExpense } from "@/lib/finance-data";
import { CategoryIcon } from "@/components/finance/CategoryIcon";

export const Route = createFileRoute("/onboarding/expenses")({
  head: () => ({ meta: [{ title: "Gastos fijos · MyFinance" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const navigate = useNavigate();
  const { fixedExpenses, setFixedExpenses } = useFinance();
  const [items, setItems] = useState<FixedExpense[]>(fixedExpenses);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryKey>("otros");

  function add() {
    const n = parseFloat(amount);
    if (!name.trim() || !n) return;
    setItems((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), name: name.trim(), amount: n, category },
    ]);
    setName("");
    setAmount("");
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function finish() {
    setFixedExpenses(items);
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-6 py-10">
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Paso 2 de 2
        </p>
        <h1 className="mt-2 text-2xl font-medium text-foreground">Gastos fijos</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Agrega los gastos que se repiten cada período.
        </p>

        <div
          className="mt-5 space-y-2 rounded-2xl p-3"
          style={{ backgroundColor: "var(--card)" }}
        >
          <input
            placeholder="Ej. Renta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            style={{ backgroundColor: "var(--card-elevated)" }}
          />
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryKey)}
              className="rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
              style={{ backgroundColor: "var(--card-elevated)" }}
            >
              {CATEGORY_LIST.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              inputMode="decimal"
              placeholder="$0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-24 rounded-xl px-3 py-2.5 text-right text-sm text-foreground outline-none placeholder:text-muted-foreground"
              style={{ backgroundColor: "var(--card-elevated)" }}
            />
          </div>
          <button
            type="button"
            onClick={add}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium"
            style={{ backgroundColor: "var(--card-elevated)", color: "#1D9E75" }}
          >
            <Plus size={16} /> Agregar
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {items.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
              style={{ backgroundColor: "var(--card)" }}
            >
              <CategoryIcon category={f.category} size={36} iconSize={18} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{f.name}</p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  ${f.amount.toLocaleString("es-MX")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(f.id)}
                aria-label="Eliminar"
                className="p-1.5"
              >
                <Trash2 size={16} color="#7A7A74" />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-4">
          <button
            type="button"
            onClick={finish}
            className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition-opacity active:opacity-80"
          >
            Terminar
          </button>
        </div>
      </div>
    </div>
  );
}