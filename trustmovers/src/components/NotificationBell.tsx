"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, Truck, BadgeCheck, Star, X } from "lucide-react";
import { useMove } from "@/context/MoveContext";
import type { NotificationType } from "@/context/MoveContext";

function NotifIcon({ type }: { type: NotificationType }) {
  if (type === "estimate") return <BadgeCheck className="w-4 h-4 text-blue-500" />;
  if (type === "status") return <Truck className="w-4 h-4 text-amber-500" />;
  if (type === "photo") return <Star className="w-4 h-4 text-purple-500" />;
  return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useMove();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open) markAllRead();
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative w-8 h-8 flex items-center justify-center rounded-full bg-navy-800 hover:bg-navy-700 transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4 text-white" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-0.5"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
            className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="font-semibold text-navy-900 text-sm">Notifications</p>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No notifications yet</p>
                <p className="text-slate-300 text-xs mt-1">
                  Updates appear here as your move progresses.
                </p>
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <NotifIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-900 leading-snug">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
