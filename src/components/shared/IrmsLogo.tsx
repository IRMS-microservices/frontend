"use client";

import { Wine } from "lucide-react";

export function IrmsLogo({
  className = "",
  includeText = true,
}: {
  className?: string;
  includeText?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-irms-orange flex items-center justify-center shrink-0">
        <Wine className="w-5 h-5 text-white" />
      </div>
      {includeText && (
        <span className="font-bold text-lg tracking-wide">IRMS</span>
      )}
    </div>
  );
}
