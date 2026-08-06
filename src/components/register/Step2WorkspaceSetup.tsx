"use client";

import { useState } from "react";

interface Step2Props {
  onBack: () => void;
  onNext: () => void;
}

export function Step2WorkspaceSetup({ onBack, onNext }: Step2Props) {
  const [restaurantName, setRestaurantName] = useState("");
  const [businessType, setBusinessType] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 flex items-center justify-between text-xs font-bold w-full max-w-[320px] mx-auto">
        <div className="flex flex-col items-center gap-2 text-irms-green">
          <div className="w-6 h-6 rounded-full bg-irms-green text-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span className="text-[10px]">Account</span>
        </div>

        <div className="flex-1 h-0.5 bg-gray-300 mx-2 mb-4"></div>

        <div className="flex flex-col items-center gap-2 text-irms-green">
          <div className="w-6 h-6 rounded-full bg-irms-green text-white flex items-center justify-center">2</div>
          <span className="text-[10px]">Restaurant Info</span>
        </div>

        <div className="flex-1 h-0.5 bg-gray-200 mx-2 mb-4"></div>

        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">3</div>
          <span className="text-[10px]">Menu</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your space.</h1>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">Let's set up the digital foundation for your dining experience. We've pre-filled some details based on your location.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-bold text-gray-800 mb-2 block">Restaurant Name</label>
          <input type="text" required value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} placeholder="e.g., L'Ambroisie" className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-irms-green focus:outline-none" />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-800 mb-2 block">Business Type</label>
          <select required value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-irms-green focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201.5L6%206.5L11%201.5%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-position-[right_1rem_center]">
            <option value="" disabled>Select an establishment type...</option>
            <option value="fine_dining">Fine Dining</option>
            <option value="casual_dining">Casual Dining</option>
            <option value="cafe">Cafe / Bistro</option>
            <option value="bar">Bar / Lounge</option>
          </select>
        </div>

        <div className="bg-[#F8F9FA] rounded-xl p-5 mt-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Regional Settings (Auto-detected)
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5 block">Currency</label>
              <div className="bg-gray-200/50 rounded text-sm px-3 py-2 text-gray-600 font-medium">VND (₫)</div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5 block">Timezone</label>
              <div className="bg-gray-200/50 rounded text-sm px-3 py-2 text-gray-600 font-medium">GMT+7</div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            These can be changed later in Settings.
          </p>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button type="button" onClick={onBack} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-lg transition-colors text-sm">
            Back
          </button>
          <button type="submit" className="bg-[#0D402E] hover:bg-irms-green text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2 text-sm">
            CONTINUE
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </form>
    </div>
  );
}
