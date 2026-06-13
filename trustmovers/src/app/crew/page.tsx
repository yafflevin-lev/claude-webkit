"use client";

import { useRef, useState, useCallback } from "react";
import { useMove } from "@/context/MoveContext";
import type { PhotoLabel, QueueEntry } from "@/context/MoveContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  MapPin,
  Clock,
  Users,
  BadgeCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Camera,
  X,
  ImagePlus,
  Trash2,
  Signal,
  ListChecks,
  Home,
  Plus,
  Minus,
  Send,
  Phone,
  Copy,
  Check,
} from "lucide-react";
import type { QuoteVisitLineItem } from "@/context/MoveContext";
import { NotificationBell } from "@/components/NotificationBell";

const PIPELINE_STEPS = [
  "Scheduled",
  "Deposit Received",
  "Confirmed",
  "On The Way",
  "Arrived",
  "Complete",
];

const NEXT_ACTION_LABELS: Record<number, string> = {
  0: "Mark Deposit Received",
  1: "Mark Confirmed",
  2: "Mark On The Way",
  3: "Mark Arrived",
  4: "Mark Complete",
  5: "",
};

const STATUS_COLORS: Record<number, string> = {
  0: "bg-slate-100 text-slate-600",
  1: "bg-amber-100 text-amber-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-orange-100 text-orange-700",
  4: "bg-purple-100 text-purple-700",
  5: "bg-emerald-100 text-emerald-700",
};

const STATIC_JOB = {
  id: "static-1",
  clientName: "Rivera Family",
  phone: "(555) 123-4567",
  fromAddress: "77 Oak Glen Ct",
  toAddress: "200 Maple Ridge Rd",
  moveType: "Local",
  moveSize: "2 Bedroom",
  timeWindow: "Afternoon (12–5)",
  status: 1,
  boxes: 28,
  fragileItems: 1,
  stairs: "No stairs",
  estimatedTime: "~3–5 hrs",
};

// ---------- Today's Queue Strip ----------
function QueueStrip() {
  const { dailyQueue, markQueueJobDone, move } = useMove();
  const [tapping, setTapping] = useState<string | null>(null);

  const done = dailyQueue.filter((j) => j.completed).length;
  const total = dailyQueue.length;
  const currentIdx = dailyQueue.findIndex((j) => !j.completed);

  function handleTap(entry: QueueEntry) {
    if (entry.completed || entry.isLive) return;
    if (entry.id !== dailyQueue[currentIdx]?.id) return; // only current job
    setTapping(entry.id);
    setTimeout(() => {
      markQueueJobDone(entry.id);
      setTapping(null);
    }, 600);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-semibold text-navy-900">Today's Queue</p>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {done}/{total} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-3 h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={false}
          animate={{ width: `${(done / total) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        />
      </div>

      {/* Scrollable job pills */}
      <div className="overflow-x-auto pb-3 px-4">
        <div className="flex gap-2" style={{ width: "max-content" }}>
          {dailyQueue.map((entry, i) => {
            const isCurrent = i === currentIdx;
            const isLive = !!entry.isLive;
            const isTapping = tapping === entry.id;
            const clientLabel = isLive
              ? (move.clientName || "Your customer").split(" ")[0]
              : entry.clientName.split(" ")[0];

            return (
              <motion.button
                key={entry.id}
                onClick={() => handleTap(entry)}
                disabled={entry.completed || isLive || !isCurrent}
                animate={isTapping ? { scale: 0.92 } : { scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border min-w-[76px] transition-all duration-200 ${
                  entry.completed
                    ? "bg-emerald-50 border-emerald-200 opacity-60"
                    : isCurrent && !isLive
                    ? "bg-amber-500 border-amber-500 cursor-pointer shadow-md shadow-amber-500/25"
                    : isLive
                    ? "bg-navy-900 border-navy-900"
                    : "bg-slate-50 border-slate-200 opacity-50"
                }`}
              >
                {/* Icon row */}
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold ${
                    entry.completed ? "text-emerald-600" :
                    isCurrent && !isLive ? "text-white" :
                    isLive ? "text-navy-300" : "text-slate-400"
                  }`}>#{i + 1}</span>
                  {entry.completed && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                  {isCurrent && !isLive && !isTapping && <span className="text-[9px] font-bold text-amber-100 bg-amber-600 px-1 rounded">NOW</span>}
                  {isTapping && <CheckCircle2 className="w-3 h-3 text-white" />}
                  {isLive && <Signal className="w-3 h-3 text-amber-400" />}
                </div>
                {/* Name */}
                <p className={`text-xs font-semibold leading-tight text-center max-w-[64px] truncate ${
                  entry.completed ? "text-emerald-700" :
                  isCurrent && !isLive ? "text-white" :
                  isLive ? "text-white" : "text-slate-500"
                }`}>
                  {clientLabel}
                </p>
                {/* Time */}
                <p className={`text-[10px] leading-tight ${
                  entry.completed ? "text-emerald-500" :
                  isCurrent && !isLive ? "text-amber-100" :
                  isLive ? "text-navy-400" : "text-slate-400"
                }`}>
                  {entry.timeWindow}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Helper text */}
      <div className="px-4 pb-3">
        <p className="text-xs text-slate-400">
          {currentIdx >= 0 && !dailyQueue[currentIdx]?.isLive
            ? `Tap current job to mark done — client dashboard updates instantly`
            : "Live customer job — advance status with the button below"}
        </p>
      </div>
    </div>
  );
}

// ---------- Phone Booking — Deposit Link ----------
function PhoneBookingCard() {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const slug = name.trim()
      ? name.trim().toLowerCase().replace(/\s+/g, "-")
      : "new-client";
    const link = `https://pay.trustmovers.com/deposit/${slug}?amount=150`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Phone className="w-4 h-4 text-slate-400" />
        <p className="text-sm font-semibold text-navy-900">Phone Booking — Send Deposit Link</p>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Booked someone by phone? Enter their name and copy a pre-filled deposit link to send via text or email.
        </p>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-amber-400 transition-colors bg-slate-50">
            <input
              type="text"
              placeholder="Client name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 text-sm text-slate-800 outline-none bg-transparent min-w-0"
            />
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all flex-shrink-0 ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-navy-900 hover:bg-navy-800 text-white"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
        {copied && (
          <p className="text-xs text-emerald-600 mt-2 font-medium">
            ✓ Link copied — paste it into a text or email to the client
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Quote Visit Panel ----------
const DEFAULT_ITEMS: QuoteVisitLineItem[] = [
  { id: "labor", label: "Labor (2 movers, 4hr min)", amount: 420 },
  { id: "truck", label: "Truck & fuel", amount: 75 },
  { id: "materials", label: "Packing materials", amount: 55 },
];

function QuoteVisitPanel() {
  const { move, advanceQuoteVisit, sendClientQuote } = useMove();
  const visit = move.quoteVisit;
  const [lineItems, setLineItems] = useState<QuoteVisitLineItem[]>(DEFAULT_ITEMS);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [sending, setSending] = useState(false);

  if (!visit || visit.status === "approved") return null;

  const VISIT_PIPELINE = ["requested", "confirmed", "en_route", "arrived", "quote_ready"];
  const currentStep = VISIT_PIPELINE.indexOf(visit.status);

  const ADVANCE_LABELS: Partial<Record<string, string>> = {
    requested: "Confirm Visit",
    confirmed: "Mark En Route",
    en_route: "Mark Arrived",
  };
  const advanceLabel = ADVANCE_LABELS[visit.status];

  function updateAmount(id: string, delta: number) {
    setLineItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, amount: Math.max(0, item.amount + delta) } : item)
    );
  }

  function handleSendQuote() {
    setSending(true);
    setTimeout(() => {
      sendClientQuote(lineItems, quoteNotes || "Quote built during your in-home walk-through. Price is guaranteed.");
      setSending(false);
    }, 600);
  }

  const total = lineItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
        <Home className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm font-bold text-amber-900 flex-1 min-w-0">In-Home Quote Visit</p>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          visit.status === "quote_ready" ? "bg-emerald-100 text-emerald-700" :
          visit.status === "arrived"     ? "bg-purple-100 text-purple-700"   :
          visit.status === "en_route"    ? "bg-orange-100 text-orange-700"   :
          visit.status === "confirmed"   ? "bg-blue-100 text-blue-700"       :
          "bg-slate-100 text-slate-600"
        }`}>
          {visit.status === "requested"   && "Pending Confirm"}
          {visit.status === "confirmed"   && "Confirmed"}
          {visit.status === "en_route"    && "En Route"}
          {visit.status === "arrived"     && "At Location"}
          {visit.status === "quote_ready" && "Quote Sent"}
        </span>
      </div>

      {/* Client info */}
      <div className="px-4 py-3 border-b border-slate-100 space-y-1.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-navy-900">{visit.clientName || "Pending client"}</p>
          <span className="text-slate-400 text-xs">{visit.clientPhone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{visit.address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{visit.preferredDate} · {visit.preferredTime}</span>
        </div>
      </div>

      {/* Progress pills */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["Requested", "Confirmed", "En Route", "Arrived", "Quote Sent"].map((label, i) => (
            <div key={label} className="flex items-center gap-1 flex-shrink-0">
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                i < currentStep  ? "bg-emerald-100 text-emerald-700" :
                i === currentStep ? "bg-amber-500 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {i < currentStep ? "✓ " : ""}{label}
              </div>
              {i < 4 && <div className={`w-3 h-px flex-shrink-0 ${i < currentStep ? "bg-emerald-300" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Advance button (if not yet arrived) */}
      {advanceLabel && (
        <div className="px-4 py-3 border-b border-slate-100">
          <button
            onClick={advanceQuoteVisit}
            className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-semibold text-sm py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            {advanceLabel}
          </button>
        </div>
      )}

      {/* Quote builder — visible when arrived */}
      {visit.status === "arrived" && (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Build Quote</p>
          <div className="space-y-2 mb-3">
            {lineItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <p className="flex-1 text-sm text-slate-700 min-w-0 truncate">{item.label}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => updateAmount(item.id, -25)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Minus className="w-3 h-3 text-slate-600" />
                  </button>
                  <span className="text-sm font-semibold text-navy-900 w-12 text-center">${item.amount}</span>
                  <button
                    onClick={() => updateAmount(item.id, 25)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100 mb-3">
            <span className="text-sm font-bold text-navy-900">Total</span>
            <span className="text-base font-heading font-bold text-navy-900">${total}</span>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notes for client (optional)</label>
            <textarea
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              placeholder="Any specific details about their home or move…"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400 bg-white resize-none transition-colors"
            />
          </div>

          <button
            onClick={handleSendQuote}
            disabled={sending}
            className="w-full bg-navy-900 hover:bg-navy-800 active:scale-[0.98] disabled:opacity-60 text-white font-heading font-bold text-sm py-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {sending ? (
              <>Sending…</>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Quote to Client
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            Client sees the quote instantly on their phone
          </p>
        </div>
      )}

      {visit.status === "quote_ready" && (
        <div className="px-4 py-3 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">
            Quote of ${visit.quoteTotal} sent to client at {visit.quoteSentAt}. Waiting for approval.
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}
    >
      {PIPELINE_STEPS[status]}
    </span>
  );
}

// ---------- Photo Panel (live job only) ----------
function PhotoPanel() {
  const { photos, addPhoto, removePhoto } = useMove();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLabel, setPendingLabel] = useState<PhotoLabel>("Before");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          addPhoto({ dataUrl, label: pendingLabel, caption: "" });
        };
        reader.readAsDataURL(file);
      });
      setTimeout(() => setUploading(false), 400);
    },
    [addPhoto, pendingLabel]
  );

  return (
    <>
      <div className="border-t border-slate-100 px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Job Photos ({photos.length})
          </p>
          <div className="flex items-center gap-1.5">
            {(["Before", "After", "Note"] as PhotoLabel[]).map((l) => (
              <button
                key={l}
                onClick={() => setPendingLabel(l)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  pendingLabel === l
                    ? "bg-navy-900 border-navy-900 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-navy-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <AnimatePresence>
              {photos.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                  className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer group"
                  onClick={() => setLightbox(p.dataUrl)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.dataUrl}
                    alt={p.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 left-1.5 text-white text-[10px] font-semibold">
                    {p.label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(p.id);
                    }}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="absolute top-1 left-1.5 text-white/70 text-[9px]">
                    {p.uploadedAt}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-slate-200 hover:border-navy-300 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-navy-700 transition-all cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <>
              <ImagePlus className="w-4 h-4 animate-pulse" />
              Adding…
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Add {pendingLabel} Photo
            </>
          )}
        </button>
        <p className="text-center text-xs text-slate-400 mt-1.5">
          Photos are visible to the client on their status page
        </p>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <>
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
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MoveJobCard({
  clientName,
  phone,
  fromAddress,
  toAddress,
  moveType,
  moveSize,
  timeWindow,
  status,
  boxes,
  fragileItems,
  stairs,
  estimatedTime,
  onAdvance,
  isLive,
}: {
  clientName: string;
  phone: string;
  fromAddress: string;
  toAddress: string;
  moveType: string;
  moveSize: string;
  timeWindow: string;
  status: number;
  boxes: number;
  fragileItems: number;
  stairs: string;
  estimatedTime: string;
  onAdvance?: () => void;
  isLive?: boolean;
}) {
  const nextLabel = NEXT_ACTION_LABELS[status];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-navy-900 text-sm">{clientName}</p>
            {isLive && (
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-0.5">{phone}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Route */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 truncate">{fromAddress}</p>
            <div className="flex items-center gap-1 my-0.5">
              <div className="h-px w-3 bg-slate-300" />
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-sm text-slate-700 truncate">{toAddress}</p>
          </div>
        </div>
      </div>

      {/* Details strip */}
      <div className="px-4 py-2 flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Truck className="w-3.5 h-3.5" />
          {moveType} · {moveSize}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {timeWindow}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Users className="w-3.5 h-3.5" />
          {estimatedTime}
        </span>
      </div>

      {/* Move quick summary */}
      <div className="mx-4 mb-3 bg-slate-50 rounded-xl p-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          At a glance
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-base font-bold text-navy-900">{boxes}</p>
            <p className="text-xs text-slate-500">boxes</p>
          </div>
          <div className="text-center border-x border-slate-200">
            <p className="text-base font-bold text-navy-900">{fragileItems}</p>
            <p className="text-xs text-slate-500">fragile</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-navy-900">{stairs}</p>
            <p className="text-xs text-slate-500">stairs</p>
          </div>
        </div>
      </div>

      {/* Photo panel — live job only */}
      {isLive && <PhotoPanel />}

      {/* Status advance button */}
      {onAdvance && nextLabel && status < 5 && (
        <div className="px-4 pb-4">
          <button
            onClick={onAdvance}
            className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-semibold text-sm py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            {nextLabel}
          </button>
        </div>
      )}

      {status === 5 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-2 bg-emerald-50 rounded-xl py-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Move Complete</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrewPage() {
  const { move, advanceStatus } = useMove();

  const activeMoves = [
    {
      id: "live",
      clientName: move.clientName,
      phone: move.clientPhone,
      fromAddress: move.fromAddress,
      toAddress: move.toAddress,
      moveType: move.moveType,
      moveSize: move.moveSize,
      timeWindow:
        move.timeWindow === "Morning"
          ? "Morning (8–12)"
          : move.timeWindow === "Afternoon"
          ? "Afternoon (12–5)"
          : move.timeWindow === "Evening"
          ? "Evening (5–8)"
          : "ASAP",
      status: move.status,
      boxes: 42,
      fragileItems: 3,
      stairs: "Yes (2nd floor)",
      estimatedTime: "~2–4 hrs",
      isLive: true,
      onAdvance: advanceStatus,
    },
    {
      ...STATIC_JOB,
      isLive: false,
      onAdvance: undefined,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="bg-navy-900 px-5 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="text-amber-400 w-4 h-4" />
          <span className="text-white font-heading font-semibold text-sm">TrustMovers</span>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </div>
        <h1 className="text-xl font-heading font-bold text-white">Crew Dashboard</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-6 h-6 bg-navy-700 rounded-full flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-navy-200 text-sm font-medium">Marcus T., Lead Mover</p>
            <div className="flex items-center gap-1">
              <BadgeCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-navy-400 text-xs">5 years · 200+ moves</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Day queue */}
        <QueueStrip />

        {/* Phone booking deposit link */}
        <PhoneBookingCard />

        {/* Quote visit panel */}
        <QuoteVisitPanel />

        {/* Active jobs header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Active Jobs ({activeMoves.length})
          </h2>
          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Advance status to sync client view
          </div>
        </div>

        {/* Job cards */}
        <AnimatePresence initial={false}>
          {activeMoves.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07, ease: [0.25, 1, 0.5, 1] }}
            >
              <MoveJobCard {...job} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Tip callout */}
        <div className="bg-navy-50 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <BadgeCheck className="w-4 h-4 text-navy-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-navy-700">
            Tap the status button on a job card to update the customer's tracking page in real
            time.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center pt-2">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Back to Intake Form
          </a>
        </div>

        {/* Footer credit */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Built with Claude Web Builder by{" "}
          <a
            href="https://tododeia.com"
            className="hover:text-slate-600 transition-colors underline underline-offset-2"
          >
            Tododeia
          </a>
        </p>
      </div>
    </main>
  );
}
