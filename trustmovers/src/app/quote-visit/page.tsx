"use client";

import { useRouter } from "next/navigation";
import { useMove } from "@/context/MoveContext";
import type { QuoteVisitStatus } from "@/context/MoveContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  ChevronLeft,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  ThumbsUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

const PIPELINE: { key: QuoteVisitStatus; label: string; sub: string }[] = [
  { key: "requested",   label: "Requested",      sub: "We got your request"         },
  { key: "confirmed",   label: "Confirmed",       sub: "Visit scheduled"             },
  { key: "en_route",    label: "On The Way",      sub: "Assessor heading over"       },
  { key: "arrived",     label: "Assessor Arrived", sub: "Walk-through in progress"   },
  { key: "quote_ready", label: "Quote Ready",     sub: "Review your personalized quote" },
  { key: "approved",    label: "Approved",        sub: "Quote accepted — deposit next" },
];

const STATUS_ORDER: QuoteVisitStatus[] = [
  "requested", "confirmed", "en_route", "arrived", "quote_ready", "approved",
];

function statusIndex(s: QuoteVisitStatus) {
  return STATUS_ORDER.indexOf(s);
}

export default function QuoteVisitPage() {
  const { move, approveInHomeQuote } = useMove();
  const router = useRouter();
  const visit = move.quoteVisit;

  if (!visit) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-navy-900 font-heading font-bold text-lg">No visit scheduled</p>
          <p className="text-slate-500 text-sm">Request a free in-home assessment from the quote page.</p>
          <a
            href="/quote"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 mt-2"
          >
            <ArrowRight className="w-4 h-4" />
            Go to Quote Calculator
          </a>
        </div>
      </main>
    );
  }

  const currentIdx = statusIndex(visit.status);

  function handleApprove() {
    approveInHomeQuote();
    setTimeout(() => router.push("/status"), 400);
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="bg-navy-900 px-5 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <a
              href="/quote"
              className="flex items-center gap-1 text-navy-300 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </a>
            <div className="flex items-center gap-2 ml-1">
              <Truck className="text-amber-400 w-4 h-4" />
              <span className="text-white font-heading font-semibold text-sm">TrustMovers</span>
            </div>
          </div>
          <NotificationBell />
        </div>
      </header>

      <div className="px-4 pt-6 pb-8 max-w-lg mx-auto space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">Your Assessment</h1>
          <p className="text-slate-500 text-sm mt-1">
            {visit.clientName
              ? `Hi ${visit.clientName.split(" ")[0]} — track your visit below.`
              : "Track your in-home visit below."}
          </p>
        </div>

        {/* Visit info card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Visit Details</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <p className="text-sm text-slate-700 truncate">{visit.address || "—"}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                {visit.preferredDate || "Pending date"} · {visit.preferredTime}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <p className="text-sm text-slate-700">Requested at {visit.requestedAt}</p>
            </div>
          </div>
        </div>

        {/* Pipeline tracker */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Visit Progress</p>
          </div>
          <div className="px-4 pb-4 space-y-0">
            {PIPELINE.map((step, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              const upcoming = i > currentIdx;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  {/* Icon column */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-2.5 transition-all ${
                      done    ? "bg-emerald-500"
                      : active ? "bg-amber-500 ring-4 ring-amber-100"
                      : "bg-slate-100"
                    }`}>
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : active ? (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        </motion.div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <div className={`w-px flex-1 min-h-[20px] mt-1 ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
                    )}
                  </div>
                  {/* Text */}
                  <div className="pb-3 pt-2.5 flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${
                      done ? "text-emerald-700" : active ? "text-amber-700" : "text-slate-400"
                    }`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      done ? "text-emerald-500" : active ? "text-amber-500" : "text-slate-300"
                    }`}>
                      {step.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quote card — visible when quote_ready or approved */}
        <AnimatePresence>
          {(visit.status === "quote_ready" || visit.status === "approved") && (
            <motion.div
              key="quote-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-navy-900">Your Personalized Quote</p>
                <span className="text-xs text-slate-400">Sent {visit.quoteSentAt}</span>
              </div>

              <div className="px-4 py-3 space-y-2">
                {visit.lineItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <span className="text-sm text-slate-600 leading-snug">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-800 flex-shrink-0">${item.amount}</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-navy-900">Total</span>
                    <span className="text-lg font-heading font-bold text-navy-900">${visit.quoteTotal}</span>
                  </div>
                </div>

                {visit.quoteNotes && (
                  <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 mt-1 leading-relaxed">
                    {visit.quoteNotes}
                  </p>
                )}
              </div>

              {visit.status === "quote_ready" && (
                <div className="px-4 pb-4">
                  <button
                    onClick={handleApprove}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-heading font-bold py-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve Quote &amp; Pay Deposit
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-2">
                    A $150 deposit secures your move date. Balance due on move day.
                  </p>
                </div>
              )}

              {visit.status === "approved" && (
                <div className="px-4 pb-4">
                  <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl py-3.5 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">
                      Quote approved at {visit.approvedAt}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push("/status")}
                    className="w-full mt-3 bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-heading font-bold py-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    View Your Booking
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting state when not yet quote_ready */}
        {visit.status !== "quote_ready" && visit.status !== "approved" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {visit.status === "requested" && "Confirming your visit…"}
                {visit.status === "confirmed" && "Your assessor will be on their way soon."}
                {visit.status === "en_route" && "Your assessor is heading over."}
                {visit.status === "arrived" && "Walk-through in progress — quote coming shortly."}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                This page updates live. No need to refresh.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
