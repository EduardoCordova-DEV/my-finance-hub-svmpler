import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CategoryKey =
  | "vivienda"
  | "transporte"
  | "comida"
  | "ocio"
  | "servicios"
  | "suscripciones"
  | "otros";

export interface CategoryDef {
  key: CategoryKey;
  name: string;
  color: string;
  tint: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryDef> = {
  vivienda: { key: "vivienda", name: "Vivienda", color: "#D4537E", tint: "#4B1528" },
  transporte: { key: "transporte", name: "Transporte", color: "#7F77DD", tint: "#26215C" },
  comida: { key: "comida", name: "Comida", color: "#EF9F27", tint: "#412402" },
  ocio: { key: "ocio", name: "Ocio", color: "#5DCAA5", tint: "#04342C" },
  servicios: { key: "servicios", name: "Servicios", color: "#378ADD", tint: "#042C53" },
  suscripciones: { key: "suscripciones", name: "Suscripciones", color: "#D85A30", tint: "#4A1B0C" },
  otros: { key: "otros", name: "Otros", color: "#888780", tint: "#2C2C2A" },
};

export const CATEGORY_LIST: CategoryDef[] = Object.values(CATEGORIES);

export type PeriodType = "quincenal" | "mensual";

export interface FixedExpense {
  id: string;
  name: string;
  category: CategoryKey;
  amount: number;
  dueDay?: number;
}

export interface Transaction {
  id: string;
  type: "gasto" | "ingreso";
  name: string;
  category: CategoryKey;
  amount: number;
  note?: string;
  date: string; // ISO
}

export interface UserProfile {
  name: string;
  email: string;
  income: number;
  period: PeriodType;
}

interface FinanceState {
  user: UserProfile;
  fixedExpenses: FixedExpense[];
  transactions: Transaction[];
  setUser: (u: Partial<UserProfile>) => void;
  setFixedExpenses: (list: FixedExpense[]) => void;
  addTransaction: (t: Omit<Transaction, "id" | "date"> & { date?: string }) => void;
}

const initialFixed: FixedExpense[] = [
  { id: "f1", name: "Renta", category: "vivienda", amount: 4000, dueDay: 1 },
  { id: "f2", name: "Luz (CFE)", category: "servicios", amount: 350, dueDay: 10 },
  { id: "f3", name: "Gas", category: "servicios", amount: 200, dueDay: 15 },
  { id: "f4", name: "Agua", category: "servicios", amount: 150, dueDay: 20 },
  { id: "f5", name: "Transporte", category: "transporte", amount: 800 },
  { id: "f6", name: "Despensa", category: "comida", amount: 1200 },
  { id: "f7", name: "Plan celular", category: "servicios", amount: 299, dueDay: 5 },
  { id: "f8", name: "Netflix", category: "suscripciones", amount: 199 },
  { id: "f9", name: "Spotify", category: "suscripciones", amount: 115 },
];

function today(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString();
}

const initialTx: Transaction[] = [
  { id: "t1", type: "gasto", name: "Café de la esquina", category: "comida", amount: 68, date: today(0) },
  { id: "t2", type: "gasto", name: "Uber al centro", category: "transporte", amount: 142, date: today(0) },
  { id: "t3", type: "gasto", name: "Cine con Ana", category: "ocio", amount: 240, date: today(1) },
  { id: "t4", type: "gasto", name: "Súper Chedraui", category: "comida", amount: 587, date: today(2) },
  { id: "t5", type: "gasto", name: "Spotify", category: "suscripciones", amount: 115, date: today(3) },
  { id: "t6", type: "ingreso", name: "Freelance diseño", category: "otros", amount: 1500, date: today(4) },
];

const FinanceCtx = createContext<FinanceState | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile>({
    name: "Alex Ramírez",
    email: "alex@ejemplo.com",
    income: 8500,
    period: "quincenal",
  });
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(initialFixed);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTx);

  const value = useMemo<FinanceState>(
    () => ({
      user,
      fixedExpenses,
      transactions,
      setUser: (u) => setUserState((prev) => ({ ...prev, ...u })),
      setFixedExpenses,
      addTransaction: (t) =>
        setTransactions((prev) => [
          { id: Math.random().toString(36).slice(2), date: t.date ?? new Date().toISOString(), ...t },
          ...prev,
        ]),
    }),
    [user, fixedExpenses, transactions],
  );

  return <FinanceCtx.Provider value={value}>{children}</FinanceCtx.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceCtx);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}

export function formatMXN(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function relativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export function periodInfo(period: PeriodType) {
  const now = new Date();
  const day = now.getDate();
  if (period === "quincenal") {
    const isFirst = day <= 15;
    const start = new Date(now.getFullYear(), now.getMonth(), isFirst ? 1 : 16);
    const end = isFirst
      ? new Date(now.getFullYear(), now.getMonth(), 15)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const total = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    const remaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
    return { start, end, total, remaining, label: "esta quincena" };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const total = end.getDate();
  const remaining = total - day;
  return { start, end, total, remaining, label: "este mes" };
}