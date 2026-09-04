import { Link, useRouterState } from "@tanstack/react-router";
import { Home, List, Plus, LayoutGrid, User, CalendarDays } from "lucide-react";
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
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 md:hidden">
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

const SIDE_TABS: TabDef[] = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/history", label: "Historial", Icon: List },
  { to: "/calendar", label: "Calendario", Icon: CalendarDays },
  { to: "/categories", label: "Categorías", Icon: LayoutGrid },
  { to: "/profile", label: "Perfil", Icon: User },
];

export function SideNav({ onAdd }: { onAdd: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[88px] flex-col gap-2 px-3 py-8 md:flex lg:w-[232px] lg:px-4"
      style={{ backgroundColor: "var(--card)" }}
    >
      <p className="mb-4 hidden px-2 text-sm font-medium text-foreground lg:block">MyFinance</p>
      <span
        className="mb-4 mx-auto text-sm font-medium text-foreground lg:hidden"
        aria-hidden="true"
      >
        MF
      </span>
      {SIDE_TABS.map((t) => {
        const active = pathname === t.to;
        return (
          <Link
            key={t.to}
            to={t.to}
            aria-label={t.label}
            className="flex items-center justify-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors lg:justify-start"
            style={{
              backgroundColor: active ? "var(--card-elevated)" : "transparent",
              color: active ? "#1D9E75" : "var(--muted-foreground)",
            }}
          >
            <t.Icon size={20} strokeWidth={1.75} />
            <span className="hidden lg:inline">{t.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onAdd}
        className="mt-auto flex items-center justify-center gap-2 rounded-full bg-white px-3 py-3 text-sm font-medium text-black transition-transform active:scale-95 lg:justify-start lg:px-4"
        aria-label="Agregar movimiento"
      >
        <Plus size={20} strokeWidth={2.25} />
        <span className="hidden lg:inline">Agregar</span>
      </button>
    </aside>
  );
}

export function MobileFrame({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen w-full bg-background md:pl-[88px] lg:pl-[232px]">
      <div
        className={`mx-auto min-h-screen w-full px-5 pb-32 pt-8 md:px-8 md:pb-12 md:pt-10 ${
          wide ? "max-w-[420px] md:max-w-[900px] lg:max-w-[1180px]" : "max-w-[420px] md:max-w-[720px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}