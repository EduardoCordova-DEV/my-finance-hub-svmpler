import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/finance/AppShell";
import { CategoryIcon } from "@/components/finance/CategoryIcon";
import { formatMXN, useFinance } from "@/lib/finance-data";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendario de registros · MyFinance" },
      {
        name: "description",
        content:
          "Visualiza tus gastos día por día en un calendario y compara el total de cada mes con el anterior.",
      },
      { property: "og:title", content: "Calendario de registros · MyFinance" },
      {
        property: "og:description",
        content: "Compara tus gastos mes con mes en el calendario de MyFinance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalendarPage,
});

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function CalendarPage() {
  const { transactions } = useFinance();
  const now = new Date();
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const stats = useMemo(() => {
    const byMonth = new Map<string, { gasto: number; ingreso: number; count: number }>();
    const byDay = new Map<number, { gasto: number; ingreso: number; count: number }>();
    const cursorKey = monthKey(cursor);

    for (const t of transactions) {
      const d = new Date(t.date);
      const mk = monthKey(d);
      const m = byMonth.get(mk) ?? { gasto: 0, ingreso: 0, count: 0 };
      m[t.type] += t.amount;
      m.count += 1;
      byMonth.set(mk, m);

      if (mk === cursorKey) {
        const day = d.getDate();
        const dd = byDay.get(day) ?? { gasto: 0, ingreso: 0, count: 0 };
        dd[t.type] += t.amount;
        dd.count += 1;
        byDay.set(day, dd);
      }
    }
    return { byMonth, byDay };
  }, [transactions, cursor]);

  const current = stats.byMonth.get(monthKey(cursor)) ?? { gasto: 0, ingreso: 0, count: 0 };
  const prevDate = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
  const previous = stats.byMonth.get(monthKey(prevDate)) ?? { gasto: 0, ingreso: 0, count: 0 };
  const diff = current.gasto - previous.gasto;
  const diffPct = previous.gasto > 0 ? Math.round((diff / previous.gasto) * 100) : null;

  const maxDay = Math.max(1, ...Array.from(stats.byDay.values()).map((d) => d.gasto));
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const firstWeekday = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7;

  const dayTx = useMemo(() => {
    if (selectedDay == null) return [];
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return monthKey(d) === monthKey(cursor) && d.getDate() === selectedDay;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, cursor, selectedDay]);

  // Last 6 months comparison bars
  const trend = useMemo(() => {
    const list: { label: string; gasto: number; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
      list.push({
        key: monthKey(d),
        label: MONTHS[d.getMonth()].slice(0, 3),
        gasto: stats.byMonth.get(monthKey(d))?.gasto ?? 0,
      });
    }
    return list;
  }, [cursor, stats]);
  const maxTrend = Math.max(1, ...trend.map((t) => t.gasto));

  function shift(delta: number) {
    setSelectedDay(null);
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-medium text-foreground">Calendario</h1>

      {/* Month switcher */}
      <div className="mb-4 flex items-center justify-between">
        <button type="button" aria-label="Mes anterior" onClick={() => shift(-1)} className="p-2">
          <ChevronLeft size={18} color="#A3A29C" />
        </button>
        <p className="text-sm font-medium capitalize text-foreground">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <button type="button" aria-label="Mes siguiente" onClick={() => shift(1)} className="p-2">
          <ChevronRight size={18} color="#A3A29C" />
        </button>
      </div>

      {/* Month summary + comparison */}
      <section className="mb-4 rounded-2xl p-5" style={{ backgroundColor: "var(--card)" }}>
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Gasto del mes
        </p>
        <p className="mt-2 text-[28px] font-medium leading-none text-foreground">
          {formatMXN(current.gasto)}
        </p>
        <p className="mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          {previous.count === 0 && previous.gasto === 0 ? (
            <>Sin registros en {MONTHS[prevDate.getMonth()]} para comparar</>
          ) : (
            <>
              <span style={{ color: diff > 0 ? "#E24B4A" : "#1D9E75" }}>
                {diff > 0 ? "+" : ""}
                {formatMXN(diff)}
                {diffPct !== null ? ` (${diff > 0 ? "+" : ""}${diffPct}%)` : ""}
              </span>{" "}
              vs {MONTHS[prevDate.getMonth()]}
            </>
          )}
        </p>
        <div className="mt-4 flex justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>{current.count} registros</span>
          <span style={{ color: "#639922" }}>+{formatMXN(current.ingreso)} ingresos</span>
        </div>
      </section>

      {/* Calendar grid */}
      <section className="mb-4 rounded-2xl p-4" style={{ backgroundColor: "var(--card)" }}>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          {WEEKDAYS.map((w, i) => (
            <span key={`${w}-${i}`}>{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const d = stats.byDay.get(day);
            const intensity = d ? 0.18 + 0.82 * (d.gasto / maxDay) : 0;
            const selected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(selected ? null : day)}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border text-[11px] transition-colors"
                style={{
                  backgroundColor: d
                    ? `color-mix(in srgb, #1D9E75 ${Math.round(intensity * 100)}%, var(--card-elevated))`
                    : "var(--card-elevated)",
                  borderColor: selected ? "#1D9E75" : "transparent",
                  color: d ? "var(--foreground)" : "var(--text-tertiary)",
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          Tonos más intensos = mayor gasto ese día
        </p>
      </section>

      {/* Day detail */}
      {selectedDay != null ? (
        <section className="mb-4 rounded-2xl p-4" style={{ backgroundColor: "var(--card)" }}>
          <h2 className="mb-3 text-sm font-medium text-foreground">
            {selectedDay} de {MONTHS[cursor.getMonth()]}
          </h2>
          {dayTx.length === 0 ? (
            <p className="py-4 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
              Sin movimientos este día
            </p>
          ) : (
            <ul className="space-y-3">
              {dayTx.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <CategoryIcon category={t.category} size={32} iconSize={16} />
                  <p className="min-w-0 flex-1 truncate text-sm text-foreground">{t.name}</p>
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
      ) : null}

      {/* 6-month trend */}
      <section className="rounded-2xl p-5" style={{ backgroundColor: "var(--card)" }}>
        <h2 className="mb-4 text-sm font-medium text-foreground">Comparativa por mes</h2>
        <div className="flex h-32 items-end gap-2">
          {trend.map((m) => (
            <div key={m.key} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(3, (m.gasto / maxTrend) * 100)}%`,
                    backgroundColor: m.key === monthKey(cursor) ? "#1D9E75" : "var(--card-elevated)",
                  }}
                />
              </div>
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
