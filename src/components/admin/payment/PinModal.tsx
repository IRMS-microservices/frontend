"use client";

import { LockKeyhole, X } from "lucide-react";
import { PinCodeInput } from "./PinCodeInput";

interface PinModalProps {
  open: boolean;
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitting?: boolean;
  error?: string;
}

export function PinModal({
  open,
  title,
  description,
  value,
  onChange,
  onSubmit,
  onClose,
  submitting = false,
  error,
}: PinModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-4xl bg-white px-8 py-10 text-center shadow-2xl shadow-slate-950/20">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F4EF] text-irms-green">
          <LockKeyhole className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-bold text-irms-text-primary">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
          {description}
        </p>

        <div className="mt-8 flex justify-center">
          <PinCodeInput value={value} onChange={onChange} autoFocus />
        </div>

        {error && (
          <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || value.length !== 6}
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-irms-green px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-irms-green/25 transition hover:bg-irms-green-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Verifying..." : "Verify PIN"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 text-sm font-bold uppercase tracking-[0.15em] text-gray-500 transition hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
