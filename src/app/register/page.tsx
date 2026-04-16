"use client";

import Link from "next/link";
import { useState } from "react";
import { IrmsLogo } from "@/components/shared/IrmsLogo";

type Role = "ADMIN" | "SERVER" | "KITCHEN";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("SERVER");

  return (
    <div className="min-h-screen flex items-center justify-center bg-irms-surface relative overflow-hidden py-10 px-4">
      {/* Card */}
      <div
        className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl flex bg-white"
        style={{ minHeight: 560 }}
      >
        {/* Left panel */}
        <div className="hidden md:flex md:w-[38%] bg-irms-green flex-col justify-between p-10">
          <IrmsLogo className="text-white" />
          <div>
            <h1 className="text-4xl font-bold text-white leading-snug mb-5">
              Elevate your craft, orchestrate excellence.
            </h1>
            <p className="text-irms-text-muted text-base leading-relaxed">
              Join the elite cohort of hospitality professionals managing the
              world&apos;s most distinguished dining rooms.
            </p>
          </div>
          <div />
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col justify-center p-10 bg-white">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-irms-text-primary mb-1">
              Staff Registration
            </h2>
            <p className="text-irms-text-muted text-sm">
              Begin your journey in the Curator ecosystem.
            </p>
          </div>

          {/* Full Name + Email */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
                Full Name
              </label>
              <div className="flex items-center bg-white border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
                <svg
                  width="15"
                  height="15"
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
                <input
                  id="full-name"
                  type="text"
                  placeholder="Julian Vane"
                  className="flex-1 bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
                Staff Email
              </label>
              <div className="flex items-center bg-white border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <at />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                </svg>
                <input
                  id="staff-email"
                  type="email"
                  placeholder="j.vane@curator.com"
                  className="flex-1 bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none"
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-2 block">
              Institutional Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["ADMIN", "SERVER", "KITCHEN"] as Role[]).map((r) => (
                <button
                  key={r}
                  id={`role-${r.toLowerCase()}`}
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                    role === r
                      ? "bg-irms-green border-irms-green text-white"
                      : "bg-white border-irms-border text-irms-text-primary hover:border-irms-green/40"
                  }`}
                >
                  {r === "ADMIN" && (
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  {r === "SERVER" && (
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
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  )}
                  {r === "KITCHEN" && (
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
                      <path d="M12 2a3 3 0 0 0-3 3v7h6V5a3 3 0 0 0-3-3z" />
                      <path d="M9 12v7a3 3 0 0 0 6 0v-7" />
                    </svg>
                  )}
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-[#374151] tracking-widest uppercase mb-1.5 block">
                Password
              </label>
              <div className="flex items-center bg-[#f9fafb] border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
                Confirm
              </label>
              <div className="flex items-center bg-[#f9fafb] border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none"
                />
              </div>
            </div>
          </div>

          {/* Admin code */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase">
                Admin Authorization Code
              </label>
              <span className="text-xs font-semibold text-irms-orange">
                Required for Admin/Front Access
              </span>
            </div>
            <div className="flex items-center bg-[#f9fafb] border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              <input
                id="admin-code"
                type="text"
                placeholder="CUR-XXXX-XXXX"
                className="flex-1 bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none"
              />
            </div>
          </div>

          {/* Register button */}
          <Link
            href="/login"
            id="register-btn"
            className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-irms-green to-irms-green-light cursor-pointer duration-500
                              hover:bg-linear-to-r hover:from-irms-green-light hover:to-irms-green text-white font-semibold py-3 px-6 rounded-xl transition-colors mb-5 text-sm"
          >
            Register
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <p className="text-center text-sm text-irms-text-muted">
            Already part of the culinary circle?{" "}
            <Link
              href="/login"
              className="font-bold text-irms-text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
