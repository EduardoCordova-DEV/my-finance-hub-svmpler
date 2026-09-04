import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, Plus, Pencil } from "lucide-react";
import { AppShell } from "@/components/finance/AppShell";
import { CategoryIcon } from "@/components/finance/CategoryIcon";
import { CategoryFormSheet } from "@/components/finance/CategoryFormSheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  formatMXN,
  useFinance,
  type CategoryDef,
  type CategoryKey,
  type FixedExpense,
} from "@/lib/finance-data";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Gastos fijos y categorías · MyFinance" },
      {
        name: "description",
        content:
          "Edita tus gastos fijos recurrentes y crea categorías personalizadas con color e ícono propios.",
      },
      { property: "og:title", content: "Gastos fijos y categorías · MyFinance" },
      {
        property: "og:description",
        content: "Administra gastos fijos y categorías personalizadas en MyFinance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { fixedExpenses, setFixedExpenses, categories, transactions, deleteCategory } = useFinance();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryKey>("otros");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDef | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CategoryDef | null>(null);
  const [editingFixedId, setEditingFixedId] = useState<string | null>(null);

  const customCategories = categories.filter((c) => c.custom);

  const usageCount = useMemo(() => {
    const key = pendingDelete?.key;
    if (!key) return 0;
    return (
      transactions.filter((t) => t.category === key).length +
      fixedExpenses.filter((f) => f.category === key).length
    );
  }, [pendingDelete, transactions, fixedExpenses]);

  function resetForm() {
    setEditingFixedId(null);
    setName("");
    setAmount("");
    setCategory("otros");
  }

  function add() {
    const n = parseFloat(amount);
    if (!name.trim() || !n) return;
    if (editingFixedId) {
      setFixedExpenses(
        fixedExpenses.map((f) =>
          f.id === editingFixedId ? { ...f, name: name.trim(), amount: n, category } : f,
        ),
      );
      resetForm();
      return;
    }
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

  function startEdit(f: FixedExpense) {
    setEditingFixedId(f.id);
    setName(f.name);
    setAmount(String(f.amount));
    setCategory(f.category);
  }

  function remove(id: string) {
    setFixedExpenses(fixedExpenses.filter((f) => f.id !== id));
  }

  function confirmDelete() {
    if (pendingDelete) {
      deleteCategory(pendingDelete.key);
      if (category === pendingDelete.key) setCategory("otros");
    }
    setPendingDelete(null);
  }

  const total = fixedExpenses.reduce((s, f) => s + f.amount, 0);

  return (
    <AppShell>
      <h1 className="text-xl font-medium text-foreground">Gastos fijos</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Total: <span className="text-foreground">{formatMXN(total)}</span>
      </p>

      <div className="mt-4 space-y-3 rounded-2xl p-3" style={{ backgroundColor: "var(--card)" }}>
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          style={{ backgroundColor: "var(--card-elevated)" }}
        />

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className="flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: selected ? c.tint : "var(--card-elevated)",
                  borderColor: selected ? c.color : "transparent",
                  color: "var(--foreground)",
                }}
              >
                <CategoryIcon category={c.key} size={20} iconSize={12} />
                {c.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1.5 text-xs font-medium"
            style={{ borderColor: "#7A7A74", color: "#A3A29C" }}
          >
            <Plus size={13} /> Nueva categoría
          </button>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={add}
            className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium"
            style={{ backgroundColor: "var(--card-elevated)", color: "#1D9E75" }}
          >
            <Plus size={16} /> Agregar
          </button>
          <input
            inputMode="decimal"
            placeholder="$0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-24 rounded-xl px-3 py-2.5 text-right text-sm text-foreground outline-none placeholder:text-muted-foreground"
            style={{ backgroundColor: "var(--card-elevated)" }}
          />
        </div>
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

      {/* Custom categories management */}
      <h2 className="mt-8 text-sm font-medium text-foreground">Mis categorías</h2>
      {customCategories.length === 0 ? (
        <p className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
          Aún no has creado categorías personalizadas
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {customCategories.map((c) => (
            <li
              key={c.key}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
              style={{ backgroundColor: "var(--card)" }}
            >
              <CategoryIcon category={c.key} />
              <p className="min-w-0 flex-1 truncate text-sm text-foreground">{c.name}</p>
              <button
                type="button"
                aria-label={`Editar ${c.name}`}
                className="p-1.5"
                onClick={() => {
                  setEditing(c);
                  setSheetOpen(true);
                }}
              >
                <Pencil size={16} color="#7A7A74" />
              </button>
              <button
                type="button"
                aria-label={`Eliminar ${c.name}`}
                className="p-1.5"
                onClick={() => setPendingDelete(c)}
              >
                <Trash2 size={16} color="#7A7A74" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <CategoryFormSheet
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) setEditing(null);
        }}
        editing={editing}
        onSaved={(key) => setCategory(key)}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent
          className="mx-auto max-w-[360px] rounded-2xl border"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-medium">
              ¿Eliminar “{pendingDelete?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {usageCount > 0
                ? `Esta categoría tiene ${usageCount} registro(s). Se reasignarán a “Otros”.`
                : "Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="rounded-full" onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
