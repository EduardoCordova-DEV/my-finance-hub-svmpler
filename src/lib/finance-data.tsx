import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CategoryKey = string;

export type IconKey =
  | "vivienda"
  | "transporte"
  | "comida"
  | "ocio"
  | "servicios"
  | "suscripciones"
  | "otros"
  | "mascota"
  | "salud"
  | "educacion"
  | "regalo"
  | "viajes"
  | "deportes"
  | "hogar"
  | "tecnologia"
  | "hijos"
  | "belleza"
  | "seguro"
  | "ahorro"
  | "trabajo";

export interface CategoryDef {
  key: CategoryKey;
  name: string;
  color: string;
  tint: string;
  icon: IconKey;
  custom?: boolean;
}

/** Colores sugeridos para categorías personalizadas (no usados por las base). */
export const CUSTOM_COLORS = [
  "#C9509E",
  "#4FA8E8",
  "#8AC249",
  "#E8B84B",
  "#E8654B",
  "#6FCF97",
  "#B084E8",
  "#E894B8",
];

/** Genera un tinte oscuro/desaturado a partir del color base. */
export function tintFromColor(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const lum = (r + g + b) / 3;
  const mix = (c: number) => Math.round(Math.max(0, Math.min(255, (c * 0.75 + lum * 0.25) * 0.33)));
  return (
    "#" +
    [mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}

const BASE_CATEGORIES: CategoryDef[] = [
  { key: "vivienda", name: "Vivienda", color: "#D4537E", tint: "#4B1528", icon: "vivienda" },
  { key: "transporte", name: "Transporte", color: "#7F77DD", tint: "#26215C", icon: "transporte" },
  { key: "comida", name: "Comida", color: "#EF9F27", tint: "#412402", icon: "comida" },
  { key: "ocio", name: "Ocio", color: "#5DCAA5", tint: "#04342C", icon: "ocio" },
  { key: "servicios", name: "Servicios", color: "#378ADD", tint: "#042C53", icon: "servicios" },
  {
    key: "suscripciones",
    name: "Suscripciones",
    color: "#D85A30",
    tint: "#4A1B0C",
    icon: "suscripciones",
  },
  { key: "otros", name: "Otros", color: "#888780", tint: "#2C2C2A", icon: "otros" },
];

const MOCK_CUSTOM: CategoryDef[] = [
  {
    key: "mascota",
    name: "Mascota",
    color: "#8AC249",
    tint: tintFromColor("#8AC249"),
    icon: "mascota",
    custom: true,
  },
];

export const DEFAULT_CATEGORIES: CategoryDef[] = [...BASE_CATEGORIES, ...MOCK_CUSTOM];

/** Fallback estático (solo para lecturas fuera del provider). */
export const CATEGORIES: Record<CategoryKey, CategoryDef> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.key, c]),
);

export const CATEGORY_LIST: CategoryDef[] = DEFAULT_CATEGORIES;

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
  /** Meta de ahorro por período (quincenal o mensual). */
  savingsTarget: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  color: string;
  icon: IconKey;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string; // ISO
}

interface FinanceState {
  user: UserProfile;
  fixedExpenses: FixedExpense[];
  transactions: Transaction[];
  categories: CategoryDef[];
  categoryMap: Record<CategoryKey, CategoryDef>;
  savingsGoals: SavingsGoal[];
  savingsContributions: SavingsContribution[];
  savedForGoal: (goalId: string) => number;
  getCategory: (key: CategoryKey) => CategoryDef;
  addCategory: (c: { name: string; color: string; icon: IconKey }) => CategoryKey;
  updateCategory: (key: CategoryKey, c: { name: string; color: string; icon: IconKey }) => void;
  deleteCategory: (key: CategoryKey) => void;
  setUser: (u: Partial<UserProfile>) => void;
  setFixedExpenses: (list: FixedExpense[]) => void;
  addTransaction: (t: Omit<Transaction, "id" | "date"> & { date?: string }) => void;
  addGoal: (g: Omit<SavingsGoal, "id">) => string;
  updateGoal: (id: string, g: Omit<SavingsGoal, "id">) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number, date?: string) => void;
  deleteContribution: (id: string) => void;
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
  { id: "t7", type: "gasto", name: "Croquetas Firulais", category: "mascota", amount: 420, date: today(1) },
  { id: "t8", type: "gasto", name: "Veterinario", category: "mascota", amount: 650, date: today(3) },
  // Meses anteriores (para el calendario y la comparativa mensual)
  { id: "p1", type: "gasto", name: "Renta", category: "vivienda", amount: 4000, date: today(32) },
  { id: "p2", type: "gasto", name: "Despensa mensual", category: "comida", amount: 1420, date: today(34) },
  { id: "p3", type: "gasto", name: "Gasolina", category: "transporte", amount: 780, date: today(38) },
  { id: "p4", type: "gasto", name: "Estética Firulais", category: "mascota", amount: 350, date: today(40) },
  { id: "p5", type: "ingreso", name: "Sueldo", category: "otros", amount: 8500, date: today(45) },
  { id: "p6", type: "gasto", name: "Renta", category: "vivienda", amount: 4000, date: today(62) },
  { id: "p7", type: "gasto", name: "Concierto", category: "ocio", amount: 1250, date: today(66) },
  { id: "p8", type: "gasto", name: "Súper", category: "comida", amount: 990, date: today(70) },
  { id: "p9", type: "gasto", name: "Internet", category: "servicios", amount: 499, date: today(73) },
];

const FinanceCtx = createContext<FinanceState | null>(null);

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "cat"
  );
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile>({
    name: "Alex Ramírez",
    email: "alex@ejemplo.com",
    income: 8500,
    period: "quincenal",
    savingsTarget: 1000,
  });
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(initialFixed);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTx);
  const [categories, setCategories] = useState<CategoryDef[]>(DEFAULT_CATEGORIES);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialGoals);
  const [savingsContributions, setSavingsContributions] =
    useState<SavingsContribution[]>(initialContributions);

  const value = useMemo<FinanceState>(() => {
    const categoryMap = Object.fromEntries(categories.map((c) => [c.key, c])) as Record<
      CategoryKey,
      CategoryDef
    >;
    const fallback: CategoryDef = categoryMap["otros"] ?? BASE_CATEGORIES[6];

    return {
      user,
      fixedExpenses,
      transactions,
      categories,
      categoryMap,
      getCategory: (key) => categoryMap[key] ?? fallback,
      addCategory: ({ name, color, icon }) => {
        const base = slugify(name);
        let key = base;
        let i = 2;
        while (categories.some((c) => c.key === key)) key = `${base}-${i++}`;
        setCategories((prev) => [
          ...prev,
          { key, name, color, tint: tintFromColor(color), icon, custom: true },
        ]);
        return key;
      },
      updateCategory: (key, { name, color, icon }) =>
        setCategories((prev) =>
          prev.map((c) =>
            c.key === key ? { ...c, name, color, tint: tintFromColor(color), icon } : c,
          ),
        ),
      deleteCategory: (key) => {
        setCategories((prev) => prev.filter((c) => c.key !== key));
        setTransactions((prev) =>
          prev.map((t) => (t.category === key ? { ...t, category: "otros" } : t)),
        );
        setFixedExpenses((prev) =>
          prev.map((f) => (f.category === key ? { ...f, category: "otros" } : f)),
        );
      },
      setUser: (u) => setUserState((prev) => ({ ...prev, ...u })),
      setFixedExpenses,
      addTransaction: (t) =>
        setTransactions((prev) => [
          { id: Math.random().toString(36).slice(2), date: t.date ?? new Date().toISOString(), ...t },
          ...prev,
        ]),
    };
  }, [user, fixedExpenses, transactions, categories]);

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
