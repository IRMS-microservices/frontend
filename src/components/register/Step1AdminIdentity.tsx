"use client";

import { useState } from "react";

interface Step1Props {
  onNext: () => void;
}

export function Step1AdminIdentity({ onNext }: Step1Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
        <span className="text-irms-green border-b-2 border-irms-green pb-1">1. Admin Account</span>
        <span className="text-gray-300">-----</span>
        <span className="text-gray-400 pb-1">2. Restaurant Info</span>
        <span className="text-gray-300">-----</span>
        <span className="text-gray-400 pb-1">3. Launch</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Admin Profile</h1>
      <p className="text-gray-500 text-sm mb-8">Set up the primary account for your restaurant group.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Full Name</label>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Auguste Escoffier" className="w-full bg-white border border-gray-100 shadow-sm rounded-lg pl-10 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-irms-green focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Work Email</label>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="chef@restaurant.com" className="w-full bg-white border border-gray-100 shadow-sm rounded-lg pl-10 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-irms-green focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Phone Number</label>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full bg-white border border-gray-100 shadow-sm rounded-lg pl-10 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-irms-green focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Password</label>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border border-gray-100 shadow-sm rounded-lg pl-10 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-irms-green focus:outline-none mb-1" />
          </div>
          <p className="text-[11px] text-gray-400">Must be at least 12 characters and include a symbol.</p>
        </div>

        <button type="submit" className="mt-4 w-full bg-[#0D402E] hover:bg-irms-green text-white font-bold py-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
          CONTINUE TO RESTAURANT INFO
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </form>
      
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account? <a href="/login" className="text-irms-green font-semibold">Sign in here</a>
      </p>
    </div>
  );
}
