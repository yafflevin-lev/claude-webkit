"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMove } from "@/context/MoveContext";
import type { MoveType, MoveSize } from "@/context/MoveContext";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import {
  Truck,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Info,
  Plus,
  Minus,
  Package,
  Music,
  Weight,
  BoxSelect,
  Calendar,
  Shield,
  Zap,
  Home,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
} from "lucide-react";

// ---- Pricing tables ----
const BASE_RATES: Record<MoveSize, number> = {
  "Studio": 299,
  "1 Bedroom": 399,
  "2 Bedroom": 549,
  "3+ Bedrooms": 749,
};

const HOUR_RANGES: Record<MoveSize, [number, number]> = {
  "Studio": [2, 4],
  "1 Bedroom": [3, 5],
  "2 Bedroom": [4, 7],
  "3+ Bedrooms": [6, 10],
};

const HOURLY_RATE: Record<MoveSize, number> = {
  "Studio": 95,
  "1 Bedroom": 105,
  "2 Bedroom": 120,
  "3+ Bedrooms": 140,
};

const FUEL: Record<MoveType, number> = {
  "Local": 45,
  "Long Distance": 150,
};

const LONG_DIST_MULT = 1.35;
const WEEKEND_SURCHARGE = 0.1;

interface Addon {
  id: string;
  label: string;
  description: string;
  price: number;
  icon: React.ReactNode;
}

const ADDONS: Addon[] = [
  {
    id: "stairs",
    label: "Stairs / no elevator",
    description: "Multiple flights at pickup or drop-off",
    price: 50,
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "piano",
    label: "Piano",
    description: "Upright or baby grand",
    price: 200,
    icon: <Music className="w-4 h-4" />,
  },
  {
    id: "heavy",
    label: "Extra-heavy items",
    description: "Safe, gun cabinet, pool table",
    price: 125,
    icon: <Weight className="w-4 h-4" />,
  },
  {
    id: "packing",
    label: "Full packing service",
    description: "We box everything before moving",
    price: 180,
    icon: <BoxSelect className="w-4 h-4" />,
  },
];

const SIZE_DETAILS: Record<MoveSize, { rooms: string; examples: string }> = {
  "Studio": { rooms: "Studio / 1-room", examples: "Bed, desk, essentials" },
  "1 Bedroom": { rooms: "1–2 rooms", examples: "Bedroom + living room" },
  "2 Bedroom": { rooms: "3–4 rooms", examples: "Full apartment or townhome" },
  "3+ Bedrooms": { rooms: "5+ rooms", examples: "Large home or house" },
};

// ---- Animated number display ----
function AnimatedPrice({ value }: { value: number }) {
  const motionVal = useMotionValue(value);
  const displayed = useTransform(motionVal, (v) => Math.round(v));
  const spring = useSpring(value, { stiffness: 200, damping: 30 });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const [display, setDisplay] = useState(value);
  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  void motionVal;
  void displayed;

  return <span>${display}</span>;
}

function calcQuote(
  size: MoveSize,
  type: MoveType,
  selectedAddons: Set<string>,
  weekend: boolean
): { low: number; high: number; lines: { label: string; amount: number }[] } {
  const [minHrs, maxHrs] = HOUR_RANGES[size];
  const hourly = HOURLY_RATE[size];
  const base = BASE_RATES[size];
  const fuel = FUEL[type];
  const longDistMult = type === "Long Distance" ? LONG_DIST_MULT : 1;
  const weekendAdd = weekend ? WEEKEND_SURCHARGE : 0;

  const addonTotal = ADDONS.filter((a) => selectedAddons.has(a.id)).reduce(
    (sum, a) => sum + a.price,
    0
  );

  const low = Math.round((base * longDistMult * (1 + weekendAdd) + fuel + addonTotal) / 5) * 5;
  const highExtra = hourly * (maxHrs - minHrs);
  const high = Math.round((low + highExtra) / 5) * 5;

  const lines: { label: string; amount: number }[] = [
    { label: `Base rate (truck + ${size === "Studio" || size === "1 Bedroom" ? "2" : "3"} movers, ${minHrs}hr min)`, amount: Math.round(base * longDistMult) },
    { label: `Fuel${type === "Long Distance" ? " & mileage" : ""}`, amount: fuel },
  ];

  if (weekend) {
    lines.push({ label: "Weekend rate (+10%)", amount: Math.round(base * longDistMult * WEEKEND_SURCHARGE) });
  }

  ADDONS.filter((a) => selectedAddons.has(a.id)).forEach((a) => {
    lines.push({ label: a.label, amount: a.price });
  });

  return { low, high, lines };
}

export default function QuotePage() {
  const { updateMove, requestQuoteVisit } = useMove();
  const router = useRouter();

  const [size, setSize] = useState<MoveSize>("1 Bedroom");
  const [type, setType] = useState<MoveType>("Local");
  const [addons, setAddons] = useState<Set<string>>(new Set());
  const [weekend, setWeekend] = useState(false);

  // In-home assessment form state
  const [visitOpen, setVisitOpen] = useState(false);
  const [visitName, setVisitName] = useState("");
  const [visitPhone, setVisitPhone] = useState("");
  const [visitAddress, setVisitAddress] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("Morning");
  const [visitSubmitting, setVisitSubmitting] = useState(false);

  const { low, high, lines } = calcQuote(size, type, addons, weekend);

  function toggleAddon(id: string) {
    setAddons((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleBook() {
    updateMove({ moveType: type, moveSize: size });
    router.push("/");
  }

  function handleRequestVisit(e: React.FormEvent) {
    e.preventDefault();
    setVisitSubmitting(true);
    requestQuoteVisit({
      clientName: visitName.trim() || "Demo Customer",
      clientPhone: visitPhone.trim() || "(555) 555-5555",
      address: visitAddress.trim() || "123 Demo St, Apt 4B",
      preferredDate: visitDate || "2026-03-12",
      preferredTime: visitTime,
    });
    setTimeout(() => {
      router.push("/quote-visit");
    }, 600);
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="bg-navy-900 px-5 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <a
            href="/"
            className="flex items-center gap-1 text-navy-300 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </a>
          <div className="flex items-center gap-2 ml-2">
            <Truck className="text-amber-400 w-4 h-4" />
            <span className="text-white font-heading font-semibold text-sm">TrustMovers</span>
          </div>
        </div>
      </header>

      <div className="px-4 pt-6 pb-8 max-w-lg mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">Instant Quote</h1>
          <p className="text-slate-500 text-sm mt-1">
            No hidden fees. Price guaranteed when you book.
          </p>
        </div>

        {/* Live price card */}
        <div className="bg-navy-900 rounded-2xl px-5 py-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 80% 20%, oklch(70% 0.17 65) 0%, transparent 60%)",
          }} />
          <p className="text-navy-300 text-xs font-semibold uppercase tracking-wide mb-2">
            Estimated cost
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-heading font-bold text-white">
              <AnimatedPrice value={low} />
            </span>
            <span className="text-navy-400 text-2xl font-semibold">–</span>
            <span className="text-4xl font-heading font-bold text-amber-400">
              <AnimatedPrice value={high} />
            </span>
          </div>
          <p className="text-navy-400 text-xs mt-2">
            Final price depends on actual hours · No surprises
          </p>
        </div>

        {/* Move size */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">How big is your move?</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {(["Studio", "1 Bedroom", "2 Bedroom", "3+ Bedrooms"] as MoveSize[]).map((s) => {
              const active = size === s;
              const detail = SIZE_DETAILS[s];
              return (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-2xl border p-3.5 text-left transition-all duration-150 cursor-pointer ${
                    active
                      ? "bg-navy-900 border-navy-900"
                      : "bg-white border-slate-200 hover:border-navy-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <p className={`text-sm font-bold leading-tight ${active ? "text-white" : "text-navy-900"}`}>
                      {s}
                    </p>
                    {active && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-xs ${active ? "text-navy-300" : "text-slate-500"}`}>
                    {detail.rooms}
                  </p>
                  <p className={`text-xs mt-0.5 ${active ? "text-navy-400" : "text-slate-400"}`}>
                    {detail.examples}
                  </p>
                  <p className={`text-xs font-semibold mt-2 ${active ? "text-amber-400" : "text-navy-600"}`}>
                    From ${BASE_RATES[s]}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Move type */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Move type</h2>
          <div className="flex gap-2">
            {(["Local", "Long Distance"] as MoveType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  type === t
                    ? "bg-navy-900 border-navy-900 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-navy-300"
                }`}
              >
                {t === "Local" ? "Local (within city)" : "Long Distance (100+ mi)"}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {type === "Long Distance" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mt-2 flex items-start gap-1.5 overflow-hidden"
              >
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                Long-distance rate includes fuel, tolls, and additional mileage charges.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* Day type */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Moving day</h2>
          <div className="flex gap-2">
            {[
              { label: "Weekday", subtitle: "Mon–Thu · Best rate", value: false },
              { label: "Weekend", subtitle: "Fri–Sun · +10% surcharge", value: true },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setWeekend(opt.value)}
                className={`flex-1 py-3 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                  weekend === opt.value
                    ? "bg-navy-900 border-navy-900"
                    : "bg-white border-slate-200 hover:border-navy-300"
                }`}
              >
                <p className={`text-sm font-semibold ${weekend === opt.value ? "text-white" : "text-slate-700"}`}>
                  {opt.label}
                </p>
                <p className={`text-xs mt-0.5 ${weekend === opt.value ? "text-navy-300" : "text-slate-400"}`}>
                  {opt.subtitle}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Add-ons */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Add-ons</h2>
          <div className="space-y-2">
            {ADDONS.map((addon) => {
              const active = addons.has(addon.id);
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    active
                      ? "bg-navy-50 border-navy-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    active ? "bg-navy-900 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {addon.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${active ? "text-navy-900" : "text-slate-800"}`}>
                      {addon.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{addon.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold ${active ? "text-navy-900" : "text-slate-600"}`}>
                      +${addon.price}
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      active
                        ? "bg-navy-900 border-navy-900"
                        : "bg-white border-slate-300"
                    }`}>
                      {active
                        ? <Minus className="w-3 h-3 text-white" />
                        : <Plus className="w-3 h-3 text-slate-400" />
                      }
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Breakdown */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-navy-900">Cost breakdown</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            {lines.map((line, i) => (
              <motion.div
                key={line.label}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-start justify-between gap-3"
              >
                <span className="text-sm text-slate-600 leading-snug">{line.label}</span>
                <span className="text-sm font-semibold text-slate-800 flex-shrink-0">${line.amount}</span>
              </motion.div>
            ))}

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-navy-900">Estimated range</span>
                <span className="text-sm font-bold text-navy-900">
                  <AnimatedPrice value={low} />–<AnimatedPrice value={high} />
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Billed by the hour after the {HOUR_RANGES[size][0]}-hour minimum.
                Rate: ${HOURLY_RATE[size]}/hr.
              </p>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Shield className="w-4 h-4" />, label: "Fully insured" },
            { icon: <Zap className="w-4 h-4" />, label: "No hidden fees" },
            { icon: <CheckCircle2 className="w-4 h-4" />, label: "Price locked on booking" },
          ].map((b) => (
            <div key={b.label} className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center gap-1.5 text-center">
              <div className="text-emerald-600">{b.icon}</div>
              <p className="text-[11px] font-medium text-slate-600 leading-tight">{b.label}</p>
            </div>
          ))}
        </div>

        {/* In-home assessment option */}
        <div>
          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 flex-shrink-0 font-medium">or get a free walk-through</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setVisitOpen((v) => !v)}
              className="w-full px-4 py-4 flex items-center gap-3 cursor-pointer text-left"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-navy-900">In-Home Assessment</p>
                <p className="text-xs text-slate-500 mt-0.5">We come to you — exact quote, on the spot</p>
              </div>
              <motion.div animate={{ rotate: visitOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {visitOpen && (
                <motion.div
                  key="visit-form"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mt-3 mb-4 leading-relaxed">
                      An assessor walks through your home, inventories everything, and gives you an exact price — no estimates, no surprises. The whole visit takes about 20 minutes.
                    </p>

                    <form onSubmit={handleRequestVisit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your name</label>
                          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-amber-400 transition-colors bg-white">
                            <input
                              type="text"
                              placeholder="Full name"
                              value={visitName}
                              onChange={(e) => setVisitName(e.target.value)}
                              className="flex-1 text-sm text-slate-800 outline-none bg-transparent min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-amber-400 transition-colors bg-white">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <input
                              type="tel"
                              placeholder="(555) 000-0000"
                              value={visitPhone}
                              onChange={(e) => setVisitPhone(e.target.value)}
                              className="flex-1 text-sm text-slate-800 outline-none bg-transparent min-w-0"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Home address</label>
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-amber-400 transition-colors bg-white">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <input
                            type="text"
                            placeholder="123 Main St, Apt 4B"
                            value={visitAddress}
                            onChange={(e) => setVisitAddress(e.target.value)}
                            className="flex-1 text-sm text-slate-800 outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preferred date</label>
                          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-amber-400 transition-colors bg-white">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <input
                              type="date"
                              value={visitDate}
                              onChange={(e) => setVisitDate(e.target.value)}
                              className="flex-1 text-sm text-slate-800 outline-none bg-transparent min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Time preference</label>
                          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-amber-400 transition-colors bg-white">
                            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <select
                              value={visitTime}
                              onChange={(e) => setVisitTime(e.target.value)}
                              className="flex-1 text-sm text-slate-800 outline-none bg-transparent min-w-0 cursor-pointer"
                            >
                              <option>Morning</option>
                              <option>Afternoon</option>
                              <option>Evening</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={visitSubmitting}
                        className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] disabled:opacity-60 text-white font-heading font-bold text-sm py-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 mt-1 mb-1 shadow-lg shadow-amber-500/20"
                      >
                        {visitSubmitting ? (
                          <>Scheduling…</>
                        ) : (
                          <>
                            <Home className="w-4 h-4" />
                            Request Free Walk-Through
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <p className="text-center text-[11px] text-slate-400 pb-1">
                        Free, no obligation. We'll confirm within the hour.
                      </p>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-20 safe-bottom">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500">Your estimate</p>
              <p className="text-lg font-heading font-bold text-navy-900">
                <AnimatedPrice value={low} /> – <AnimatedPrice value={high} />
              </p>
            </div>
            <button
              onClick={handleBook}
              className="bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-heading font-bold text-sm px-6 py-3 rounded-2xl cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              Book this move
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Your selections will be carried into the booking form.
          </p>
        </div>
      </div>
    </main>
  );
}
