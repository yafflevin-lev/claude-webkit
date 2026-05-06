"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMove } from "@/context/MoveContext";
import type { MoveType, MoveSize, TimeWindow } from "@/context/MoveContext";
import { motion } from "framer-motion";
import { Shield, Truck, ArrowRight, ChevronDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function IntakePage() {
  const { submitForm } = useMove();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [moveType, setMoveType] = useState<MoveType>("Local");
  const [moveSize, setMoveSize] = useState<MoveSize>("1 Bedroom");
  const [notes, setNotes] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("Morning");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    submitForm({
      clientName: name,
      clientPhone: phone,
      fromAddress,
      toAddress,
      moveType,
      moveSize,
      notes,
      preferredDate,
      timeWindow,
    });
    setTimeout(() => router.push("/status"), 300);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-navy-900 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="text-amber-400 w-5 h-5" />
            <span className="text-white font-heading font-800 text-lg tracking-tight">
              TrustMovers
            </span>
          </div>
          <p className="text-navy-300 text-xs mt-0.5 pl-7">
            for One Stop Moving &amp; Storage
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-navy-800 px-3 py-1.5 rounded-full">
          <Shield className="text-emerald-500 w-3.5 h-3.5" />
          <span className="text-slate-300 text-xs font-medium">
            Secure booking link
          </span>
        </div>
      </header>

      {/* Form */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        >
          <motion.div custom={0} variants={fadeUp} className="mb-6">
            <h1 className="text-2xl font-heading font-800 text-navy-900">
              Book your move
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              All fields optional — takes under a minute.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Phone */}
            <motion.div custom={1} variants={fadeUp} className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"
                >
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Demo Customer"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 transition-colors"
                />
              </div>
            </motion.div>

            {/* Addresses */}
            <motion.div custom={2} variants={fadeUp} className="space-y-3">
              <div>
                <label
                  htmlFor="from"
                  className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"
                >
                  Moving from
                </label>
                <input
                  id="from"
                  type="text"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  placeholder="123 Demo St, Apt 4B"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="to"
                  className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"
                >
                  Moving to
                </label>
                <input
                  id="to"
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="456 New Home Ave"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 transition-colors"
                />
              </div>
            </motion.div>

            {/* Move Type */}
            <motion.div custom={3} variants={fadeUp}>
              <fieldset>
                <legend className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Move type
                </legend>
                <div className="flex gap-2">
                  {(["Local", "Long Distance"] as MoveType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMoveType(t)}
                      className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all duration-150 cursor-pointer ${
                        moveType === t
                          ? "bg-navy-900 border-navy-900 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:border-navy-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
            </motion.div>

            {/* Move Size */}
            <motion.div custom={4} variants={fadeUp}>
              <label
                htmlFor="size"
                className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"
              >
                Size of move
              </label>
              <div className="relative">
                <select
                  id="size"
                  value={moveSize}
                  onChange={(e) => setMoveSize(e.target.value as MoveSize)}
                  className="w-full appearance-none px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 transition-colors cursor-pointer"
                >
                  {(["Studio", "1 Bedroom", "2 Bedroom", "3+ Bedrooms"] as MoveSize[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </motion.div>

            {/* Notes */}
            <motion.div custom={5} variants={fadeUp}>
              <label
                htmlFor="notes"
                className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"
              >
                Anything we should know?
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Piano, stairs, fragile items, narrow hallways…"
                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 transition-colors"
              />
            </motion.div>

            {/* Date */}
            <motion.div custom={6} variants={fadeUp}>
              <label
                htmlFor="date"
                className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"
              >
                Preferred move date
              </label>
              <input
                id="date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 transition-colors cursor-pointer"
              />
            </motion.div>

            {/* Time Window */}
            <motion.div custom={7} variants={fadeUp}>
              <fieldset>
                <legend className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Time window
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["Morning", "Afternoon", "Evening", "ASAP"] as TimeWindow[]).map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTimeWindow(t)}
                        className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-150 cursor-pointer ${
                          timeWindow === t
                            ? "bg-navy-900 border-navy-900 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-navy-300"
                        }`}
                      >
                        {t === "Morning"
                          ? "Morning (8–12)"
                          : t === "Afternoon"
                          ? "Afternoon (12–5)"
                          : t === "Evening"
                          ? "Evening (5–8)"
                          : "ASAP"}
                      </button>
                    )
                  )}
                </div>
              </fieldset>
            </motion.div>

            {/* Submit */}
            <motion.div custom={8} variants={fadeUp} className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-heading font-bold text-base py-4 rounded-2xl transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {submitting ? (
                  <span className="opacity-70">Submitting…</span>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-slate-400 text-xs mt-2">
                Takes under a minute
              </p>
            </motion.div>
          </form>

          {/* Crew dashboard link */}
          <motion.div
            custom={9}
            variants={fadeUp}
            className="mt-10 pt-6 border-t border-slate-200 text-center"
          >
            <a
              href="/crew"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 transition-colors"
            >
              Crew Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* Footer credit */}
          <p className="text-center text-xs text-slate-400 mt-8 mb-4">
            Built with Claude Web Builder by{" "}
            <a
              href="https://tododeia.com"
              className="hover:text-slate-600 transition-colors underline underline-offset-2"
            >
              Tododeia
            </a>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
