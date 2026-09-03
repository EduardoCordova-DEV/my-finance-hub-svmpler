import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/finance/AppShell";
import { CategoryIcon } from "@/components/finance/CategoryIcon";
import {
  formatMXN,
  relativeDate,
  useFinance,
  type CategoryKey,
} from "@/lib/finance-data";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Historial de movimientos · MyFinance" },
      {
        name: "description",
        content: "Consulta todos tus movimientos y fíltralos por categoría, incluidas las personalizadas.",
      },
      { property: "og:title", content: "Historial de movimientos · MyFinance" },
      {
        property: "og:description",
        content: "Filtra tus gastos e ingresos por categoría en MyFinance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: History,
});

function History() {
  const { transactions, categories } = useFinance();
  const [filter, setFilter] = useState<CategoryKey | "todas">("todas");

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => filter === "todas" || t.category === filter)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filter]);

  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-medium text-foreground">Historial</h1>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Chip active={filter === "todas"} onClick={() => setFilter("todas")}>
          Todas
        </Chip>
        {categories.map((c) => (
          <Chip key={c.key} active={filter === c.key} onClick={() => setFilter(c.key)} color={c.color}>
            {c.name}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p
          className="mt-16 text-center text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          Aún no tienes movimientos en esta categoría
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-2xl px-3 py-3"
              style={{ backgroundColor: "var(--card)" }}
            >
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
    </AppShell>
  );
}

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
      style={{
        backgroundColor: active ? "var(--card-elevated)" : "transparent",
        borderColor: active ? (color ?? "#1D9E75") : "var(--border)",
        color: active ? "var(--foreground)" : "var(--muted-foreground)",
      }}
    >
      {children}
    </button>
  );
}