"use client";

import { useState } from "react";

export interface GuestInfo {
  name: string;
  gender: string;
  phone: string;
  partySize: number;
  preference: string;
}

export default function AssignGuestModal({
  tableId,
  onClose,
  onConfirm,
}: {
  tableId: string;
  onClose: () => void;
  onConfirm: (guest: GuestInfo) => void;
}) {
  const [partySize, setPartySize] = useState(4);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-irms-orange flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 11l19-9-9 19-2-8-8-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-irms-text-primary">
              Assign Table {tableId}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-irms-text-muted hover:text-irms-text-primary transition-colors cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Customer Name */}
        <div className="mb-4">
          <label className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
            Customer Name
          </label>
          <div className="flex items-center bg-irms-bg-secondary border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
            <input
              type="text"
              placeholder="e.g. Isabella Rossi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none"
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
            Gender
          </label>
          <div className="flex items-center bg-irms-bg-secondary border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="flex-1 bg-transparent text-sm text-irms-text-primary outline-none cursor-pointer"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
            Phone Number
          </label>
          <div className="flex items-center bg-irms-bg-secondary border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none"
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
        </div>

        {/* Party size + preference */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
              Party Size
            </label>
            <div className="flex items-center gap-3 bg-irms-bg-secondary border border-irms-border rounded-lg px-3 py-2">
              <button
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="w-6 h-6 flex items-center justify-center text-irms-text-primary font-bold text-lg hover:text-irms-green cursor-pointer"
              >
                −
              </button>
              <span className="text-lg font-bold text-irms-text-primary flex-1 text-center">
                {String(partySize).padStart(2, "0")}
              </span>
              <button
                onClick={() => setPartySize(partySize + 1)}
                className="w-6 h-6 flex items-center justify-center text-irms-text-primary font-bold text-lg hover:text-irms-green cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
              Preference
            </label>
            <div className="flex items-center gap-2 bg-irms-bg-secondary border border-irms-border rounded-lg px-3 py-2.5">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="text-sm text-irms-text-primary font-medium">
                VIP Guest
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-10">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-lg border border-irms-border text-xs font-bold tracking-widest text-irms-text-primary hover:bg-irms-bg-secondary transition-colors cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={() =>
              onConfirm({
                name: name || "Paul Sterling",
                gender,
                phone: phone || "+1 (555) 003-9281",
                partySize,
                preference: "VIP Guest",
              })
            }
            className="flex-1 py-4 rounded-lg bg-linear-to-r from-irms-green-dark to-irms-green hover:from-irms-green hover:to-irms-green-dark text-xs font-bold tracking-widest text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            CONFIRM &amp; OPEN TABLE →
          </button>
        </div>
      </div>
    </div>
  );
}
