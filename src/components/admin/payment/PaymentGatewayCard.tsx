"use client";

import { Eye, Power } from "lucide-react";
import Link from "next/link";
import {
  PaymentCredentialsResponse,
  PaymentMethodResponse,
} from "@/types/payment.types";

interface PaymentGatewayCardProps {
  method?: PaymentMethodResponse;
  credentials: PaymentCredentialsResponse;
  href: string;
}

export function PaymentGatewayCard({
  method,
  credentials,
  href,
}: PaymentGatewayCardProps) {
  const isActive = credentials.isActive;
  const statusLabel = isActive ? "ACTIVE" : "STANDBY";
  const statusTone = isActive
    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
    : "bg-slate-50 text-slate-500 ring-slate-200";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F6F7] ring-1 ring-black/5">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-irms-text-primary">
              {(method?.name ?? "GW").slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-irms-text-primary">
              {method?.name ?? "Payment Gateway"}
            </h3>
            <p className="text-xs text-gray-500">
              {method?.code ?? credentials.paymentMethodId}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ${statusTone}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}
          />
          {statusLabel}
        </span>
      </div>

      <div className="space-y-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          <span>Credentials</span>
          <span>{credentials.credentials.length} fields</span>
        </div>
        <div className="max-h-24 space-y-1 overflow-hidden text-sm text-gray-600">
          {credentials.credentials.slice(0, 3).map((entry) => (
            <div
              key={entry.key}
              className="flex items-center justify-between gap-3"
            >
              <span className="truncate font-medium text-gray-500">
                {entry.label}
              </span>
              <span className="truncate font-mono text-gray-400">
                {String(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <Link
          href={href}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-irms-text-primary transition hover:bg-gray-200"
        >
          <Eye className="h-4 w-4" />
          {isActive ? "View" : "Reactivate Gateway"}
        </Link>
        {!isActive && (
          <div className="inline-flex items-center justify-center rounded-xl bg-[#EFF7F0] px-3 py-3 text-irms-green">
            <Power className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-irms-green/30 to-transparent opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}
