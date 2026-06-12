"use client";

import { MoveProvider } from "@/context/MoveContext";
import { ToastManager } from "@/components/ToastManager";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MoveProvider>
      {children}
      <ToastManager />
    </MoveProvider>
  );
}
