import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ToastContext = createContext(null);

const icons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 300);
  };

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type, exiting: false }]);
    window.setTimeout(() => removeToast(id), 4000);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-lg backdrop-blur-sm transition-all duration-300 ${
              toast.exiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0 animate-slide-down"
            } ${
              toast.type === "success"
                ? "border-brand-200 bg-brand-50/95 text-brand-800"
                : toast.type === "error"
                  ? "border-rose-200 bg-rose-50/95 text-rose-800"
                  : "border-blue-200 bg-blue-50/95 text-blue-800"
            }`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
              toast.type === "success" ? "bg-brand" : toast.type === "error" ? "bg-rose-500" : "bg-blue-500"
            }`}>
              {icons[toast.type] || icons.info}
            </span>
            <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-auto shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
