"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink, ArrowRight, ThumbsUp, MessageSquare, X } from "lucide-react";
import { useMove } from "@/context/MoveContext";

const STAR_LABELS = ["", "Poor", "Below average", "Good", "Great", "Excellent!"];

const HIGH_MESSAGES = [
  "You're making Marcus's day.",
  "This means the world to the crew.",
  "Takes 30 seconds. Helps us more than you know.",
];

// Confetti particle
function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  const colors = ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#F97316"];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => {
        const color = colors[i % colors.length];
        const left = `${5 + (i * 37) % 90}%`;
        const delay = (i * 0.08) % 0.8;
        const size = 6 + (i % 4) * 3;
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ y: 320, x: (i % 2 === 0 ? 1 : -1) * (20 + (i * 13) % 60), opacity: 0, rotate: (i % 2 === 0 ? 180 : -180), scale: 0.3 }}
            transition={{ duration: 1.4, delay, ease: "easeIn" }}
            className="absolute rounded-sm"
            style={{ left, top: 0, width: size, height: size, backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}

export function RatingGate() {
  const { move, submitRating } = useMove();
  const router = useRouter();

  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [stage, setStage] = useState<"rate" | "share" | "escalate" | "done">("rate");
  const [showConfetti, setShowConfetti] = useState(false);

  // Don't render if already rated or move not complete
  if (move.hasRated || move.status < 5) return null;

  const displayStars = hovered || stars;
  const isHighRating = stars >= 4;

  function handleStarSelect(n: number) {
    setStars(n);
  }

  function handleSubmit() {
    submitRating(stars, comment);
    if (isHighRating) {
      setStage("share");
      setShowConfetti(true);
    } else {
      setStage("escalate");
    }
  }

  function handleDone() {
    setStage("done");
    setTimeout(() => router.push("/summary"), 600);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "oklch(15% 0.04 245)" }}
    >
      <AnimatePresence mode="wait">

        {/* ---- Stage: Rate ---- */}
        {stage === "rate" && (
          <motion.div
            key="rate"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1 flex flex-col px-6 pt-12 pb-8"
          >
            {/* Crew avatar stack */}
            <div className="flex justify-center mb-8">
              <div className="flex -space-x-3">
                {["M", "J", "D"].map((initial, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-2 border-navy-900 flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: ["oklch(45% 0.15 245)", "oklch(55% 0.14 65)", "oklch(40% 0.12 160)"][i] }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
            </div>

            <h1 className="text-center text-white font-heading font-bold text-2xl mb-2">
              How was your move today?
            </h1>
            <p className="text-center text-navy-300 text-sm mb-5">
              Your crew is still here — tap a star to rate them.
            </p>

            {/* $50 incentive */}
            <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <p className="text-amber-300 text-sm font-bold">Leave a review, get $50 off</p>
                <p className="text-amber-500 text-xs mt-0.5">Post on Google and show your crew — we'll apply $50 to your invoice right now.</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => handleStarSelect(n)}
                  className="cursor-pointer transition-transform active:scale-90"
                >
                  <motion.div
                    animate={{
                      scale: displayStars >= n ? 1.15 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Star
                      className="w-12 h-12 transition-colors duration-100"
                      fill={displayStars >= n ? "#F59E0B" : "transparent"}
                      stroke={displayStars >= n ? "#F59E0B" : "oklch(50% 0.04 245)"}
                      strokeWidth={1.5}
                    />
                  </motion.div>
                </button>
              ))}
            </div>

            {/* Label */}
            <AnimatePresence mode="wait">
              {displayStars > 0 && (
                <motion.p
                  key={displayStars}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-amber-400 font-semibold text-base mb-8"
                >
                  {STAR_LABELS[displayStars]}
                </motion.p>
              )}
              {displayStars === 0 && (
                <div className="mb-8 h-6" />
              )}
            </AnimatePresence>

            {/* Comment box — appears after star selected */}
            <AnimatePresence>
              {stars > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={stars >= 4 ? "Anything specific you loved? (optional)" : "Tell us what went wrong so we can fix it…"}
                    rows={3}
                    className="w-full bg-navy-800 border border-navy-700 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-navy-500 resize-none outline-none focus:border-amber-500 transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <AnimatePresence>
              {stars > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSubmit}
                  className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-white font-heading font-bold text-base py-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 mb-4"
                >
                  Submit Rating
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Skip */}
            <button
              onClick={handleDone}
              className="text-center text-navy-500 text-xs hover:text-navy-400 transition-colors cursor-pointer mx-auto block mt-auto"
            >
              Skip for now
            </button>
          </motion.div>
        )}

        {/* ---- Stage: Share (4–5 stars) ---- */}
        {stage === "share" && (
          <motion.div
            key="share"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1 flex flex-col px-6 pt-12 pb-10 relative overflow-hidden"
          >
            {showConfetti && <Confetti />}

            {/* Star display */}
            <div className="flex justify-center gap-1.5 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="w-7 h-7"
                  fill={n <= stars ? "#F59E0B" : "transparent"}
                  stroke={n <= stars ? "#F59E0B" : "oklch(40% 0.04 245)"}
                />
              ))}
            </div>

            <h2 className="text-center text-white font-heading font-bold text-2xl mb-2">
              {stars === 5 ? "You're amazing!" : "Really glad to hear it!"}
            </h2>
            <p className="text-center text-navy-300 text-sm mb-5">
              {HIGH_MESSAGES[stars % HIGH_MESSAGES.length]}
            </p>

            {/* $50 prompt */}
            <div className="bg-amber-500 rounded-2xl px-4 py-3.5 flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Get $50 off your invoice</p>
                <p className="text-amber-100 text-xs mt-0.5">Post a review below, show your crew the screenshot — $50 off, right now.</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <a
                href="https://g.page/r/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-slate-600">G</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Post on Google</p>
                  <p className="text-xs text-slate-500">Most impactful · helps neighbors find us</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>

              <a
                href="https://yelp.com/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-red-500">y</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Post on Yelp</p>
                  <p className="text-xs text-slate-500">Your experience matters</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            <button
              onClick={handleDone}
              className="w-full bg-navy-800 hover:bg-navy-700 text-white font-semibold text-sm py-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 mb-3"
            >
              View my move summary
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleDone}
              className="text-center text-navy-500 text-xs hover:text-navy-400 cursor-pointer mx-auto block transition-colors"
            >
              Skip sharing
            </button>
          </motion.div>
        )}

        {/* ---- Stage: Escalate (1–3 stars) ---- */}
        {stage === "escalate" && (
          <motion.div
            key="escalate"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1 flex flex-col px-6 pt-12 pb-10"
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-center text-white font-heading font-bold text-2xl mb-2">
              We want to make this right
            </h2>
            <p className="text-center text-navy-300 text-sm mb-8">
              A manager will reach out within 2 hours to resolve any issues.
            </p>

            <div className="bg-navy-800 rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} className="w-4 h-4" fill={n <= stars ? "#F59E0B" : "transparent"} stroke={n <= stars ? "#F59E0B" : "oklch(40% 0.04 245)"} />
                  ))}
                </div>
                <span className="text-navy-300 text-sm">{STAR_LABELS[stars]}</span>
              </div>
              {comment && (
                <p className="text-navy-200 text-sm italic">"{comment}"</p>
              )}
            </div>

            <div className="bg-navy-800 rounded-2xl p-4 mb-8 flex items-start gap-3">
              <ThumbsUp className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold">Your feedback is private</p>
                <p className="text-navy-400 text-xs mt-0.5">
                  This goes directly to our ops team — not published anywhere.
                </p>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-white font-heading font-bold text-base py-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              View my move summary
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ---- Stage: Done (transition) ---- */}
        {stage === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-emerald-400" />
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
