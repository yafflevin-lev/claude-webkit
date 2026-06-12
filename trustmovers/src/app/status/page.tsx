"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMove } from "@/context/MoveContext";
import type { MoveStatus } from "@/context/MoveContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Shield,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Star,
  Lock,
  ChevronRight,
  X,
  SlidersHorizontal,
  BadgeCheck,
  ArrowRight,
  Camera,
  CreditCard,
  Receipt,
  Phone,
  MessageCircle,
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { PaymentSheet } from "@/components/PaymentSheet";
import { RatingGate } from "@/components/RatingGate";

const PIPELINE_STEPS = [
  { label: "Scheduled", icon: Clock },
  { label: "Deposit Received", icon: CheckCircle2 },
  { label: "Confirmed", icon: BadgeCheck },
  { label: "On The Way", icon: Truck },
  { label: "Arrived", icon: MapPin },
  { label: "Complete", icon: Star },
];

const STATUS_MESSAGES: Record<number, string> = {
  0: "Your move is scheduled. We'll confirm once we receive your deposit.",
  1: "Deposit received. Your move is being confirmed by our team.",
  2: "You're confirmed. Tap 'Start Move' when you're ready on moving day.",
  3: "Your crew is heading to you. ETA: ~20 min.",
  4: "Your crew has arrived and is getting set up.",
  5: "Move complete. Great work today.",
};

function formatDate(iso: string) {
  if (!iso) return "Tue, Mar 12";
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return "Tue, Mar 12";
  }
}

function timeWindowLabel(tw: string) {
  if (tw === "Morning") return "Morning (8–12)";
  if (tw === "Afternoon") return "Afternoon (12–5)";
  if (tw === "Evening") return "Evening (5–8)";
  return tw;
}

// ---------- Pipeline ----------
function Pipeline({ status }: { status: number }) {
  return (
    <div className="flex flex-col gap-0">
      {PIPELINE_STEPS.map((step, i) => {
        const complete = i < status;
        const current = i === status;
        const future = i > status;

        return (
          <div key={step.label} className="flex items-stretch gap-3">
            {/* Dot + connector column */}
            <div className="flex flex-col items-center" style={{ width: 28 }}>
              <motion.div
                initial={false}
                animate={
                  complete
                    ? { backgroundColor: "oklch(30% 0.11 245)", scale: 1 }
                    : current
                    ? { backgroundColor: "oklch(70% 0.17 65)", scale: 1.1 }
                    : { backgroundColor: "oklch(84% 0.012 245)", scale: 1 }
                }
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                  current ? "pipeline-step-active" : complete ? "pipeline-step-complete" : ""
                }`}
              >
                {complete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : current ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2.5 h-2.5 rounded-full bg-white"
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </motion.div>

              {/* Connector line */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="w-0.5 flex-1 my-0.5 rounded-full overflow-hidden bg-slate-200" style={{ minHeight: 20 }}>
                  <motion.div
                    className="w-full bg-navy-700 origin-top"
                    initial={false}
                    animate={{ scaleY: complete ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                    style={{ height: "100%" }}
                  />
                </div>
              )}
            </div>

            {/* Label */}
            <div className={`pb-5 flex items-start ${i === PIPELINE_STEPS.length - 1 ? "pb-0" : ""}`}>
              <span
                className={`text-sm font-semibold leading-6 ${
                  complete
                    ? "text-navy-800"
                    : current
                    ? "text-amber-600"
                    : "text-slate-400"
                }`}
              >
                {step.label}
                {current && (
                  <span className="ml-2 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Crew Reveal ----------
function CrewReveal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
    >
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Your Moving Crew
      </p>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Users className="w-6 h-6 text-navy-500" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-navy-900 text-sm">Marcus T., Lead Mover</p>
          <p className="text-slate-500 text-xs mt-0.5">5 years experience · 200+ moves</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["Insured", "Bonded", "Background Checked"].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-200"
              >
                <BadgeCheck className="w-3 h-3" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Crew of 3 · 26ft truck</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          You'll receive updates here. If anything changes, we'll notify you.
        </p>
      </div>
    </motion.div>
  );
}

// ---------- Estimate Card ----------
function EstimateCard() {
  const { move, approveEstimate } = useMove();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Move Estimate
        </p>
        <p className="text-3xl font-heading font-bold text-navy-900">$450–$700</p>
        <p className="text-slate-500 text-xs mt-1">
          Based on {move.moveSize} · {move.moveType} · ~2–4 hrs
        </p>

        <div className="mt-3">
          {move.estimateApproved ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-700">Approved</p>
                <p className="text-xs text-emerald-600">at {move.estimateApprovedAt}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-semibold text-sm py-3 rounded-xl transition-all duration-150 cursor-pointer"
            >
              Tap to Approve
            </button>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 max-w-lg mx-auto safe-bottom"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-heading font-bold text-navy-900">Approve Estimate</h2>
              <div className="mt-3 bg-slate-50 rounded-xl p-3">
                <p className="text-2xl font-heading font-bold text-navy-900">$450–$700</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {move.moveSize} · {move.moveType} · ~2–4 hrs
                </p>
              </div>
              <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                By approving, you agree to the estimate range shown above. We'll notify you before
                proceeding with any additional costs.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    approveEstimate();
                    setShowModal(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm cursor-pointer transition-all duration-150"
                >
                  Confirm Approval
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------- Move Prep ----------
function MovePrepSection({ moveSize }: { moveSize: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-navy-900">
          Things to know before your move
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Tailored for: {moveSize} · Local move
        </p>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* What to do first */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            What to do first
          </p>
          <ul className="space-y-1.5">
            {[
              "Take inventory of large and fragile items",
              "Pack fragile items with bubble wrap or towels",
              "Pack heavy things in small boxes, light things in large boxes",
              "Set aside a moving day bag — chargers, meds, snacks, toiletries",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Moving day readiness */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Moving day readiness
          </p>
          <ul className="space-y-2">
            {[
              "All boxes packed and sealed",
              "All boxes labeled — contents and destination room",
              "Clear a path from rooms to the front door",
              "Disassemble large furniture if possible",
              "Reserve elevator or loading zone if applicable",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                <div className="w-4 h-4 rounded border-2 border-slate-300 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Estimated time */}
        <div className="bg-navy-50 rounded-xl px-3 py-2.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-navy-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-navy-800">Estimated move time</p>
            <p className="text-xs text-navy-600">Typical time: 2–4 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Payment Card ----------
const INVOICE_LINES = [
  { label: "Labor & crew (3 movers)", amount: 280 },
  { label: "Truck & mileage", amount: 75 },
  { label: "Packing materials", amount: 75 },
];
const DEPOSIT = 150;
const BALANCE = 430;
const TOTAL = 580;

function PaymentCard() {
  const { move } = useMove();
  const [sheetOpen, setSheetOpen] = useState(false);
  const paid = move.paymentStatus === "paid";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-semibold text-navy-900">Invoice</p>
          {paid ? (
            <span className="ml-auto flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Paid
            </span>
          ) : (
            <span className="ml-auto text-xs text-slate-400">Balance due</span>
          )}
        </div>

        <div className="px-4 py-3 space-y-2">
          {/* Deposit line */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Deposit paid</span>
            <span className="text-sm font-medium text-emerald-700">−${DEPOSIT}</span>
          </div>

          {/* Service lines */}
          {INVOICE_LINES.map((line) => (
            <div key={line.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{line.label}</span>
              <span className="text-sm font-medium text-slate-800">${line.amount}</span>
            </div>
          ))}

          {/* Divider + totals */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Move total</span>
              <span className="text-xs font-semibold text-slate-700">${TOTAL}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-navy-900">
                {paid ? "Amount charged" : "Balance due"}
              </span>
              <span className={`text-base font-bold ${paid ? "text-emerald-700" : "text-navy-900"}`}>
                ${BALANCE}
              </span>
            </div>
          </div>

          {/* Paid receipt */}
          {paid && move.paymentPaidAt && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Paid at {move.paymentPaidAt} · Visa •••• 4242
              </p>
            </div>
          )}
        </div>

        {/* Pay button */}
        {!paid && (
          <div className="px-4 pb-4">
            {move.status >= 3 ? (
              <button
                onClick={() => setSheetOpen(true)}
                className="w-full bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-semibold text-sm py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pay ${BALANCE}.00 now
              </button>
            ) : (
              <div className="bg-slate-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <p className="text-xs text-slate-500">
                  Payment unlocks when your crew is on the way.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {sheetOpen && <PaymentSheet onClose={() => setSheetOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

// ---------- Demo Controls Bottom Sheet ----------
function DemoControls() {
  const { move, setStatus, advanceStatus } = useMove();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 bg-slate-800/90 hover:bg-slate-800 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-full flex items-center gap-1.5 shadow-lg cursor-pointer transition-colors z-30"
        aria-label="Demo controls"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Demo
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 max-w-lg mx-auto safe-bottom"
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-slate-900">Demo Controls</h3>
                <button onClick={() => setOpen(false)} className="text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Current status:{" "}
                <span className="font-semibold text-amber-600">
                  {PIPELINE_STEPS[move.status]?.label}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(PIPELINE_STEPS.map((s, i) => i) as MoveStatus[]).map((i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setStatus(i as MoveStatus);
                      setOpen(false);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium text-left cursor-pointer transition-all ${
                      move.status === i
                        ? "bg-navy-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {PIPELINE_STEPS[i].label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  advanceStatus();
                  setOpen(false);
                }}
                disabled={move.status >= 5}
                className="mt-3 w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-semibold text-sm rounded-xl cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Advance to next step →
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------- Crew Photos ----------
function CrewPhotos() {
  const { photos } = useMove();
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (photos.length === 0) return null;

  const before = photos.filter((p) => p.label === "Before");
  const after = photos.filter((p) => p.label === "After");
  const notes = photos.filter((p) => p.label === "Note");

  const groups = [
    { label: "Before", items: before },
    { label: "After", items: after },
    { label: "Notes", items: notes },
  ].filter((g) => g.items.length > 0);

  return (
    <>
      <motion.div
        key="photos"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-semibold text-navy-900">
            Crew Photos
          </p>
          <span className="text-xs text-slate-400 ml-auto">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="px-4 py-3 space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {group.label}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {group.items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setLightbox(p.dataUrl)}
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.dataUrl}
                      alt={p.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
                      <p className="text-white text-[9px]">{p.uploadedAt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              src={lightbox}
              alt="Full size"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------- Main Status Page ----------
export default function StatusPage() {
  const { move, setStatus } = useMove();
  const router = useRouter();

  const dateLabel = formatDate(move.preferredDate);
  const isMovingDay = move.preferredDate === new Date().toISOString().split("T")[0];

  function handleStartMove() {
    setStatus(3);
  }

  return (
    <>
    <RatingGate />
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-navy-900 px-5 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="text-amber-400 w-4 h-4" />
          <span className="text-white font-heading font-semibold text-sm">TrustMovers</span>
          <span className="text-navy-400 text-xs">·</span>
          <a href="/" className="text-navy-300 text-xs hover:text-white transition-colors">
            ← Home
          </a>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-white">Your Move</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-amber-300 text-base font-semibold">{dateLabel}</span>
              {isMovingDay && (
                <span className="bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  Moving Day
                </span>
              )}
            </div>
            <p className="text-navy-300 text-xs mt-1">{timeWindowLabel(move.timeWindow)}</p>
          </div>
          {move.status === 5 && (
            <span className="bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </span>
          )}
        </div>

        <div className="mt-3 bg-navy-800 rounded-xl px-3 py-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-navy-300 flex-shrink-0" />
          <p className="text-navy-200 text-xs truncate">
            {move.moveType} · {move.moveSize} · {move.fromAddress} → {move.toAddress}
          </p>
        </div>
      </header>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Pipeline card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <Pipeline status={move.status} />
        </div>

        {/* Status summary card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </p>
              <p className="text-navy-900 font-semibold text-sm mt-1">
                {STATUS_MESSAGES[move.status]}
              </p>
            </div>
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-3">
              {PIPELINE_STEPS[move.status]?.label}
            </span>
          </div>

          {/* Contact strip — always visible pre-complete */}
          {move.status < 5 && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
              <p className="text-xs text-slate-500 flex-1">Questions about your move?</p>
              <a
                href="tel:+15555550100"
                className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                <Phone className="w-3 h-3" />
                Call us
              </a>
              <a
                href="sms:+15555550100"
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                Text us
              </a>
            </div>
          )}
        </div>

        {/* Move prep + Start Move — show before On The Way */}
        {move.status < 3 && (
          <>
            <MovePrepSection moveSize={move.moveSize} />

            {move.status === 2 && (
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                onClick={handleStartMove}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-heading font-bold text-base py-4 rounded-2xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all duration-150 flex items-center justify-center gap-2"
              >
                <Truck className="w-5 h-5" />
                Start Move
              </motion.button>
            )}
            {move.status === 2 && (
              <p className="text-center text-slate-400 text-xs -mt-2">
                Activates live move-day updates
              </p>
            )}
          </>
        )}

        {/* Crew reveal — show when On The Way or later */}
        <AnimatePresence>
          {move.status >= 3 && (
            <motion.div
              key="crew"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            >
              <CrewReveal />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estimate card — show when On The Way or later */}
        <AnimatePresence>
          {move.status >= 3 && (
            <motion.div
              key="estimate"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            >
              <EstimateCard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment card — show when deposit received or later */}
        <AnimatePresence>
          {move.status >= 1 && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
            >
              <PaymentCard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crew photos — show when On The Way or later, if crew uploaded any */}
        <AnimatePresence>
          {move.status >= 3 && <CrewPhotos />}
        </AnimatePresence>

        {/* Completion card */}
        <AnimatePresence>
          {move.status === 5 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-lg font-heading font-bold text-emerald-900">Move Complete</h2>
              <p className="text-emerald-700 text-sm mt-1">
                Thank you for choosing One Stop Moving &amp; Storage.
              </p>
              <button
                onClick={() => router.push("/summary")}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                View Move Summary
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-xs">Secure · One Stop Moving &amp; Storage</span>
        </div>
      </div>

      <DemoControls />
    </main>
    </>
  );
}
