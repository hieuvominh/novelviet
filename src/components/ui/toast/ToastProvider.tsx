"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { _setToastHandler } from "./toast";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: string; type: ToastType; message: string };

type ToastContextValue = {
  push: (t: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback(({ type, message }: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const item: ToastItem = { id, type, message };
    setToasts((t) => [item, ...t]);

    // Auto dismiss after 3.5s
    window.setTimeout(() => {
      setToasts((curr) => curr.filter((x) => x.id !== id));
    }, 3500);

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // Wire module-level toast API
  useEffect(() => {
    _setToastHandler((p) => {
      push(p);
    });
    return () => _setToastHandler(null);
  }, [push]);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    // pointer-events-none so container doesn't block underlying UI; individual toasts are interactive
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col-reverse gap-3 pointer-events-none"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const Toast: React.FC<{
  toast: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const { id, type, message } = toast;

  const bgClass =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";

  return (
    <div
      role="status"
      aria-live="polite"
      tabIndex={0}
      // make toast interactive while container is pointer-events-none
      className={`pointer-events-auto max-w-sm w-full ${bgClass} text-white px-4 py-3 rounded shadow-lg ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 text-sm">
          <div className="font-medium">{message}</div>
        </div>
        <div>
          <button
            aria-label="Dismiss notification"
            onClick={() => onDismiss(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onDismiss(id);
            }}
            className="text-white opacity-90 hover:opacity-100 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastProvider;
