"use client";

import { useRef, useState, useCallback } from "react";
import { useMove } from "@/context/MoveContext";
import type { PhotoLabel } from "@/context/MoveContext";
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
} from "lucide-react";
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
        {/* Active jobs header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Active Jobs ({activeMoves.length})
          </h2>
          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Update status to sync client view
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
