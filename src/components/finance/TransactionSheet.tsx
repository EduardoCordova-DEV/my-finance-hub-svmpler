import { useState } from "react";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useFinance, type CategoryKey } from "@/lib/finance-data";
import { CategoryIcon } from "./CategoryIcon";
import { CategoryFormSheet } from "./CategoryFormSheet";

export function TransactionSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addTransaction, categories, getCategory } = useFinance();
  const [type, setType] = useState<"gasto" | "ingreso">("gasto");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryKey>("comida");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  function reset() {
    setType("gasto");
    setAmount("");
    setCategory("comida");
    setNote("");
  }

  function handleSave() {
    const n = parseFloat(amount.replace(",", "."));
    if (!n || n <= 0) return;
    addTransaction({
      type,
      name: note || getCategory(category).name,
      category,
      amount: n,
      note: note || undefined,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[92vh] max-w-[420px] overflow-y-auto rounded-t-3xl border-t p-6"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <SheetHeader className="mb-4 items-center">
            <div
              className="mb-2 h-1 w-10 rounded-full"
              style={{ backgroundColor: "var(--border)" }}
            />
            <SheetTitle className="text-base font-medium text-foreground">
              Nuevo movimiento
            </SheetTitle>
          </SheetHeader>

          {/* Type toggle */}
          <div
            className="mx-auto mb-6 grid w-full max-w-[240px] grid-cols-2 rounded-full p-1"
            style={{ backgroundColor: "var(--card-elevated)" }}
          >
            {(["gasto", "ingreso"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="rounded-full py-2 text-sm font-medium capitalize transition-colors"
                style={{
                  backgroundColor: type === t ? "var(--background)" : "transparent",
                  color: type === t ? "var(--foreground)" : "var(--muted-foreground)",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="mb-6 text-center">
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Monto
            </div>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-2xl text-muted-foreground">$</span>
              <input
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                className="w-full max-w-[220px] bg-transparent text-center text-4xl font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Category grid */}
          <div className="mb-5">
            <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Categoría
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => {
                const selected = category === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className="flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors"
                    style={{
                      backgroundColor: selected ? c.tint : "var(--card-elevated)",
                      borderColor: selected ? c.color : "transparent",
                    }}
                  >
                    <CategoryIcon category={c.key} size={32} iconSize={16} />
                    <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex items-center gap-3 rounded-2xl border border-dashed px-3 py-2.5 text-left transition-colors"
                style={{ borderColor: "#7A7A74", color: "#A3A29C" }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed"
                  style={{ borderColor: "#7A7A74" }}
                >
                  <Plus size={15} color="#A3A29C" />
                </span>
                <span className="truncate text-sm font-medium">Nueva categoría</span>
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="mb-6">
            <input
              placeholder="Nota (opcional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              style={{ backgroundColor: "var(--card-elevated)" }}
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition-opacity active:opacity-80"
          >
            Guardar
          </button>
        </SheetContent>
      </Sheet>

      <CategoryFormSheet
        open={creating}
        onOpenChange={setCreating}
        onSaved={(key) => setCategory(key)}
      />
    </>
  );
}
