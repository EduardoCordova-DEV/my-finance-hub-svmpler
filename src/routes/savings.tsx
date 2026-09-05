import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/finance/AppShell";
import { ICON_OPTIONS, IconGlyph } from "@/components/finance/CategoryIcon";
import {
  CUSTOM_COLORS,
  formatMXN,
  periodInfo,
  relativeDate,
  tintFromColor,
  useFinance,
  type IconKey,
  type SavingsGoal,
} from "@/lib/finance-data";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/savings")({
  head: () => ({
    meta: [
      { title: "Ahorros · MyFinance" },
      {
        name: "description",
        content:
          "Define tu meta de ahorro del período, crea metas con nombre y registra tus abonos para ver el progreso.",
      },
      { property: "og:title", content: "Ahorros · MyFinance" },
      {
        property: "og:description",
        content: "Meta de ahorro por período y metas con nombre con abonos y progreso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavingsPage,
});

function SavingsPage() {
  const {
    user,
    setUser,
    savingsGoals,
    savingsContributions,
    savedForGoal,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
  } = useFinance();
  const period = periodInfo(user.period);

  const [targetDraft, setTargetDraft] = useState(String(user.savingsTarget));
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [contribFor, setContribFor] = useState<SavingsGoal | null>(null);
  const [toDelete, setToDelete] = useState<SavingsGoal | null>(null);

  const savedThisPeriod = useMemo(
    () =>
      savingsContributions
        .filter((c) => {
          const d = new Date(c.date);
          return d >= period.start && d <= new Date(period.end.getTime() + 86399000);
        })
        .reduce((s, c) => s + c.amount, 0),
    [savingsContributions, period.start, period.end],
  );

  const totalSaved = savingsContributions.reduce((s, c) => s + c.amount, 0);
  const pct = user.savingsTarget > 0 ? Math.min(100, Math.round((savedThisPeriod / user.savingsTarget) * 100)) : 0;
  const barColor = pct >= 100 ? "#1D9E75" : pct >= 50 ? "#5DCAA5" : "#EF9F27";

  function saveTarget() {
    const n = parseFloat(targetDraft.replace(/[^0-9.]/g, ""));
    if (isNaN(n) || n < 0) return;
    setUser({ savingsTarget: n });
    toast.success("Meta de ahorro actualizada");
  }

  const recent = savingsContributions.slice(0, 12);

  return (
    <AppShell wide>
      <header className="mb-6 md:mb-8">
        <h1 className="text-lg font-medium text-foreground md:text-2xl">Ahorros</h1>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Tu meta {period.label} y tus metas de ahorro
        </p>
      </header>

      <div className="md:grid md:grid-cols-2 md:items-start md:gap-4">
        {/* Meta del período */}
        <section
          className="mb-4 rounded-2xl p-5 md:col-span-2 md:mb-0 md:p-6"
          style={{ backgroundColor: "var(--card)" }}
        >
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Ahorrado {period.label}
          </p>
          <p className="mt-2 text-[32px] font-medium leading-none text-foreground md:text-[40px]">
            {formatMXN(savedThisPeriod)}
          </p>
          <div
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--card-elevated)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span>{pct}% de tu meta</span>
            <span>Meta: {formatMXN(user.savingsTarget)}</span>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <div
              className="flex flex-1 items-center gap-1 rounded-2xl px-4 py-3"
              style={{ backgroundColor: "var(--card-elevated)" }}
            >
              <span className="text-sm text-muted-foreground">$</span>
              <input
                inputMode="decimal"
                value={targetDraft}
                onChange={(e) => setTargetDraft(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full bg-transparent text-sm text-foreground outline-none"
                aria-label="Meta de ahorro por período"
              />
            </div>
            <button
              type="button"
              onClick={saveTarget}
              className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-opacity active:opacity-80"
            >
              Guardar
            </button>
          </div>
        </section>

        {/* Metas */}
        <section
          className="mb-4 rounded-2xl p-5 md:mb-0 md:p-6"
          style={{ backgroundColor: "var(--card)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Mis metas</h2>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Total: {formatMXN(totalSaved)}
            </span>
          </div>

          {savingsGoals.length === 0 ? (
            <p className="py-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
              Aún no tienes metas de ahorro
            </p>
          ) : (
            <ul className="space-y-3">
              {savingsGoals.map((g) => {
                const saved = savedForGoal(g.id);
                const p = g.target > 0 ? Math.min(100, Math.round((saved / g.target) * 100)) : 0;
                return (
                  <li key={g.id} className="rounded-2xl p-3" style={{ backgroundColor: "var(--card-elevated)" }}>
                    <div className="flex items-center gap-3">
                      <IconGlyph icon={g.icon} color={g.color} tint={tintFromColor(g.color)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">{g.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {formatMXN(saved)} de {formatMXN(g.target)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setContribFor(g)}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black"
                      >
                        Abonar
                      </button>
                      <button
                        type="button"
                        aria-label={`Editar ${g.name}`}
                        onClick={() => {
                          setEditing(g);
                          setFormOpen(true);
                        }}
                        className="p-1.5"
                      >
                        <Pencil size={15} color="#A3A29C" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar ${g.name}`}
                        onClick={() => setToDelete(g)}
                        className="p-1.5"
                      >
                        <Trash2 size={15} color="#E24B4A" />
                      </button>
                    </div>
                    <div
                      className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
                      style={{ backgroundColor: "var(--card)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${p}%`, backgroundColor: g.color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3 text-sm font-medium"
            style={{ borderColor: "#7A7A74", color: "#A3A29C" }}
          >
            <Plus size={16} color="#A3A29C" /> Nueva meta
          </button>
        </section>

        {/* Abonos recientes */}
        <section className="rounded-2xl p-5 md:p-6" style={{ backgroundColor: "var(--card)" }}>
          <h2 className="mb-3 text-sm font-medium text-foreground">Abonos recientes</h2>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
              Aún no registras abonos
            </p>
          ) : (
            <ul className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {recent.map((c) => {
                const g = savingsGoals.find((x) => x.id === c.goalId);
                return (
                  <li key={c.id} className="flex items-center gap-3">
                    <IconGlyph
                      icon={g?.icon ?? "ahorro"}
                      color={g?.color ?? "#5DCAA5"}
                      tint={tintFromColor(g?.color ?? "#5DCAA5")}
                      size={36}
                      iconSize={18}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{g?.name ?? "Meta eliminada"}</p>
                      <p
                        className="text-xs"
                        suppressHydrationWarning
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {relativeDate(c.date)}
                      </p>
                    </div>
                    <span className="text-sm font-medium" style={{ color: "#639922" }}>
                      +{formatMXN(c.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <GoalFormSheet
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editing}
        onSave={(data) => {
          if (editing) {
            updateGoal(editing.id, data);
            toast.success("Meta actualizada");
          } else {
            addGoal(data);
            toast.success("Meta creada");
          }
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ContributionSheet
        key={contribFor?.id ?? "none"}
        goal={contribFor}
        onClose={() => setContribFor(null)}
        onSave={(amount) => {
          if (!contribFor) return;
          addContribution(contribFor.id, amount);
          toast.success(`Abono registrado en ${contribFor.name}`);
          setContribFor(null);
        }}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará “{toDelete?.name}” junto con sus abonos registrados. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) deleteGoal(toDelete.id);
                setToDelete(null);
                toast.success("Meta eliminada");
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function GoalFormSheet({
  open,
  onOpenChange,
  goal,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  goal: SavingsGoal | null;
  onSave: (data: Omit<SavingsGoal, "id">) => void;
}) {
  const [name, setName] = useState(goal?.name ?? "");
  const [target, setTarget] = useState(goal ? String(goal.target) : "");
  const [color, setColor] = useState(goal?.color ?? CUSTOM_COLORS[0]);
  const [icon, setIcon] = useState<IconKey>(goal?.icon ?? "ahorro");

  const amount = parseFloat(target.replace(",", "."));
  const valid = name.trim().length > 0 && !!amount && amount > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92vh] max-w-[420px] overflow-y-auto rounded-t-3xl border-t p-6"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <SheetHeader className="mb-4 items-center">
          <div className="mb-2 h-1 w-10 rounded-full" style={{ backgroundColor: "var(--border)" }} />
          <SheetTitle className="text-base font-medium text-foreground">
            {goal ? "Editar meta" : "Nueva meta de ahorro"}
          </SheetTitle>
        </SheetHeader>

        {/* Preview */}
        <div
          className="mb-5 flex items-center gap-3 rounded-2xl px-3 py-2.5"
          style={{ backgroundColor: tintFromColor(color), border: `1px solid ${color}` }}
        >
          <IconGlyph icon={icon} size={32} iconSize={16} color={color} tint="transparent" />
          <span className="truncate text-sm font-medium text-foreground">
            {name.trim() || "Nombre de la meta"}
          </span>
        </div>

        <input
          maxLength={24}
          placeholder="Nombre de la meta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-2xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          style={{ backgroundColor: "var(--card-elevated)" }}
        />

        <div
          className="mb-5 flex items-center gap-1 rounded-2xl px-4 py-3"
          style={{ backgroundColor: "var(--card-elevated)" }}
        >
          <span className="text-sm text-muted-foreground">$</span>
          <input
            inputMode="decimal"
            placeholder="Monto objetivo"
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9.,]/g, ""))}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mb-5">
          <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Color
          </div>
          <div className="flex flex-wrap gap-3">
            {CUSTOM_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                className="h-8 w-8 rounded-full transition-transform active:scale-95"
                style={{
                  backgroundColor: c,
                  outline: color === c ? "2px solid var(--foreground)" : "none",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Ícono
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ICON_OPTIONS.map((o) => {
              const selected = icon === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setIcon(o.key)}
                  className="flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-left"
                  style={{
                    backgroundColor: selected ? tintFromColor(color) : "var(--card-elevated)",
                    borderColor: selected ? color : "transparent",
                  }}
                >
                  <IconGlyph icon={o.key} size={26} iconSize={14} color={color} tint="transparent" />
                  <span className="truncate text-[11px] text-foreground">{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          disabled={!valid}
          onClick={() => valid && onSave({ name: name.trim(), target: amount, color, icon })}
          className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition-opacity active:opacity-80 disabled:opacity-40"
        >
          {goal ? "Guardar cambios" : "Guardar meta"}
        </button>
      </SheetContent>
    </Sheet>
  );
}

function ContributionSheet({
  goal,
  onClose,
  onSave,
}: {
  goal: SavingsGoal | null;
  onClose: () => void;
  onSave: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const n = parseFloat(amount.replace(",", "."));

  return (
    <Sheet open={!!goal} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[420px] rounded-t-3xl border-t p-6"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <SheetHeader className="mb-4 items-center">
          <div className="mb-2 h-1 w-10 rounded-full" style={{ backgroundColor: "var(--border)" }} />
          <SheetTitle className="text-base font-medium text-foreground">
            Abonar a {goal?.name}
          </SheetTitle>
        </SheetHeader>

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

        <button
          type="button"
          disabled={!n || n <= 0}
          onClick={() => onSave(n)}
          className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition-opacity active:opacity-80 disabled:opacity-40"
        >
          Guardar abono
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 flex w-full items-center justify-center gap-1 py-2 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X size={12} /> Cancelar
        </button>
      </SheetContent>
    </Sheet>
  );
}
