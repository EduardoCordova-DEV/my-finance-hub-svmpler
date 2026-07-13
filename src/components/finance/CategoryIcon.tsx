import {
  Home,
  Car,
  ShoppingBasket,
  Popcorn,
  Zap,
  Repeat,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, type CategoryKey } from "@/lib/finance-data";

const ICONS: Record<CategoryKey, LucideIcon> = {
  vivienda: Home,
  transporte: Car,
  comida: ShoppingBasket,
  ocio: Popcorn,
  servicios: Zap,
  suscripciones: Repeat,
  otros: MoreHorizontal,
};

export function CategoryIcon({
  category,
  size = 40,
  iconSize = 20,
}: {
  category: CategoryKey;
  size?: number;
  iconSize?: number;
}) {
  const def = CATEGORIES[category];
  const Icon = ICONS[category];
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: def.tint }}
    >
      <Icon size={iconSize} color={def.color} strokeWidth={1.75} />
    </div>
  );
}

export { ICONS as CATEGORY_ICONS };