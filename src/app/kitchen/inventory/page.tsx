"use client";

import { Topbar } from "@/components/shared/Topbar";

export default function KitchenInventoryPage() {
  const inventoryItems = [
    { id: 1, name: "Wagyu Beef A5", category: "PROTEIN", quantity: 14.5, unit: "kg", status: "optimal", updatedAgo: "12 mins ago" },
    { id: 2, name: "Fresh White Truffle", category: "SPECIALTY", quantity: 0.15, unit: "kg", status: "critical", updatedAgo: "2 hrs ago" },
    { id: 3, name: "Chilean Sea Bass", category: "SEAFOOD", quantity: 4.0, unit: "kg", status: "low", updatedAgo: "45 mins ago" },
    { id: 4, name: "Normandy Butter", category: "DAIRY", quantity: 24, unit: "blocks", status: "optimal", updatedAgo: "yesterday" },
    { id: 5, name: "Heirloom Tomatoes", category: "PRODUCE", quantity: 18.2, unit: "kg", status: "optimal", updatedAgo: "1 hr ago" },
    { id: 6, name: "Beluga Caviar", category: "SPECIALTY", quantity: 2, unit: "tins", status: "low", updatedAgo: "3 hrs ago" },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA]">
      <Topbar title="INVENTORIES" />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header area */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Live Inventory Status</h1>
              <p className="text-sm text-gray-500">Real-time tracking for crucial high-value ingredients.</p>
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search inventory..."
                className="pl-10 pr-4 py-2.5 bg-[#EFEFEF] border-none rounded-lg text-sm focus:ring-2 focus:ring-irms-green focus:outline-none w-70"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-6">
            {inventoryItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">

                <div className="flex justify-between items-center mb-6">
                  <span className="bg-[#F1F5F9] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-500 capitalize">{item.status}</span>
                    {item.status === 'optimal' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                    )}
                    {item.status === 'low' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#64748B] flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full bg-[#64748B] opacity-50 animate-ping"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#64748B] relative z-10"></div>
                      </div>
                    )}
                    {item.status === 'critical' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full bg-[#EF4444] opacity-50 animate-ping"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] relative z-10"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 truncate" title={item.name}>{item.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${item.status === 'critical' ? 'text-[#EF4444]' : 'text-gray-900'}`}>
                      {item.quantity}
                    </span>
                    <span className="text-sm font-semibold text-gray-500">{item.unit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-auto">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Updated {item.updatedAgo}
                </div>

              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
