"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Truck, BadgeCheck, X } from "lucide-react";
import { useMove } from "@/context/MoveContext";
import type { NotificationEntry, NotificationType } from "@/context/MoveContext";

function ToastIcon({ type }: { type: NotificationType }) {
  if (type === "estimate") return <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />;
  if (type === "status") return <Truck className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
}

interface ToastItem extends NotificationEntry {
  visible: boolean;
}

export function ToastManager() {
  const { notifications } = useMove();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    const newest = notifications[0];
    if (!newest || seenIds.current.has(newest.id)) return;
    seenIds.current.add(newest.id);

    const toast: ToastItem = { ...newest, visible: true };
    setToasts((prev) => [toast, ...prev].slice(0, 3));

    const timer = setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === toast.id ? { ...t, visible: false } : t))
      );
    }, 4000);

    return () => clearTimeout(timer);
  }, [notifications]);

  function dismiss(id: string) {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
  }

  const visible = toasts.filter((t) => t.visible);

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: "calc(100vw - 2rem)", left: "auto" }}
    >
      <AnimatePresence mode="popLayout">
        {visible.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 64, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 64, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
            className="pointer-events-auto bg-white rounded-2xl shadow-lg border border-slate-200 px-4 py-3 flex items-start gap-3 w-64 sm:w-72"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center mt-0.5 flex-shrink-0">
              <ToastIcon type={toast.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy-900 leading-snug">{toast.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5 cursor-pointer flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
