"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type MoveStatus = 0 | 1 | 2 | 3 | 4 | 5;
export type MoveType = "Local" | "Long Distance";
export type MoveSize = "Studio" | "1 Bedroom" | "2 Bedroom" | "3+ Bedrooms";
export type TimeWindow = "Morning" | "Afternoon" | "Evening" | "ASAP";

export interface MoveHistoryEntry {
  id: string;
  date: string;
  moveType: MoveType;
  moveSize: MoveSize;
  fromAddress: string;
  toAddress: string;
  leadMover: string;
  finalTotal: string;
}

export interface MoveData {
  clientName: string;
  clientPhone: string;
  fromAddress: string;
  toAddress: string;
  moveType: MoveType;
  moveSize: MoveSize;
  notes: string;
  preferredDate: string;
  timeWindow: TimeWindow;
  status: MoveStatus;
  estimateApproved: boolean;
  estimateApprovedAt: string | null;
  moveHistory: MoveHistoryEntry[];
  hasSubmitted: boolean;
}

const DEMO_HISTORY: MoveHistoryEntry[] = [
  {
    id: "hist-1",
    date: "Jan 15, 2025",
    moveType: "Local",
    moveSize: "2 Bedroom",
    fromAddress: "200 Pine Rd",
    toAddress: "88 Oak St",
    leadMover: "Carlos M.",
    finalTotal: "$680",
  },
  {
    id: "hist-2",
    date: "Sep 8, 2025",
    moveType: "Local",
    moveSize: "Studio",
    fromAddress: "88 Oak St",
    toAddress: "123 Demo St",
    leadMover: "Marcus T.",
    finalTotal: "$420",
  },
];

const DEFAULT_STATE: MoveData = {
  clientName: "",
  clientPhone: "",
  fromAddress: "",
  toAddress: "",
  moveType: "Local",
  moveSize: "1 Bedroom",
  notes: "",
  preferredDate: "",
  timeWindow: "Morning",
  status: 0,
  estimateApproved: false,
  estimateApprovedAt: null,
  moveHistory: DEMO_HISTORY,
  hasSubmitted: false,
};

const STORAGE_KEY = "trustmovers_demo_state";

interface MoveContextValue {
  move: MoveData;
  updateMove: (partial: Partial<MoveData>) => void;
  submitForm: (formData: Partial<MoveData>) => void;
  advanceStatus: () => void;
  setStatus: (s: MoveStatus) => void;
  approveEstimate: () => void;
  completeMove: () => void;
  resetDemo: () => void;
}

const MoveContext = createContext<MoveContextValue | null>(null);

export function MoveProvider({ children }: { children: ReactNode }) {
  const [move, setMove] = useState<MoveData>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MoveData;
        setMove({ ...DEFAULT_STATE, ...parsed });
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((data: MoveData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }, []);

  const updateMove = useCallback(
    (partial: Partial<MoveData>) => {
      setMove((prev) => {
        const next = { ...prev, ...partial };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const submitForm = useCallback(
    (formData: Partial<MoveData>) => {
      const filled: Partial<MoveData> = {
        clientName: formData.clientName?.trim() || "Demo Customer",
        clientPhone: formData.clientPhone?.trim() || "(555) 555-5555",
        fromAddress: formData.fromAddress?.trim() || "123 Demo St, Apt 4B",
        toAddress: formData.toAddress?.trim() || "456 New Home Ave",
        moveType: formData.moveType || "Local",
        moveSize: formData.moveSize || "1 Bedroom",
        notes: formData.notes || "",
        preferredDate: formData.preferredDate || "2026-03-12",
        timeWindow: formData.timeWindow || "Morning",
        status: 0,
        estimateApproved: false,
        estimateApprovedAt: null,
        hasSubmitted: true,
      };
      setMove((prev) => {
        const next = { ...prev, ...filled };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const advanceStatus = useCallback(() => {
    setMove((prev) => {
      const next = Math.min(prev.status + 1, 5) as MoveStatus;
      const updated = { ...prev, status: next };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const setStatus = useCallback(
    (s: MoveStatus) => {
      setMove((prev) => {
        const updated = { ...prev, status: s };
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const approveEstimate = useCallback(() => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    setMove((prev) => {
      const updated = {
        ...prev,
        estimateApproved: true,
        estimateApprovedAt: time,
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const completeMove = useCallback(() => {
    setMove((prev) => {
      const newEntry: MoveHistoryEntry = {
        id: `hist-current-${Date.now()}`,
        date: "Mar 12, 2026",
        moveType: prev.moveType,
        moveSize: prev.moveSize,
        fromAddress: prev.fromAddress,
        toAddress: prev.toAddress,
        leadMover: "Marcus T.",
        finalTotal: "$580",
      };
      const alreadyExists = prev.moveHistory.some(
        (h) => h.id === newEntry.id || h.date === "Mar 12, 2026"
      );
      const updated = {
        ...prev,
        status: 5 as MoveStatus,
        moveHistory: alreadyExists
          ? prev.moveHistory
          : [newEntry, ...prev.moveHistory],
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const resetDemo = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setMove(DEFAULT_STATE);
  }, []);

  if (!hydrated) return null;

  return (
    <MoveContext.Provider
      value={{
        move,
        updateMove,
        submitForm,
        advanceStatus,
        setStatus,
        approveEstimate,
        completeMove,
        resetDemo,
      }}
    >
      {children}
    </MoveContext.Provider>
  );
}

export function useMove() {
  const ctx = useContext(MoveContext);
  if (!ctx) throw new Error("useMove must be used within MoveProvider");
  return ctx;
}
