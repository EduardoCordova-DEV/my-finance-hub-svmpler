import { useState, type ReactNode } from "react";
import { BottomNav, MobileFrame, SideNav } from "./BottomNav";
import { TransactionSheet } from "./TransactionSheet";
import { RequireAuth } from "./RequireAuth";

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <RequireAuth>
      <SideNav onAdd={() => setOpen(true)} />
      <MobileFrame wide={wide}>{children}</MobileFrame>
      <BottomNav onAdd={() => setOpen(true)} />
      <TransactionSheet open={open} onOpenChange={setOpen} />
    </RequireAuth>
  );
}