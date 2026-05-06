"use client";

import { MoveProvider } from "@/context/MoveContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <MoveProvider>{children}</MoveProvider>;
}
