import { useState, type ReactNode } from "react";
import { BottomNav, MobileFrame } from "./BottomNav";
import { TransactionSheet } from "./TransactionSheet";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MobileFrame>{children}</MobileFrame>
      <BottomNav onAdd={() => setOpen(true)} />
      <TransactionSheet open={open} onOpenChange={setOpen} />
    </>
  );
}