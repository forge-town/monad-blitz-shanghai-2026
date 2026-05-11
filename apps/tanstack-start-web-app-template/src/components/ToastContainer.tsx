import type { FC } from "react";
import { useStore } from "zustand";
import { useToastStore } from "@/store/toastStore";

export const ToastContainer: FC = () => {
  const store = useToastStore();
  const toasts = useStore(store, (s) => s.toasts);
  const removeToast = useStore(store, (s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const handleClose = () => removeToast(toast.id);

        return (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 shadow-lg ${
              toast.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{toast.title}</p>
                {toast.description ? (
                  <p className="text-sm opacity-80">{toast.description}</p>
                ) : null}
              </div>
              <button
                className="text-current opacity-50 hover:opacity-100"
                type="button"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
