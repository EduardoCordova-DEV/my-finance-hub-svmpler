import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, CalendarDays, PiggyBank } from "lucide-react";
import { AppShell } from "@/components/finance/AppShell";
import { CategoryIcon } from "@/components/finance/CategoryIcon";
import {
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
  const { user, fixedExpenses, transactions, getCategory, savingsContributions } = useFinance();
  const period = periodInfo(user.period);

  const savedThisPeriod = savingsContributions
    .filter((c) => {
      const d = new Date(c.date);
      return d >= period.start && d <= new Date(period.end.getTime() + 86399000);
    })
    .reduce((s, c) => s + c.amount, 0);
  const savingsPct =
    user.savingsTarget > 0
      ? Math.min(100, Math.round((savedThisPeriod / user.savingsTarget) * 100))
      : 0;
  const savingsColor = savingsPct >= 100 ? "#1D9E75" : savingsPct >= 50 ? "#5DCAA5" : "#EF9F27";

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
  const rawDonut = Array.from(catTotals.entries())
    .map(([key, value]) => ({ key, value, def: getCategory(key) }))
    .sort((a, b) => b.value - a.value);
  const donutTotal = rawDonut.reduce((s, d) => s + d.value, 0) || 1;

  // Agrupa las categorías menores al 3% del gasto total bajo "Otros"
  const otrosDef = getCategory("otros");
  const small = rawDonut.filter((d) => d.key !== "otros" && d.value / donutTotal < 0.03);
  const donutData = [
    ...rawDonut.filter((d) => !small.some((s) => s.key === d.key)),
  ];
  if (small.length > 0) {
    const extra = small.reduce((s, d) => s + d.value, 0);
    const existing = donutData.find((d) => d.key === "otros");
    if (existing) existing.value += extra;
    else donutData.push({ key: "otros", value: extra, def: otrosDef });
    donutData.sort((a, b) => b.value - a.value);
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const recent = transactions;

  return (
    <AppShell wide>
      {/* Header */}
      <header className="mb-6 flex items-center justify-between md:mb-8">
        <div>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Hola,
          </p>
          <h1 className="text-lg font-medium text-foreground md:text-2xl">{user.name.split(" ")[0]}</h1>
        </div>
        <Link
          to="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
          style={{ backgroundColor: "var(--card-elevated)", color: "var(--foreground)" }}
        >
          {initials}
        </Link>
      </header>

      <div className="md:grid md:grid-cols-2 md:items-start md:gap-4 lg:grid-cols-3">
      {/* Available card */}
      <section
        className="mb-4 rounded-2xl p-5 md:col-span-2 md:mb-0 md:p-6 lg:col-span-3"
        style={{ backgroundColor: "var(--card)" }}
      >
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Disponible {period.label}
        </p>
        <p className="mt-2 text-[32px] font-medium leading-none text-foreground md:text-[40px]">
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
      <section className="mb-4 grid grid-cols-2 gap-3 md:col-span-2 md:mb-0 lg:col-span-1 lg:grid-cols-1">
        <MiniStat label="Gastos fijos" value={totalFixed} to="/categories" />
        <MiniStat label="Gastos variables" value={totalVariable} />
      </section>

      {/* Ahorros del período */}
      <Link
        to="/savings"
        className="mb-4 block rounded-2xl p-5 md:col-span-2 md:mb-0 md:p-6 lg:col-span-3"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center gap-3">
          <PiggyBank size={20} color="#5DCAA5" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">Ahorros {period.label}</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {formatMXN(savedThisPeriod)} de {formatMXN(user.savingsTarget)}
            </p>
          </div>
          <ChevronRight size={16} color="#7A7A74" />
        </div>
        <div
          className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--card-elevated)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${savingsPct}%`, backgroundColor: savingsColor }}
          />
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          {savingsPct}% de tu meta de ahorro
        </p>
      </Link>

      <Link
        to="/calendar"
        className="mb-4 flex items-center gap-3 rounded-2xl p-4 md:col-span-2 md:mb-0 lg:col-span-3"
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

      {/* Category donut */}
      <section
        className="mb-4 rounded-2xl p-5 md:mb-0 md:p-6 lg:col-span-1"
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
            <div className="h-32 w-32 shrink-0 md:h-40 md:w-40">
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
              {donutData.slice(0, 6).map((d) => (
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
        className="rounded-2xl p-5 md:p-6 lg:col-span-2"
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
          <ul className="max-h-[320px] space-y-3 overflow-y-auto pr-1 md:max-h-[360px]">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <CategoryIcon category={t.category} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{t.name}</p>
                  <p className="text-xs" suppressHydrationWarning style={{ color: "var(--text-tertiary)" }}>
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
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value, to }: { label: string; value: number; to?: "/categories" }) {
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </p>
        {to ? <ChevronRight size={14} color="#7A7A74" /> : null}
      </div>
      <p className="mt-1.5 text-lg font-medium text-foreground">{formatMXN(value)}</p>
    </>
  );
  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-2xl p-4 transition-opacity active:opacity-80"
        style={{ backgroundColor: "var(--card)" }}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--card)" }}>
      {inner}
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