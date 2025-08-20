"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

type ShowToastOptions = {
    title?: string;
    message: string;
    variant?: ToastVariant;
    durationMs?: number;
};

type ToastItem = Required<Pick<ShowToastOptions, "message">> & {
    id: string;
    variant: ToastVariant;
    durationMs: number;
    title?: string;
};

type ToastContextValue = {
    showToast: (options: ShowToastOptions) => string;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function generateId(): string {
    if (
        typeof globalThis !== "undefined" &&
        typeof globalThis.crypto !== "undefined" &&
        typeof globalThis.crypto.randomUUID === "function"
    ) {
        return globalThis.crypto.randomUUID();
    }
    return String(Date.now() + Math.random());
}

function getVariantVisuals(
    variant: ToastVariant
): {
    bgClass: string;
    textClass: string;
    icon: string;
    closeBtnClass: string;
} {
    switch (variant) {
        case "success":
            return {
                bgClass: "bg-[#4CAF50]",
                textClass: "text-white",
                icon: "✔",
                closeBtnClass: "text-white/80 hover:text-white"
            };
        case "error":
            return {
                bgClass: "bg-[#F44336]",
                textClass: "text-white",
                icon: "❌",
                closeBtnClass: "text-white/80 hover:text-white"
            };
        case "warning":
            return {
                bgClass: "bg-[#FF9800]",
                textClass: "text-black",
                icon: "⚠️",
                closeBtnClass: "text-black/70 hover:text-black"
            };
        case "info":
        default:
            return {
                bgClass: "bg-[#2196F3]",
                textClass: "text-white",
                icon: "ℹ️",
                closeBtnClass: "text-white/80 hover:text-white"
            };
    }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((current) => current.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        ({ title, message, variant = "info", durationMs }: ShowToastOptions) => {
            const id = generateId();
            const autoClose = durationMs ?? (variant === "warning" || variant === "error" ? 5000 : 3000);
            const next: ToastItem = { id, title, message, variant, durationMs: autoClose };
            setToasts((current) => [...current, next]);
            window.setTimeout(() => removeToast(id), autoClose);
            return id;
        },
        [removeToast]
    );

    const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                className="pointer-events-none fixed z-50 bottom-4 left-1/2 -translate-x-1/2 md:top-4 md:right-4 md:left-auto md:translate-x-0 md:bottom-auto flex flex-col gap-2 items-stretch md:items-end"
                role="region"
                aria-live="polite"
                aria-atomic="true"
            >
                {toasts.map((t) => {
                    const visuals = getVariantVisuals(t.variant);
                    return (
                        <div
                            key={t.id}
                            className="toast-enter w-[min(92vw,420px)] pointer-events-auto rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
                            role="status"
                            aria-live="polite"
                        >
                            <div className={`flex items-start gap-3 px-4 py-3 text-sm ${visuals.bgClass} ${visuals.textClass}`}>
                                <span aria-hidden="true" className="select-none text-base leading-5">
                                    {visuals.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    {t.title ? <p className="font-semibold mb-0.5">{t.title}</p> : null}
                                    <p className="leading-5">{t.message}</p>
                                </div>
                                <button
                                    onClick={() => removeToast(t.id)}
                                    className={`ml-2 -mr-1 inline-flex h-6 w-6 items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white/30 ${visuals.closeBtnClass}`}
                                    aria-label="Close notification"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return ctx;
}

export default ToastProvider;


