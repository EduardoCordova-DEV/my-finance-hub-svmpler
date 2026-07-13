import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/finance/AppShell";
import { useFinance, type PeriodType } from "@/lib/finance-data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Perfil · MyFinance" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useFinance();
  const [income, setIncome] = useState(String(user.income));
  const [period, setPeriod] = useState<PeriodType>(user.period);

  function save() {
    const n = parseFloat(income);
    if (!n) return;
    setUser({ income: n, period });
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
          onClick={save}
          className="w-full rounded-full bg-white py-3 text-sm font-medium text-black transition-opacity active:opacity-80"
        >
          Guardar cambios
        </button>
      </section>

      <button
        type="button"
        onClick={() => navigate({ to: "/auth" })}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium"
        style={{ borderColor: "var(--border)", color: "#E24B4A" }}
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
    </AppShell>
  );
}