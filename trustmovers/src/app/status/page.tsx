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
  X,
  SlidersHorizontal,
  BadgeCheck,
  ArrowRight,
  Camera,
  CreditCard,
  Receipt,
  Phone,
  MessageCircle,
  Signal,
  Lightbulb,
  ListChecks,
  Square,
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { PaymentSheet } from "@/components/PaymentSheet";
import { DepositSheet } from "@/components/DepositSheet";
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

// ---------- Stage Tips ----------
const STAGE_TIPS: Record<number, { heading: string; tips: string[] }> = {
  0: {
    heading: "Getting started",
    tips: [
      "Pay your deposit to lock in your crew and time slot — slots fill fast.",
      "Forward this page to anyone helping on move day.",
    ],
  },
  1: {
    heading: "Start preparing now",
    tips: [
      "Start packing with rooms you use least — spare bedroom, storage closets first.",
      "Label every box with its destination room, not just what's inside. It speeds up unloading.",
      "Book your elevator now if your building requires advance notice — most ask for 24–48 hrs.",
    ],
  },
  2: {
    heading: "Move day is coming",
    tips: [
      "Do a final walkthrough tonight — check every closet, under beds, and storage areas.",
      "Charge your phone fully the night before. You'll rely on it all day.",
      "Leave clear walking paths from each room to your front door.",
    ],
  },
  3: {
    heading: "Get ready — crew is on the way",
    tips: [
      "Prop your building entrance open if you can — it saves real time on the unload.",
      "Have the parking spot closest to your entrance clear for the truck.",
      "Last check: drawers, medicine cabinet, shelves, and closets.",
    ],
  },
  4: {
    heading: "Make it smooth",
    tips: [
      "Walk the crew through your home first — point out fragile and extra-heavy items.",
      "Keep pets and kids in a safe, separate room during the move.",
      "Have water or drinks available for the crew — always appreciated.",
      "Moving anything yourself? Do it now to avoid confusion.",
    ],
  },
  5: {
    heading: "Almost done",
    tips: [
      "Check every room, closet, and cabinet before the crew leaves.",
      "Test lights, outlets, and water at your new place right away.",
      "Update your address: USPS.com, your bank, DMV, and subscriptions.",
    ],
  },
};

function StageTips({ status }: { status: number }) {
  const data = STAGE_TIPS[status];
  if (!data) return null;
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">{data.heading}</p>
      </div>
      <ul className="space-y-2">
        {data.tips.map((tip) => (
          <li key={tip} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
            <p className="text-sm text-amber-900 leading-snug">{tip}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Todo Checklist ----------
const TODO_ITEMS: Record<string, string[]> = {
  "Studio": [
    "Book elevator at both buildings (usually 24–48 hrs notice required)",
    "Pack all boxes and label each with its destination room",
    "Disassemble bed frame and any flat-pack furniture",
    "Set aside an overnight bag — chargers, meds, toiletries, clothes",
    "Clear a path from all furniture to the front door",
    "Confirm truck parking at both addresses",
  ],
  "1 Bedroom": [
    "Book elevator at both buildings (usually 24–48 hrs notice required)",
    "Pack all boxes and label each with its destination room",
    "Disassemble bed frame, desk, and any flat-pack furniture",
    "Disconnect washer/dryer if applicable",
    "Set aside an overnight bag — chargers, meds, toiletries, clothes",
    "Clear paths from all rooms to the front door",
    "Confirm truck parking at both addresses",
  ],
  "2 Bedroom": [
    "Book elevator at both buildings (usually 24–48 hrs notice required)",
    "Pack all boxes and label each with its destination room",
    "Disassemble beds, desks, and large shelving units",
    "Defrost your fridge at least 12 hours before move day",
    "Disconnect washer/dryer if applicable",
    "Arrange pet or childcare for move day",
    "Set aside an overnight bag — chargers, meds, toiletries, clothes",
    "Clear paths from all rooms to the front door",
    "Confirm truck parking at both addresses",
  ],
  "3+ Bedrooms": [
    "Book elevator at both buildings (usually 24–48 hrs notice required)",
    "Pack and label all boxes by destination room",
    "Disassemble beds, desks, wardrobes, and large furniture",
    "Defrost fridge and freezer 24 hours before move day",
    "Disconnect washer, dryer, and any wall-mounted items",
    "Arrange pet and childcare for move day",
    "Reserve 2 parking spots near both building entrances for the truck",
    "Pack a first-night box — clothes, toiletries, chargers, snacks, bedding",
    "Do a full walkthrough of every closet, cabinet, and storage area",
    "Confirm move-in rules and restrictions at your new address",
  ],
};

function TodoChecklist({ moveSize }: { moveSize: string }) {
  const items = TODO_ITEMS[moveSize] ?? TODO_ITEMS["1 Bedroom"];
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const done = checked.size;
  const total = items.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-semibold text-navy-900">Move Day Checklist</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          done === total ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}>
          {done}/{total}
        </span>
      </div>

      {done === total && total > 0 && (
        <div className="mx-4 mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">You're all set for move day!</p>
        </div>
      )}

      <div className="px-4 py-3 space-y-2">
        {items.map((item, i) => {
          const isChecked = checked.has(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="w-full flex items-start gap-3 text-left cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                isChecked
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-slate-300 group-hover:border-navy-400"
              }`}>
                {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                {!isChecked && <Square className="w-0 h-0 opacity-0" />}
              </div>
              <p className={`text-sm leading-snug transition-colors ${
                isChecked ? "text-slate-400 line-through" : "text-slate-700"
              }`}>
                {item}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mx-4 mb-3">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={false}
            animate={{ width: `${(done / total) * 100}%` }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>
      </div>
    </div>
  );
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

// ---------- Deposit Card ----------
function DepositCard() {
  const { move } = useMove();
  const [sheetOpen, setSheetOpen] = useState(false);
  const paid = move.depositPaid;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className={`rounded-2xl border shadow-sm overflow-hidden ${
          paid ? "bg-white border-slate-200" : "bg-navy-900 border-navy-800"
        }`}
      >
        {paid ? (
          <div className="px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy-900">Deposit paid — $150</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Move date confirmed{move.depositPaidAt ? ` · ${move.depositPaidAt}` : ""}
              </p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              Confirmed
            </span>
          </div>
        ) : (
          <div className="px-4 py-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold text-sm">Secure your move date</p>
                <p className="text-navy-300 text-xs mt-0.5">A $150 deposit locks in your crew and time slot.</p>
              </div>
              <span className="text-amber-400 font-heading font-bold text-xl">$150</span>
            </div>
            <button
              onClick={() => setSheetOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-white font-semibold text-sm py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pay $150 Deposit
            </button>
            <p className="text-navy-400 text-xs text-center mt-2">
              Remaining $430 due on move day · Full refund 48hrs before
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {sheetOpen && <DepositSheet onClose={() => setSheetOpen(false)} />}
      </AnimatePresence>
    </>
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

// ---------- Queue Position Card ----------
function QueuePositionCard() {
  const { queuePosition } = useMove();
  if (queuePosition === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
        <Signal className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-navy-900">
          {queuePosition === 1 ? "You're up next!" : `${queuePosition} jobs ahead of you`}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {queuePosition === 1
            ? "Crew is finishing their current job. Get ready!"
            : "We'll notify you as the crew gets closer."}
        </p>
      </div>
      <span className="text-2xl font-heading font-bold text-amber-500 flex-shrink-0">
        {queuePosition}
      </span>
    </motion.div>
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

        {/* Queue position — only before crew is on the way */}
        {move.status < 3 && <QueuePositionCard />}

        {/* Deposit card — prominent at status 0, compact confirmed state at status 1 */}
        {move.status <= 1 && <DepositCard />}

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

        {/* Stage tips — every status */}
        <StageTips status={move.status} />

        {/* Todo checklist — before crew is on the way */}
        {move.status < 3 && (
          <>
            <TodoChecklist moveSize={move.moveSize} />

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
              className="space-y-3"
            >
              {/* $50 review offer */}
              <div className="bg-amber-500 rounded-2xl p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)",
                }} />
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <h3 className="text-white font-heading font-bold text-base mb-1">Get $50 off your invoice</h3>
                <p className="text-amber-100 text-xs leading-relaxed mb-3">
                  Leave us a Google review and show it to your crew before they leave. We'll take $50 off your balance today.
                </p>
                <a
                  href="https://g.page/r/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-amber-700 font-semibold text-sm px-5 py-2.5 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors"
                >
                  Leave a Google Review
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-amber-200 text-[11px] mt-2">Show the screenshot to your crew — $50 off applied immediately</p>
              </div>

              {/* Complete card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
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
              </div>
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
