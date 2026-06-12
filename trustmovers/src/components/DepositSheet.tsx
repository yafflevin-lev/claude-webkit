"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Lock, CheckCircle2, Loader2, Copy, Check } from "lucide-react";
import { useMove } from "@/context/MoveContext";

const DEPOSIT_AMOUNT = 150;
const TOTAL_AMOUNT = 580;

interface DepositSheetProps {
  onClose: () => void;
}

export function DepositSheet({ onClose }: DepositSheetProps) {
  const { move, payDeposit } = useMove();
  const [stage, setStage] = useState<"form" | "processing" | "success">("form");
  const [copied, setCopied] = useState(false);

  const cardholderName = move.clientName || "Demo Customer";
  const paymentLink = `https://pay.trustmovers.com/deposit/${move.clientName?.toLowerCase().replace(/\s+/g, "-") || "demo"}`;

  function handlePay() {
    setStage("processing");
    setTimeout(() => {
      payDeposit();
      setStage("success");
    }, 2000);
  }

  function handleCopyLink() {
    navigator.clipboard?.writeText(paymentLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={stage === "form" ? onClose : undefined}
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-w-lg mx-auto overflow-hidden"
      >
        <AnimatePresence mode="wait">

          {/* ---- Form ---- */}
          {stage === "form" && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading font-bold text-navy-900 text-lg">Pay Deposit</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Secures your move date</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Deposit summary */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Move deposit</span>
                  <span className="font-semibold text-slate-800">${DEPOSIT_AMOUNT}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Remaining on move day</span>
                  <span className="text-slate-500">${TOTAL_AMOUNT - DEPOSIT_AMOUNT}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-sm font-bold text-navy-900">Due now</span>
                  <span className="text-base font-bold text-navy-900">${DEPOSIT_AMOUNT}</span>
                </div>
              </div>

              {/* Card form */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Card number</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-amber-400 transition-colors">
                    <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input type="text" defaultValue="4242 4242 4242 4242" className="flex-1 text-sm text-slate-800 outline-none bg-transparent font-mono" readOnly />
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">VISA</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry</label>
                    <input type="text" defaultValue="12 / 28" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none font-mono focus:border-amber-400 bg-white" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">CVV</label>
                    <input type="text" defaultValue="•••" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none font-mono focus:border-amber-400 bg-white" readOnly />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cardholder name</label>
                  <input type="text" defaultValue={cardholderName} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-400 bg-white" readOnly />
                </div>
              </div>

              <button
                onClick={handlePay}
                className="w-full bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-heading font-bold text-base py-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 mb-3"
              >
                <Lock className="w-4 h-4" />
                Pay ${DEPOSIT_AMOUNT} Deposit
              </button>

              {/* Or share link */}
              <div className="relative flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 flex-shrink-0">or share payment link</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 cursor-pointer transition-all"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-slate-700 mb-0.5">Deposit payment link</p>
                  <p className="text-xs text-slate-400 truncate">{paymentLink}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold flex-shrink-0 transition-colors ${copied ? "text-emerald-600" : "text-navy-700"}`}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </div>
              </button>

              <p className="text-center text-[11px] text-slate-400 mt-3">
                Demo only — no real charge. Payments encrypted and secure.
              </p>
            </motion.div>
          )}

          {/* ---- Processing ---- */}
          {stage === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 flex flex-col items-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mb-5">
                <Loader2 className="w-10 h-10 text-amber-500" />
              </motion.div>
              <p className="font-heading font-bold text-navy-900 text-lg mb-1">Processing</p>
              <p className="text-slate-500 text-sm">Confirming your deposit…</p>
            </motion.div>
          )}

          {/* ---- Success ---- */}
          {stage === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }} className="p-8 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <h3 className="font-heading font-bold text-navy-900 text-xl mb-1">Deposit Confirmed</h3>
              <p className="text-slate-500 text-sm mb-1">${DEPOSIT_AMOUNT} charged · Your move date is locked in.</p>
              <p className="text-xs text-slate-400 mb-6">Remaining balance of ${TOTAL_AMOUNT - DEPOSIT_AMOUNT} due on move day.</p>

              <div className="w-full bg-slate-50 rounded-2xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Deposit</span>
                  <span className="font-semibold text-navy-900">${DEPOSIT_AMOUNT}.00 paid</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Method</span>
                  <span className="font-semibold text-navy-900">Visa •••• 4242</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Remaining</span>
                  <span className="font-semibold text-navy-900">${TOTAL_AMOUNT - DEPOSIT_AMOUNT} on move day</span>
                </div>
              </div>

              <button onClick={onClose} className="w-full bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-heading font-bold py-3.5 rounded-2xl cursor-pointer transition-all">
                Done
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </>
  );
}
