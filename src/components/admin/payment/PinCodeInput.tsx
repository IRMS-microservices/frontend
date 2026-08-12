"use client";

import { useEffect, useMemo, useRef, type KeyboardEvent } from "react";

interface PinCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PinCodeInput({
  value,
  onChange,
  length = 6,
  autoFocus = false,
  disabled = false,
  className = "",
}: PinCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => Array.from({ length }, (_, index) => value[index] ?? ""), [length, value]);

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const updateValue = (index: number, nextDigit: string) => {
    const cleanDigit = nextDigit.replace(/\D/g, "").slice(0, 1);
    const nextDigits = [...digits];
    nextDigits[index] = cleanDigit;
    const nextValue = nextDigits.join("").slice(0, length);
    onChange(nextValue);

    if (cleanDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={`flex gap-2 sm:gap-3 ${className}`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          value={digits[index]}
          onChange={(event) => updateValue(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          autoComplete="one-time-code"
          disabled={disabled}
          className="h-14 w-12 sm:h-16 sm:w-14 rounded-xl border border-[#CBD5E1] bg-white text-center text-lg font-bold tracking-[0.35em] text-irms-text-primary outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15 disabled:cursor-not-allowed disabled:bg-gray-50"
        />
      ))}
    </div>
  );
}
