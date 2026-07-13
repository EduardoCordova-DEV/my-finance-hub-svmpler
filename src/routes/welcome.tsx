import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useFinance } from "@/lib/finance-data";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Bienvenido · MyFinance" },
      { name: "description", content: "Bienvenido a MyFinance." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const { user } = useFinance();
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-6 py-12 text-center">
        <div
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-3xl text-2xl font-medium"
          style={{ backgroundColor: "#1D9E75", color: "#0B0B0D" }}
        >
          $
        </div>
        <h1 className="text-2xl font-medium text-foreground">
          Bienvenido, {user.name.split(" ")[0]}
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm" style={{ color: "var(--muted-foreground)" }}>
          Vamos a configurar tus finanzas en dos pasos rápidos. Empezaremos por tus ingresos.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/onboarding/income" })}
          className="mx-auto mt-10 w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition-opacity active:opacity-80"
        >
          Empezar
        </button>
      </div>
    </div>
  );
}