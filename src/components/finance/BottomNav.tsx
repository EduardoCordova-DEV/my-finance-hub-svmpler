import { Link, useRouterState } from "@tanstack/react-router";
import { Home, List, Plus, LayoutGrid, User } from "lucide-react";
import type { ReactNode } from "react";

interface TabDef {
  to: string;
  label: string;
  Icon: typeof Home;
}

const TABS_LEFT: TabDef[] = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/history", label: "Historial", Icon: List },
];
const TABS_RIGHT: TabDef[] = [
  { to: "/categories", label: "Categorías", Icon: LayoutGrid },
  { to: "/profile", label: "Perfil", Icon: User },
];

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <div
        className="grid w-full max-w-[420px] grid-cols-5 items-center rounded-full border px-3 py-2"
        style={{ backgroundColor: "var(--card-elevated)", borderColor: "var(--border)" }}
      >
        {TABS_LEFT.map((t) => (
          <TabButton key={t.to} tab={t} active={pathname === t.to} />
        ))}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onAdd}
            aria-label="Agregar movimiento"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-sm transition-transform active:scale-95"
          >
            <Plus size={22} strokeWidth={2.25} />
          </button>
        </div>
        {TABS_RIGHT.map((t) => (
          <TabButton key={t.to} tab={t} active={pathname === t.to} />
        ))}
      </div>
    </nav>
  );
}

function TabButton({ tab, active }: { tab: TabDef; active: boolean }) {
  const color = active ? "#1D9E75" : "#7A7A74";
  return (
    <Link
      to={tab.to}
      className="flex flex-col items-center justify-center gap-0.5 py-1"
      aria-label={tab.label}
    >
      <tab.Icon size={22} color={color} strokeWidth={1.75} />
    </Link>
  );
}

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto min-h-screen w-full max-w-[420px] px-5 pb-32 pt-8">{children}</div>
    </div>
  );
}