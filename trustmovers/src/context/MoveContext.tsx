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
export type PhotoLabel = "Before" | "After" | "Note";
export type NotificationType = "status" | "estimate" | "photo" | "payment" | "system";
export type PaymentStatus = "unpaid" | "processing" | "paid";

export interface QueueEntry {
  id: string;
  clientName: string;
  moveSize: MoveSize;
  timeWindow: string;
  fromAddress: string;
  completed: boolean;
  isLive?: boolean;
}

export interface NotificationEntry {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PhotoEntry {
  id: string;
  dataUrl: string;
  label: PhotoLabel;
  caption: string;
  uploadedAt: string;
}

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
  paymentStatus: PaymentStatus;
  paymentPaidAt: string | null;
  hasRated: boolean;
  rating: number | null;
  ratingComment: string;
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
  paymentStatus: "unpaid",
  paymentPaidAt: null,
  hasRated: false,
  rating: null,
  ratingComment: "",
};

const STORAGE_KEY = "trustmovers_demo_state";

const INITIAL_QUEUE: QueueEntry[] = [
  { id: "q1", clientName: "Martinez Family", moveSize: "Studio",       timeWindow: "8:00 AM",  fromAddress: "41 Birch Ln",       completed: true },
  { id: "q2", clientName: "Rivera Family",   moveSize: "2 Bedroom",    timeWindow: "10:30 AM", fromAddress: "77 Oak Glen Ct",    completed: false },
  { id: "q3", clientName: "Chen Household",  moveSize: "1 Bedroom",    timeWindow: "1:00 PM",  fromAddress: "204 Cedar Ave",     completed: false },
  { id: "q4", clientName: "",               moveSize: "1 Bedroom",    timeWindow: "3:30 PM",  fromAddress: "",                  completed: false, isLive: true },
  { id: "q5", clientName: "Thompson Move",   moveSize: "3+ Bedrooms",  timeWindow: "5:00 PM",  fromAddress: "88 Willowbrook Dr", completed: false },
];

interface MoveContextValue {
  move: MoveData;
  photos: PhotoEntry[];
  notifications: NotificationEntry[];
  unreadCount: number;
  updateMove: (partial: Partial<MoveData>) => void;
  submitForm: (formData: Partial<MoveData>) => void;
  advanceStatus: () => void;
  setStatus: (s: MoveStatus) => void;
  approveEstimate: () => void;
  completeMove: () => void;
  resetDemo: () => void;
  addPhoto: (photo: Omit<PhotoEntry, "id" | "uploadedAt">) => void;
  removePhoto: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  processPayment: () => void;
  submitRating: (rating: number, comment: string) => void;
  dailyQueue: QueueEntry[];
  queuePosition: number;
  markQueueJobDone: (id: string) => void;
}

const MoveContext = createContext<MoveContextValue | null>(null);

const STATUS_NOTIFICATIONS: Record<number, { title: string; message: string }> = {
  1: { title: "Deposit Received", message: "Your move is locked in. We'll confirm details shortly." },
  2: { title: "Move Confirmed", message: "You're all set. Your crew is assigned and ready for move day." },
  3: { title: "Crew En Route", message: "Your movers are heading over — ETA about 25 min." },
  4: { title: "Crew Has Arrived", message: "Your team is at the pickup address and getting set up." },
  5: { title: "Move Complete", message: "All done. Check your summary for photos and details." },
};

function makeNotification(
  type: NotificationType,
  title: string,
  message: string
): NotificationEntry {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    message,
    timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    read: false,
  };
}

export function MoveProvider({ children }: { children: ReactNode }) {
  const [move, setMove] = useState<MoveData>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  // Photos, notifications, and queue are in-memory only
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [dailyQueue, setDailyQueue] = useState<QueueEntry[]>(INITIAL_QUEUE);

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
        paymentStatus: "unpaid" as PaymentStatus,
        paymentPaidAt: null,
        hasRated: false,
        rating: null,
        ratingComment: "",
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
      const notifData = STATUS_NOTIFICATIONS[next];
      if (notifData) {
        setNotifications((n) => [makeNotification("status", notifData.title, notifData.message), ...n]);
      }
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
    setNotifications((n) => [
      makeNotification("estimate", "Estimate Approved", "Your crew can get moving. Everything looks good on our end."),
      ...n,
    ]);
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

  const processPayment = useCallback(() => {
    setMove((prev) => {
      const updated = { ...prev, paymentStatus: "processing" as PaymentStatus };
      persist(updated);
      return updated;
    });
    setTimeout(() => {
      const paidAt = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      setMove((prev) => {
        const updated = { ...prev, paymentStatus: "paid" as PaymentStatus, paymentPaidAt: paidAt };
        persist(updated);
        return updated;
      });
      setNotifications((n) => [
        makeNotification("payment", "Payment Received", "Balance of $430 processed. Your receipt is saved."),
        ...n,
      ]);
    }, 2000);
  }, [persist]);

  const submitRating = useCallback(
    (rating: number, comment: string) => {
      setMove((prev) => {
        const updated = { ...prev, hasRated: true, rating, ratingComment: comment };
        persist(updated);
        return updated;
      });
      setNotifications((n) => [
        makeNotification(
          "system",
          rating >= 4 ? "Thanks for the review!" : "Feedback received",
          rating >= 4
            ? `${rating}-star review submitted. We really appreciate it!`
            : "Your feedback helps us improve. A manager will follow up."
        ),
        ...n,
      ]);
    },
    [persist]
  );

  const markQueueJobDone = useCallback((id: string) => {
    setDailyQueue((prev) => {
      const updated = prev.map((j) => j.id === id ? { ...j, completed: true } : j);
      // Check if the live customer moved up to next position
      const liveIdx = updated.findIndex((j) => j.isLive);
      const newPosition = updated.slice(0, liveIdx).filter((j) => !j.completed).length;
      if (newPosition === 0) {
        setNotifications((n) => [
          makeNotification("status", "You're up next!", "The crew is wrapping up their current job and heading your way soon."),
          ...n,
        ]);
      } else if (newPosition === 1) {
        setNotifications((n) => [
          makeNotification("status", "One job ahead of you", "Your crew is getting closer. Get ready!"),
          ...n,
        ]);
      }
      return updated;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addPhoto = useCallback((photo: Omit<PhotoEntry, "id" | "uploadedAt">) => {
    const entry: PhotoEntry = {
      ...photo,
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      uploadedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    setPhotos((prev) => [...prev, entry]);
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetDemo = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setMove(DEFAULT_STATE);
    setPhotos([]);
    setNotifications([]);
    setDailyQueue(INITIAL_QUEUE);
  }, []);

  if (!hydrated) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const liveIdx = dailyQueue.findIndex((j) => j.isLive);
  const queuePosition = liveIdx >= 0
    ? dailyQueue.slice(0, liveIdx).filter((j) => !j.completed).length
    : 0;

  return (
    <MoveContext.Provider
      value={{
        move,
        photos,
        notifications,
        unreadCount,
        updateMove,
        submitForm,
        advanceStatus,
        setStatus,
        approveEstimate,
        completeMove,
        resetDemo,
        addPhoto,
        removePhoto,
        markRead,
        markAllRead,
        processPayment,
        submitRating,
        dailyQueue,
        queuePosition,
        markQueueJobDone,
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
