import {
  Home,
  Car,
  ShoppingBasket,
  Popcorn,
  Zap,
  Repeat,
  MoreHorizontal,
  PawPrint,
  HeartPulse,
  GraduationCap,
  Gift,
  Plane,
  Dumbbell,
  Sofa,
  Laptop,
  Baby,
  Sparkles,
  ShieldCheck,
  PiggyBank,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { useFinance, type CategoryKey, type IconKey } from "@/lib/finance-data";

const ICONS: Record<IconKey, LucideIcon> = {
  vivienda: Home,
  transporte: Car,
  comida: ShoppingBasket,
  ocio: Popcorn,
  servicios: Zap,
  suscripciones: Repeat,
  otros: MoreHorizontal,
  mascota: PawPrint,
  salud: HeartPulse,
  educacion: GraduationCap,
  regalo: Gift,
  viajes: Plane,
  deportes: Dumbbell,
  hogar: Sofa,
  tecnologia: Laptop,
  hijos: Baby,
  belleza: Sparkles,
  seguro: ShieldCheck,
  ahorro: PiggyBank,
  trabajo: Briefcase,
};

export const ICON_OPTIONS: { key: IconKey; label: string }[] = [
  { key: "mascota", label: "Mascota" },
  { key: "salud", label: "Salud" },
  { key: "educacion", label: "Educación" },
  { key: "regalo", label: "Regalo" },
  { key: "viajes", label: "Viajes" },
  { key: "deportes", label: "Deportes" },
  { key: "hogar", label: "Hogar" },
  { key: "tecnologia", label: "Tecnología" },
  { key: "hijos", label: "Hijos" },
  { key: "belleza", label: "Belleza" },
  { key: "seguro", label: "Seguro" },
  { key: "ahorro", label: "Ahorro" },
  { key: "trabajo", label: "Trabajo" },
  { key: "ocio", label: "Ocio" },
  { key: "otros", label: "Otros" },
];

export function IconGlyph({
  icon,
  size = 40,
  iconSize = 20,
  color,
  tint,
}: {
  icon: IconKey;
  size?: number;
  iconSize?: number;
  color: string;
  tint: string;
}) {
  const Icon = ICONS[icon] ?? MoreHorizontal;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: tint }}
    >
      <Icon size={iconSize} color={color} strokeWidth={1.75} />
    </div>
  );
}

export function CategoryIcon({
  category,
  size = 40,
  iconSize = 20,
}: {
  category: CategoryKey;
  size?: number;
  iconSize?: number;
}) {
  const { getCategory } = useFinance();
  const def = getCategory(category);
  return (
    <IconGlyph icon={def.icon} size={size} iconSize={iconSize} color={def.color} tint={def.tint} />
  );
}

export { ICONS as CATEGORY_ICONS };
