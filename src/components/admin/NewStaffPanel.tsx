"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.service";

interface NewStaffPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewStaffPanel({
  isOpen,
  onClose,
  onSuccess,
}: NewStaffPanelProps) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("SERVER");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.registerStaff({
        username,
        password,
        fullName,
        role: role.toUpperCase(),
      });
      if (response.success) {
        onSuccess();
        setFullName("");
        setRole("SERVER");
        setEmail("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-100 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
        <div className="flex items-center justify-between px-6 py-6 bg-irms-green text-white">
          <h2 className="text-xl font-bold tracking-wide">New Staff Account</h2>
          <button
            onClick={onClose}
            className="hover:opacity-80 transition-opacity"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form
            id="new-staff-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Role Type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:outline-none transition-shadow appearance-none"
              >
                <option value="SERVER">Server</option>
                <option value="KITCHEN">Kitchen Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Staff ID
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="staff_001"
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:outline-none transition-shadow"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm font-semibold">{error}</div>
            )}
          </form>
        </div>

        <div className="p-6">
          <button
            form="new-staff-form"
            type="submit"
            disabled={isLoading}
            className={`w-full bg-irms-green hover:bg-irms-green-light text-white rounded-lg py-3.5 text-sm font-bold shadow-md transition-colors ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </div>
      </div>
    </>
  );
}
