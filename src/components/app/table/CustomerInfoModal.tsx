"use-client";

import { GuestInfo } from "./AssignGuestModal";

export function CustomerInfoModal({
  guest,
  onClose,
}: {
  guest: GuestInfo;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
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
              Customer information
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

        {/* Fields (read-only) */}
        <div className="mb-4">
          <label className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
            Customer Name
          </label>
          <div className="flex items-center bg-irms-bg-secondary border border-irms-border rounded-lg px-3 py-2.5 gap-2">
            <span className="flex-1 text-sm text-irms-text-primary">
              {guest.name}
            </span>
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
        <div className="mb-4">
          <label className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
            Gender
          </label>
          <div className="flex items-center bg-irms-bg-secondary border border-irms-border rounded-lg px-3 py-2.5 gap-2">
            <span className="flex-1 text-sm text-irms-text-primary">
              {guest.gender}
            </span>
          </div>
        </div>
        <div className="mb-2">
          <label className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
            Phone Number
          </label>
          <div className="flex items-center bg-irms-bg-secondary border border-irms-border rounded-lg px-3 py-2.5 gap-2">
            <span className="flex-1 text-sm text-irms-text-primary">
              {guest.phone}
            </span>
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
      </div>
    </div>
  );
}
