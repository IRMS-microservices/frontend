"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Step3Launch() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="w-full max-w-md mx-auto text-center flex flex-col items-center">
      <div className="mb-12 flex items-center justify-between text-xs font-bold w-full max-w-[320px] mx-auto opacity-70">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-[10px]">1. Details</span>
        </div>
        <div className="flex-1 text-gray-300 font-normal mx-2">/</div>
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-[10px]">2. Layout</span>
        </div>
        <div className="flex-1 text-gray-300 font-normal mx-2">/</div>
        <div className="flex flex-col items-center gap-2 text-irms-green">
          <span className="text-[10px]">3. Launch</span>
        </div>
      </div>

      <div className="w-24 h-24 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mb-8">
        <div className="w-10 h-10 bg-[#0D402E] rounded-full flex items-center justify-center text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">Workspace created<br/>successfully!</h1>
      <p className="text-gray-500 text-sm mb-12 leading-relaxed px-4">
        Your environment is staged. You can invite additional staff and fine-tune your settings later from the main dashboard.
      </p>

      <div className="w-full bg-white border border-gray-100 shadow-sm rounded-xl p-8 relative overflow-hidden">
        <p className="text-xs text-gray-500 font-semibold mb-4">Redirecting automatically in {countdown} seconds...</p>
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-irms-green transition-all duration-1000 ease-linear"
            style={{ width: `${(4 - countdown) * 25}%` }}
          />
        </div>
      </div>
    </div>
  );
}
