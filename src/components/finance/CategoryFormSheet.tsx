import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  CUSTOM_COLORS,
  tintFromColor,
  useFinance,
  type CategoryDef,
  type IconKey,
} from "@/lib/finance-data";
import { ICON_OPTIONS, IconGlyph } from "./CategoryIcon";

export function CategoryFormSheet({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: CategoryDef | null;
  onSaved?: (key: string) => void;
}) {
  const { addCategory, updateCategory } = useFinance();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [icon, setIcon] = useState<IconKey>("otros");

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setColor(editing?.color ?? null);
    setIcon(editing?.icon ?? "otros");
  }, [open, editing]);

  const valid = name.trim().length > 0 && !!color;
  const previewColor = color ?? "#7A7A74";
  const previewTint = tintFromColor(previewColor);

  function save() {
    if (!valid || !color) return;
    if (editing) {
      updateCategory(editing.key, { name: name.trim(), color, icon });
      onSaved?.(editing.key);
    } else {
      const key = addCategory({ name: name.trim(), color, icon });
      onSaved?.(key);
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92vh] max-w-[420px] overflow-y-auto rounded-t-3xl border-t p-6"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <SheetHeader className="mb-4 items-center">
          <div className="mb-2 h-1 w-10 rounded-full" style={{ backgroundColor: "var(--border)" }} />
          <SheetTitle className="text-base font-medium text-foreground">
            {editing ? "Editar categoría" : "Crear categoría"}
          </SheetTitle>
        </SheetHeader>

        {/* Live preview */}
        <div className="mb-5 flex justify-center">
          <div
            className="flex items-center gap-2.5 rounded-full border px-3 py-2"
            style={{ backgroundColor: previewTint, borderColor: previewColor }}
          >
            <IconGlyph icon={icon} size={28} iconSize={15} color={previewColor} tint="transparent" />
            <span className="pr-1 text-sm font-medium text-foreground">
              {name.trim() || "Nueva categoría"}
            </span>
          </div>
        </div>

        {/* Name */}
        <div className="mb-5">
          <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Nombre de la categoría
          </div>
          <input
            maxLength={20}
            placeholder="Ej. Mascota"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            className="w-full rounded-2xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            style={{ backgroundColor: "var(--card-elevated)" }}
          />
          <p className="mt-1.5 text-right text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {name.length}/20
          </p>
        </div>

        {/* Colors */}
        <div className="mb-5">
          <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Color
          </div>
          <div className="flex flex-wrap gap-3">
            {CUSTOM_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-95"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid var(--foreground)` : "none",
                  outlineOffset: 2,
                }}
              >
                {color === c ? <Check size={16} color="#141414" strokeWidth={2.5} /> : null}
              </button>
            ))}
          </div>
        </div>

        {/* Icons */}
        <div className="mb-6">
          <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Ícono
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ICON_OPTIONS.map((o) => {
              const selected = icon === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setIcon(o.key)}
                  className="flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-left transition-colors"
                  style={{
                    backgroundColor: selected ? previewTint : "var(--card-elevated)",
                    borderColor: selected ? previewColor : "transparent",
                  }}
                >
                  <IconGlyph
                    icon={o.key}
                    size={24}
                    iconSize={14}
                    color={selected ? previewColor : "#A3A29C"}
                    tint="transparent"
                  />
                  <span className="truncate text-[11px] text-foreground">{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={!valid}
          className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition-opacity active:opacity-80 disabled:opacity-30"
        >
          Guardar categoría
        </button>
      </SheetContent>
    </Sheet>
  );
}
