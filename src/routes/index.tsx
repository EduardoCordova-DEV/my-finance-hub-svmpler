import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/finance/AppShell";
import { CategoryIcon } from "@/components/finance/CategoryIcon";
import {
  CATEGORIES,
  formatMXN,
  periodInfo,
  relativeDate,
  useFinance,
  type CategoryKey,
} from "@/lib/finance-data";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio · MyFinance" },
      {
        name: "description",
        content: "Tu resumen financiero del período: disponible, gastos fijos, variables y movimientos recientes.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, fixedExpenses, transactions } = useFinance();
  const period = periodInfo(user.period);

  const totalFixed = fixedExpenses.reduce((s, f) => s + f.amount, 0);
  const variableTx = transactions.filter((t) => t.type === "gasto");
  const totalVariable = variableTx.reduce((s, t) => s + t.amount, 0);
  const spent = totalFixed + totalVariable;
  const available = Math.max(0, user.income - spent);
  const usedPct = Math.min(100, Math.round((spent / user.income) * 100));

  const progressColor =
    usedPct >= 100 ? "#E24B4A" : usedPct >= 85 ? "#EF9F27" : "#1D9E75";

  // Category breakdown from variable + fixed
  const catTotals = new Map<CategoryKey, number>();
  [...fixedExpenses.map((f) => ({ category: f.category, amount: f.amount })), ...variableTx].forEach(
    (e) => {
      catTotals.set(e.category, (catTotals.get(e.category) ?? 0) + e.amount);
    },
  );
  const donutData = Array.from(catTotals.entries())
    .map(([key, value]) => ({ key, value, def: CATEGORIES[key] }))
    .sort((a, b) => b.value - a.value);
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0) || 1;

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const recent = transactions.slice(0, 6);

  return (
    <AppShell>
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Hola,
          </p>
          <h1 className="text-lg font-medium text-foreground">{user.name.split(" ")[0]}</h1>
        </div>
        <Link
          to="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
          style={{ backgroundColor: "var(--card-elevated)", color: "var(--foreground)" }}
        >
          {initials}
        </Link>
      </header>

      {/* Available card */}
      <section
        className="mb-4 rounded-2xl p-5"
        style={{ backgroundColor: "var(--card)" }}
      >
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Disponible {period.label}
        </p>
        <p className="mt-2 text-[32px] font-medium leading-none text-foreground">
          {formatMXN(available)}
        </p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-elevated)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${usedPct}%`, backgroundColor: progressColor }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>{usedPct}% usado</span>
          <span>{period.remaining} días restantes</span>
        </div>
      </section>

      {/* Two small cards */}
      <section className="mb-4 grid grid-cols-2 gap-3">
        <MiniStat label="Gastos fijos" value={totalFixed} />
        <MiniStat label="Gastos variables" value={totalVariable} />
      </section>

      {/* Category donut */}
      <section
        className="mb-4 rounded-2xl p-5"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Por categoría</h2>
          <Link to="/history" className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Ver todo
          </Link>
        </div>
        {donutData.length === 0 ? (
          <EmptyLine>Aún no tienes gastos este período</EmptyLine>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={38}
                    outerRadius={60}
                    stroke="none"
                    paddingAngle={2}
                  >
                    {donutData.map((d) => (
                      <Cell key={d.key} fill={d.def.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-2">
              {donutData.slice(0, 5).map((d) => (
                <li key={d.key} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: d.def.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground">{d.def.name}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>
                    {Math.round((d.value / donutTotal) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Recent movements */}
      <section
        className="rounded-2xl p-5"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Movimientos recientes</h2>
          <Link
            to="/history"
            className="flex items-center gap-0.5 text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            Ver todo <ChevronRight size={12} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyLine>Aún no tienes movimientos este período</EmptyLine>
        ) : (
          <ul className="space-y-3">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <CategoryIcon category={t.category} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{t.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {relativeDate(t.date)}
                  </p>
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: t.type === "ingreso" ? "#639922" : "var(--foreground)" }}
                >
                  {t.type === "ingreso" ? "+" : "-"}
                  {formatMXN(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--card)" }}>
      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <p className="mt-1.5 text-lg font-medium text-foreground">{formatMXN(value)}</p>
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
      {children}
    </p>
  );
}