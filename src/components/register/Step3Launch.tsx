"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { RegisterRequest } from "@/types/auth.types";
import { UserRole } from "@/types/user.types";

interface Step3Props {
  data: RegisterRequest;
}

type Status = "loading" | "success" | "error";

export function Step3Launch({ data }: Step3Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState(4);

  // 2. Add a ref flag to prevent double execution
  const calledRegister = useRef(false);

  useEffect(() => {
    // 3. Prevent duplicate execution if already triggered
    if (calledRegister.current) return;
    calledRegister.current = true;

    const run = async () => {
      const res = await AuthService.register({
        ...data,
        role: UserRole.ADMIN,
      });

      if (!res.success) {
        setStatus("error");
        setErrorMessage(res.message ?? "An unexpected error occurred.");
        return;
      }

      setStatus("success");
    };

    run();
  }, [data]); // data as dependency

  // Countdown effect stays the same...
  useEffect(() => {
    if (status !== "success") return;

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
  }, [status, router]);

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

      {/* Loading State */}
      {status === "loading" && (
        <>
          <div className="w-24 h-24 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mb-8">
            <div className="w-10 h-10 rounded-full border-4 border-[#0D402E] border-t-transparent animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Setting up your
            <br />
            workspace…
          </h1>
          <p className="text-gray-500 text-sm mb-12 leading-relaxed px-4">
            Creating your restaurant and admin account. This only takes a
            moment.
          </p>
        </>
      )}

      {/* Success State */}
      {status === "success" && (
        <>
          <div className="w-24 h-24 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-[#0D402E] rounded-full flex items-center justify-center text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Workspace created
            <br />
            successfully!
          </h1>
          <p className="text-gray-500 text-sm mb-12 leading-relaxed px-4">
            Your environment is staged. You can invite additional staff and
            fine-tune your settings later from the main dashboard.
          </p>
          <div className="w-full bg-white border border-gray-100 shadow-sm rounded-xl p-8 relative overflow-hidden">
            <p className="text-xs text-gray-500 font-semibold mb-4">
              Redirecting automatically in {countdown} seconds…
            </p>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-irms-green transition-all duration-1000 ease-linear"
                style={{ width: `${(4 - countdown) * 25}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Error State */}
      {status === "error" && (
        <>
          <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Something went
            <br />
            wrong.
          </h1>
          <p className="text-red-500 text-sm mb-8 leading-relaxed px-4">
            {errorMessage}
          </p>
          <button
            onClick={() => router.push("/register")}
            className="bg-[#0D402E] hover:bg-irms-green text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors text-sm"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
