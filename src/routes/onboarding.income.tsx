import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useFinance, type PeriodType } from "@/lib/finance-data";

export const Route = createFileRoute("/onboarding/income")({
  head: () => ({
    meta: [{ title: "Ingresos · MyFinance" }],
  }),
  component: IncomePage,
});

function IncomePage() {
  const navigate = useNavigate();
  const { user, setUser } = useFinance();
  const [period, setPeriod] = useState<PeriodType>(user.period);
  const [amount, setAmount] = useState(String(user.income || ""));

  function next() {
    const n = parseFloat(amount.replace(",", "."));
    if (!n) return;
    setUser({ income: n, period });
    navigate({ to: "/onboarding/expenses" });
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-6 py-10">
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Paso 1 de 2
        </p>
        <h1 className="mt-2 text-2xl font-medium text-foreground">Tus ingresos</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          ¿Cada cuánto recibes tu ingreso?
        </p>

        <div
          className="mt-5 grid grid-cols-2 rounded-full p-1"
          style={{ backgroundColor: "var(--card)" }}
        >
          {(["quincenal", "mensual"] as PeriodType[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className="rounded-full py-2.5 text-sm font-medium capitalize transition-colors"
              style={{
                backgroundColor: period === p ? "var(--card-elevated)" : "transparent",
                color: period === p ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Monto {period}
          </p>
          <div className="mt-3 flex items-baseline justify-center gap-1">
            <span className="text-2xl text-muted-foreground">$</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
              placeholder="0.00"
              className="w-full max-w-[240px] bg-transparent text-center text-4xl font-medium text-foreground outline-none placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        <div className="mt-auto pt-10">
          <button
            type="button"
            onClick={next}
            className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition-opacity active:opacity-80"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}