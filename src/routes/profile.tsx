import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, CalendarDays, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/finance/AppShell";
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
import { toast } from "sonner";
import { formatMXN, useFinance, type PeriodType } from "@/lib/finance-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil y ajustes · MyFinance" },
      {
        name: "description",
        content: "Edita tu ingreso, cambia entre presupuesto quincenal o mensual y cierra sesión.",
      },
      { property: "og:title", content: "Perfil y ajustes · MyFinance" },
      {
        property: "og:description",
        content: "Ajusta tu ingreso y el tipo de período de tu presupuesto en MyFinance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useFinance();
  const [income, setIncome] = useState(String(user.income));
  const [period, setPeriod] = useState<PeriodType>(user.period);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const parsed = parseFloat(income);
  const periodChanged = period !== user.period;
  const incomeChanged = !!parsed && parsed !== user.income;

  function apply() {
    if (!parsed) return;
    setUser({ income: parsed, period });
    toast.success("Presupuesto actualizado", {
      description: `${period === "quincenal" ? "Quincenal" : "Mensual"} · ${formatMXN(parsed)}`,
    });
  }

  function handleSave() {
    if (!parsed) return;
    if (periodChanged) {
      setConfirmOpen(true);
      return;
    }
    apply();
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <AppShell>
      <h1 className="mb-6 text-xl font-medium text-foreground">Perfil</h1>

      <section
        className="mb-5 flex items-center gap-4 rounded-2xl p-4"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-medium"
          style={{ backgroundColor: "var(--card-elevated)" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs" style={{ color: "var(--text-tertiary)" }}>
            {user.email}
          </p>
        </div>
      </section>

      <section
        className="mb-5 space-y-4 rounded-2xl p-4"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div>
          <label className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Período
          </label>
          <div
            className="mt-2 grid grid-cols-2 rounded-full p-1"
            style={{ backgroundColor: "var(--card-elevated)" }}
          >
            {(["quincenal", "mensual"] as PeriodType[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className="rounded-full py-2 text-sm font-medium capitalize transition-colors"
                style={{
                  backgroundColor: period === p ? "var(--background)" : "transparent",
                  color: period === p ? "var(--foreground)" : "var(--muted-foreground)",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          {periodChanged ? (
            <p className="mt-2 text-xs" style={{ color: "#EF9F27" }}>
              Cambiarás de {user.period} a {period}. Te pediremos confirmación al guardar.
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Ingreso {period}
          </label>
          <div
            className="mt-2 flex items-center gap-1 rounded-xl px-3 py-2.5"
            style={{ backgroundColor: "var(--card-elevated)" }}
          >
            <span className="text-muted-foreground">$</span>
            <input
              inputMode="decimal"
              value={income}
              onChange={(e) => setIncome(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!parsed || (!periodChanged && !incomeChanged)}
          className="w-full rounded-full bg-white py-3 text-sm font-medium text-black transition-opacity active:opacity-80 disabled:opacity-30"
        >
          Guardar cambios
        </button>
      </section>

      <Link
        to="/calendar"
        className="mb-5 flex items-center gap-3 rounded-2xl p-4"
        style={{ backgroundColor: "var(--card)" }}
      >
        <CalendarDays size={20} color="#1D9E75" strokeWidth={1.75} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground">Calendario de registros</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Compara tus gastos mes con mes
          </p>
        </div>
        <ChevronRight size={16} color="#7A7A74" />
      </Link>

      <button
        type="button"
        onClick={() => navigate({ to: "/auth" })}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium"
        style={{ borderColor: "var(--border)", color: "#E24B4A" }}
      >
        <LogOut size={16} /> Cerrar sesión
      </button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent
          className="mx-auto max-w-[360px] rounded-2xl border"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-medium">
              ¿Cambiar a presupuesto {period}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tu ingreso pasará a {formatMXN(parsed || 0)} {period}. Se recalcularán el disponible,
              los días restantes y los porcentajes de tus gastos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-full"
              onClick={() => setPeriod(user.period)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-full" onClick={apply}>
              Sí, cambiar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
