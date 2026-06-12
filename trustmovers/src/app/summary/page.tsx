"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMove } from "@/context/MoveContext";
import type { MoveHistoryEntry } from "@/context/MoveContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  CheckCircle2,
  MapPin,
  Users,
  Star,
  Download,
  Copy,
  Mail,
  ArrowRight,
  ChevronRight,
  X,
  Calendar,
  Weight,
  Clock,
  Camera,
} from "lucide-react";

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg z-50 flex items-center gap-2 whitespace-nowrap"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      {message}
      <button onClick={onDismiss} className="ml-1 text-slate-400 hover:text-white cursor-pointer">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

function HistoryCard({
  entry,
  onView,
}: {
  entry: MoveHistoryEntry;
  onView: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500">{entry.date}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">
              {entry.moveType} {entry.moveSize}
            </span>
          </div>
          <p className="text-sm font-medium text-navy-900 truncate">
            {entry.fromAddress}
          </p>
          <div className="flex items-center gap-1 my-0.5">
            <div className="h-px flex-1 bg-slate-200 max-w-8" />
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-navy-900 truncate">
            {entry.toAddress}
          </p>
          <p className="text-xs text-slate-500 mt-1">Lead: {entry.leadMover}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-navy-900">{entry.finalTotal}</p>
          <button
            onClick={onView}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-800 cursor-pointer transition-colors"
          >
            View Summary
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100">
        Available online for 90 days
      </p>
    </div>
  );
}

export default function SummaryPage() {
  const { move, photos } = useMove();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [showEmailField, setShowEmailField] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    showToast("Link copied to clipboard");
  }

  function handleEmailSend() {
    if (!emailInput.trim()) return;
    setEmailSent(true);
    showToast(`Sent to ${emailInput}`);
    setTimeout(() => {
      setShowEmailField(false);
      setEmailInput("");
      setEmailSent(false);
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-navy-900 px-5 pt-4 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="text-amber-400 w-4 h-4" />
          <span className="text-white font-heading font-semibold text-sm">TrustMovers</span>
          <span className="text-navy-400 text-xs">·</span>
          <a href="/status" className="text-navy-300 text-xs hover:text-white transition-colors">
            ← Back to status
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-white">Move Complete</h1>
            <p className="text-navy-300 text-xs mt-0.5">
              Thank you for choosing One Stop Moving &amp; Storage
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Move Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <p className="font-heading font-bold text-navy-900 text-sm">Move Summary</p>
            <span className="text-xs text-slate-500">Mar 12, 2026</span>
          </div>

          <div className="px-4 py-4 space-y-3">
            {/* Addresses */}
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Route
                </p>
                <p className="text-sm font-medium text-slate-900">{move.fromAddress}</p>
                <div className="flex items-center gap-1 my-1">
                  <div className="h-px w-4 bg-slate-300" />
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900">{move.toAddress}</p>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="text-sm font-medium text-slate-800">Mar 12, 2026 · Morning</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Lead mover</p>
                  <p className="text-sm font-medium text-slate-800">Marcus T.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Move type</p>
                  <p className="text-sm font-medium text-slate-800">
                    {move.moveType} · {move.moveSize}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Crew &amp; truck</p>
                  <p className="text-sm font-medium text-slate-800">Crew of 3 · 26ft truck</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Weight + estimate */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Weight className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Est. weight</p>
                  <p className="text-sm font-medium text-slate-800">~1,200 kg</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Estimate approved</p>
                <p className="text-sm font-medium text-slate-800">$450–$700</p>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700">Final Total</p>
                <p className="text-xs text-emerald-600">Charged after completion</p>
              </div>
              <p className="text-2xl font-heading font-bold text-emerald-800">$580</p>
            </div>
          </div>
        </div>

        {/* What we moved */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-sm font-semibold text-navy-900 mb-3">What we moved</p>
          <ul className="space-y-2">
            {[
              "All furniture disassembled and reassembled",
              "42 boxes + 3 fragile-labeled items",
              "Washer and dryer disconnected and reconnected",
              "All items delivered to correct rooms",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Condition notes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-sm font-semibold text-navy-900 mb-3">Condition notes</p>
          <ul className="space-y-2">
            {[
              "No damage reported",
              "Minor scuff on hallway wall (pre-existing, photographed)",
            ].map((item, i) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                    i === 0 ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Crew photos */}
        {photos.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-semibold text-navy-900">Crew Photos</p>
              <span className="text-xs text-slate-400 ml-auto">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2">
              {photos.map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt={p.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-1 left-1.5 text-white text-[10px] font-semibold">
                      {p.label}
                    </span>
                  </div>
                  <a
                    href={p.dataUrl}
                    download={`move-photo-${p.label.toLowerCase()}-${p.id}.jpg`}
                    className="flex items-center justify-center gap-1 text-[10px] text-navy-600 hover:text-navy-800 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Save
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settling-in tips */}
        <div className="bg-navy-50 rounded-2xl border border-navy-100 p-4">
          <p className="text-sm font-semibold text-navy-900 mb-2.5">Tips for settling in</p>
          <ul className="space-y-2">
            {[
              "Unpack essentials first — kitchen, bathroom, bedroom",
              "Update your address with USPS, banks, and subscriptions",
              "Check all furniture for reassembly tightness after 1 week",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-navy-800">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Availability notice */}
        <p className="text-xs text-slate-400 text-center">
          Available online for 90 days (until Jun 10). Download a PDF for your records.
        </p>

        {/* Action buttons */}
        <div className="space-y-2.5">
          <button className="w-full bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-semibold text-sm py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Move Summary (PDF)
          </button>

          <button
            onClick={handleCopy}
            className="w-full bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-semibold text-sm py-3.5 rounded-xl border border-slate-200 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Share Link
          </button>

          {!showEmailField ? (
            <button
              onClick={() => setShowEmailField(true)}
              className="w-full bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-semibold text-sm py-3.5 rounded-xl border border-slate-200 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email a Copy
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <label htmlFor="email-copy" className="sr-only">
                Email address
              </label>
              <input
                id="email-copy"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="landlord@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              />
              <button
                onClick={handleEmailSend}
                disabled={!emailInput.trim() || emailSent}
                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm py-3 rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {emailSent ? "Sent!" : "Send"}
              </button>
            </motion.div>
          )}
        </div>

        {/* Review prompt */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-base font-heading font-bold text-navy-900 mb-1">
            How did we do?
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            If Marcus and the crew took great care of your move today, a quick Google review
            helps a small local business more than you know.
          </p>
          <a
            href="https://google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-semibold text-sm py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            Leave a Google Review
            <ChevronRight className="w-4 h-4" />
          </a>
          <p className="text-center text-xs text-slate-400 mt-2">Takes about 30 seconds</p>
        </div>

        {/* Move History */}
        {move.moveHistory.length > 0 && (
          <div>
            <h2 className="text-sm font-heading font-bold text-navy-900 mb-3">
              Move History for {move.clientName}
            </h2>
            <div className="space-y-3">
              {move.moveHistory.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onView={() => router.push("/summary")}
                />
              ))}
            </div>

            {/* Book Another Move */}
            <a
              href="/"
              className="mt-4 w-full bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-semibold text-sm py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              Book Another Move
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Footer credit */}
        <p className="text-center text-xs text-slate-400 mt-2">
          Built with Claude Web Builder by{" "}
          <a
            href="https://tododeia.com"
            className="hover:text-slate-600 transition-colors underline underline-offset-2"
          >
            Tododeia
          </a>
        </p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
