"use client"

import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

type ToastKind = 'success' | 'error'
type Toast = { id: number, kind: ToastKind, message: string }
type ShowToast = (message: string, kind?: ToastKind) => void

// No-op default so components still render outside the provider (e.g. tests)
const ToastContext = createContext<ShowToast>(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const nextId = useRef(0)

    const show = useCallback<ShowToast>((message, kind = 'success') => {
        const id = nextId.current++
        setToasts((prev) => [...prev, { id, kind, message }])
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), kind === 'error' ? 6000 : 3500)
    }, [])

    return (
        <ToastContext.Provider value={show}>
            {children}
            {/* Above Radix dialogs (z-50); sits above the mobile add button */}
            <div
                className="fixed inset-x-4 bottom-24 sm:bottom-4 sm:left-auto sm:right-4 z-[100] flex flex-col items-end gap-2 pointer-events-none"
                role="status"
                aria-live="polite"
            >
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2.5 w-full sm:w-auto sm:max-w-sm rounded-xl border border-card-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-card"
                        >
                            {t.kind === 'success'
                                ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                : <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />}
                            <span>{t.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}
