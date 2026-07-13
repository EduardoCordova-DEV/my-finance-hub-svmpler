import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { AppShell } from "@/components/finance/AppShell";
import { CategoryIcon } from "@/components/finance/CategoryIcon";
import {
  CATEGORY_LIST,
  formatMXN,
  useFinance,
  type CategoryKey,
  type FixedExpense,
} from "@/lib/finance-data";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Gastos fijos · MyFinance" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { fixedExpenses, setFixedExpenses } = useFinance();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryKey>("otros");

  function add() {
    const n = parseFloat(amount);
    if (!name.trim() || !n) return;
    const item: FixedExpense = {
      id: Math.random().toString(36).slice(2),
      name: name.trim(),
      amount: n,
      category,
    };
    setFixedExpenses([...fixedExpenses, item]);
    setName("");
    setAmount("");
  }

  function remove(id: string) {
    setFixedExpenses(fixedExpenses.filter((f) => f.id !== id));
  }

  const total = fixedExpenses.reduce((s, f) => s + f.amount, 0);

  return (
    <AppShell>
      <h1 className="text-xl font-medium text-foreground">Gastos fijos</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Total: <span className="text-foreground">{formatMXN(total)}</span>
      </p>

      <div
        className="mt-4 space-y-2 rounded-2xl p-3"
        style={{ backgroundColor: "var(--card)" }}
      >
        <input
          placeholder="Nombre"
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
        {fixedExpenses.map((f) => (
          <li
            key={f.id}
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
            style={{ backgroundColor: "var(--card)" }}
          >
            <CategoryIcon category={f.category} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">{f.name}</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {formatMXN(f.amount)}
              </p>
            </div>
            <button type="button" onClick={() => remove(f.id)} aria-label="Eliminar" className="p-1.5">
              <Trash2 size={16} color="#7A7A74" />
            </button>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}