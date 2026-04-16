"use client";

import Link from "next/link";
import { useState } from "react";
import { IrmsLogo } from "@/components/shared/IrmsLogo";

type Station = "ADMIN" | "SERVER" | "KITCHEN";

export default function LoginPage() {
  const [station, setStation] = useState<Station>("SERVER");
  const [showPassword, setShowPassword] = useState(false);
  const [trustTerminal, setTrustTerminal] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-irms-green relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-irms-green-light via-irms-green to-irms-green-dark opacity-90" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-irms-green-light rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-5xl mx-4 rounded-2xl overflow-hidden shadow-2xl flex"
        style={{ minHeight: 520 }}
      >
        {/* Left panel */}
        <div className="hidden md:flex md:w-[45%] bg-irms-green flex-col justify-between p-10">
          <IrmsLogo className="text-white" />
          <div>
            <h1 className="text-4xl font-bold text-white leading-snug mb-4">
              Intelligent Restaurant
              <br />
              Management System
            </h1>
            <p className="text-[#a7c4b5] text-base leading-relaxed">
              Managing the world&apos;s finest dining experiences through
              precision, data, and effortless coordination.
            </p>
          </div>
          <div className="text-[#a7c4b5] text-xs flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              System Operational
            </span>
            <span>V2.4.0 Reserve</span>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-[#f0f2f0] flex flex-col justify-center p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-irms-text-primary mb-1">
              Welcome Back
            </h2>
            <p className="text-irms-text-secondary text-sm">
              Access your restaurant dashboard
            </p>
          </div>

          {/* Station selector */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-irms-text-secondary tracking-widest uppercase mb-2 block">
              Select Your Station
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["ADMIN", "SERVER", "KITCHEN"] as Station[]).map((s) => (
                <button
                  key={s}
                  id={`station-${s.toLowerCase()}`}
                  onClick={() => setStation(s)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                    station === s
                      ? "bg-irms-green border-irms-green text-white"
                      : "bg-white border-irms-border text-irms-text-primary hover:border-irms-green/40"
                  }`}
                >
                  {s === "ADMIN" && (
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
                  {s === "SERVER" && (
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
                  {s === "KITCHEN" && (
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
                      <path d="M5 10a7 7 0 0 0 4 6.32V22h6v-5.68A7 7 0 0 0 19 10" />
                    </svg>
                  )}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Staff ID */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
              Staff ID or Email
            </label>
            <div className="flex items-center bg-white border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
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
              <input
                id="staff-id"
                type="text"
                placeholder="curator_staff_01"
                className="flex-1 bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-semibold text-irms-green hover:underline"
              >
                Forgot Access?
              </a>
            </div>
            <div className="flex items-center bg-white border border-irms-border rounded-lg px-3 py-2.5 gap-2 focus-within:border-irms-green transition-colors">
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-irms-text-muted hover:text-irms-text-primary transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Trust terminal */}
          <label className="flex items-center gap-2 mb-6 cursor-pointer group">
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                trustTerminal
                  ? "bg-irms-green border-irms-green"
                  : "bg-white border-irms-text-muted group-hover:border-irms-green"
              }`}
              onClick={() => setTrustTerminal(!trustTerminal)}
            >
              {trustTerminal && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-sm text-irms-text-primary select-none">
              Trust this terminal for 8 hours
            </span>
          </label>

          {/* Sign In button */}
          <Link
            href="/server/tables"
            id="sign-in-btn"
            className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-irms-green to-irms-green-light cursor-pointer duration-500
                              hover:bg-linear-to-r hover:from-irms-green-light hover:to-irms-green text-white font-semibold py-3 px-6 rounded-xl transition-colors mb-6 text-sm"
          >
            Sign In
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

          <p className="text-center text-sm text-irms-text-secondary">
            New to the collection?{" "}
            <Link
              href="/register"
              className="font-bold text-irms-text-primary hover:underline"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
