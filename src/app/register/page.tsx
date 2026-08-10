"use client";

import { useState } from "react";
import { Step1AdminIdentity } from "@/components/register/Step1AdminIdentity";
import { Step2WorkspaceSetup } from "@/components/register/Step2WorkspaceSetup";
import { Step3Launch } from "@/components/register/Step3Launch";
import { IrmsLogo } from "@/components/shared/IrmsLogo";
import { WorkspaceRegisterData } from "@/types/auth.types";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [registerData, setRegisterData] = useState<Partial<WorkspaceRegisterData>>({});

  const handleStep1Next = (step1Data: Pick<WorkspaceRegisterData, "fullName" | "username" | "phoneNumber" | "password">) => {
    setRegisterData((prev) => ({ ...prev, ...step1Data }));
    setStep(2);
  };

  const handleStep2Next = (step2Data: Pick<WorkspaceRegisterData, "restaurantName" | "businessType">) => {
    setRegisterData((prev) => ({ ...prev, ...step2Data }));
    setStep(3);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Green Gradient */}
      <div className="w-[45%] lg:w-[50%] flex flex-col justify-between p-12 bg-linear-to-br from-[#0B2C24] via-[#0F4C3A] to-[#125A45] text-white relative overflow-hidden">
        {/* Subtle decorative elements for premium feel */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          {step === 1 ? (
            <IrmsLogo className="text-white" />
          ) : (
            <div className="flex items-center gap-3 font-bold text-2xl tracking-wide">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13a7 7 0 0 1 14 0 7 7 0 0 1-7 7z"></path><path d="M11 11v9"></path><path d="M15 15l-4-4-4 4"></path></svg>
              The Culinary Curator
            </div>
          )}
        </div>

        <div className="relative z-10 max-w-xl my-auto py-12">
          {step === 1 && (
            <>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">Elevate<br />Every Course.</h1>
              <p className="text-lg lg:text-xl text-[#A7C4B5] leading-relaxed max-w-md font-medium">
                &quot;Precision in the kitchen translates to perfection on the plate. Our platform is the silent orchestrator of your culinary vision.&quot;
              </p>
            </>
          )}

          {step === 2 && (
            <div className="mt-40">
              <h2 className="text-4xl font-bold mb-4 leading-tight">&quot;Excellence is not an act,<br />but a habit.&quot;</h2>
              <p className="text-sm font-bold tracking-[0.2em] text-[#A7C4B5] uppercase">Curate Your Experience</p>
            </div>
          )}

          {step === 3 && (
            <div className="mt-20">
              <h2 className="text-4xl font-bold mb-6 leading-tight">Service is ready to<br />commence.</h2>
              <p className="text-lg text-[#A7C4B5] leading-relaxed max-w-md">
                Your high-end restaurant management workspace has been meticulously prepared. Step into the digital Maître d&apos; experience.
              </p>
            </div>
          )}
        </div>

        <div className="relative z-10 text-xs font-bold tracking-[0.15em] text-[#A7C4B5] uppercase">
          {step === 1 && "Trusted by Michelin-starred establishments globally."}
          {step === 3 && "© 2024 Emerald Reserve"}
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
        <div className="absolute top-8 right-8 text-sm font-semibold text-gray-500 hover:text-gray-800 cursor-pointer flex items-center gap-2 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Need Help?
        </div>

        <div className="w-full">
          {step === 1 && <Step1AdminIdentity onNext={handleStep1Next} />}
          {step === 2 && (
            <Step2WorkspaceSetup
              onBack={() => setStep(1)}
              onNext={handleStep2Next}
            />
          )}
          {step === 3 && registerData.fullName && (
            <Step3Launch data={registerData as WorkspaceRegisterData} />
          )}
        </div>
      </div>
    </div>
  );
}
