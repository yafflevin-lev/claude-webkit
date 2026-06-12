"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { useMove } from "@/context/MoveContext";

const INVOICE_LINES = [
  { label: "Labor & crew (3 movers)", amount: 280 },
  { label: "Truck & mileage", amount: 75 },
  { label: "Packing materials", amount: 75 },
  { label: "Deposit paid", amount: -150 },
];
const BALANCE_DUE = 430;

interface PaymentSheetProps {
  onClose: () => void;
}

export function PaymentSheet({ onClose }: PaymentSheetProps) {
  const { move, processPayment } = useMove();
  const [stage, setStage] = useState<"form" | "processing" | "success">("form");

  function handlePay() {
    setStage("processing");
    processPayment();
    setTimeout(() => setStage("success"), 2000);
  }

  const cardholderName = move.clientName || "Demo Customer";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={stage === "form" ? onClose : undefined}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-w-lg mx-auto overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {stage === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5"
            >
              {/* Handle + header */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading font-bold text-navy-900 text-lg">Pay Balance</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Secured by TrustMovers Pay</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Invoice summary */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2">
                {INVOICE_LINES.map((line) => (
                  <div key={line.label} className="flex items-center justify-between">
                    <span className={`text-sm ${line.amount < 0 ? "text-emerald-700" : "text-slate-600"}`}>
                      {line.label}
                    </span>
                    <span className={`text-sm font-semibold ${line.amount < 0 ? "text-emerald-700" : "text-slate-800"}`}>
                      {line.amount < 0 ? `−$${Math.abs(line.amount)}` : `$${line.amount}`}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-navy-900">Balance due</span>
                  <span className="text-base font-bold text-navy-900">${BALANCE_DUE}</span>
                </div>
              </div>

              {/* Mock card form */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Card number
                  </label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-amber-400 transition-colors">
                    <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      defaultValue="4242 4242 4242 4242"
                      className="flex-1 text-sm text-slate-800 outline-none bg-transparent font-mono"
                      readOnly
                    />
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">VISA</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Expiry
                    </label>
                    <input
                      type="text"
                      defaultValue="12 / 28"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none font-mono focus:border-amber-400 transition-colors bg-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      CVV
                    </label>
                    <input
                      type="text"
                      defaultValue="•••"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none font-mono focus:border-amber-400 transition-colors bg-white"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Cardholder name
                  </label>
                  <input
                    type="text"
                    defaultValue={cardholderName}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-400 transition-colors bg-white"
                    readOnly
                  />
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                className="w-full bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-heading font-bold text-base py-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Pay ${BALANCE_DUE}.00
              </button>

              <p className="text-center text-[11px] text-slate-400 mt-3">
                Payments are encrypted and processed securely. Demo only — no real charge.
              </p>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-5"
              >
                <Loader2 className="w-10 h-10 text-amber-500" />
              </motion.div>
              <p className="font-heading font-bold text-navy-900 text-lg mb-1">Processing</p>
              <p className="text-slate-500 text-sm">Confirming your payment…</p>
            </motion.div>
          )}

          {stage === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="p-8 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </motion.div>

              <h3 className="font-heading font-bold text-navy-900 text-xl mb-1">Payment Received</h3>
              <p className="text-slate-500 text-sm mb-1">
                ${BALANCE_DUE}.00 charged to Visa •••• 4242
              </p>
              <p className="text-xs text-slate-400 mb-6">A receipt has been saved to your account.</p>

              <div className="w-full bg-slate-50 rounded-2xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-semibold text-navy-900">${BALANCE_DUE}.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Method</span>
                  <span className="font-semibold text-navy-900">Visa •••• 4242</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Move total</span>
                  <span className="font-semibold text-navy-900">$580.00</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-heading font-bold py-3.5 rounded-2xl cursor-pointer transition-all"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
