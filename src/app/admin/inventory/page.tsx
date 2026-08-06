"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { InventoryItemPanel } from "@/components/admin/InventoryItemPanel";

export default function AdminInventoryPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"ADD" | "EDIT">("ADD");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const inventoryItems = [
    { id: 1, name: "Heirloom Tomatoes", category: "PRODUCE", supplier: "Valle de Guadalupe Farm", quantity: 24, unit: "kg", status: "optimal" },
    { id: 2, name: "Microgreens Mix", category: "PRODUCE", supplier: "Hydroponic Urban Farm", quantity: 1.5, unit: "kg", status: "low" },
    { id: 3, name: "White Truffles", category: "PRODUCE", supplier: "Piedmont Import", quantity: 450, unit: "g", status: "optimal" },
    { id: 4, name: "Chantarelles", category: "PRODUCE", supplier: "Seasonal Wild Foraged", quantity: 0.0, unit: "kg", status: "critical" },
    { id: 5, name: "Heirloom Tomatoes", category: "PRODUCE", supplier: "Valle de Guadalupe Farm", quantity: 24, unit: "kg", status: "optimal" },
    { id: 6, name: "Microgreens Mix", category: "PRODUCE", supplier: "Hydroponic Urban Farm", quantity: 1.5, unit: "kg", status: "low" },
    { id: 7, name: "White Truffles", category: "PRODUCE", supplier: "Piedmont Import", quantity: 450, unit: "g", status: "optimal" },
    { id: 8, name: "Chantarelles", category: "PRODUCE", supplier: "Seasonal Wild Foraged", quantity: 0.0, unit: "kg", status: "critical" },
  ];

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setPanelMode("EDIT");
    setIsPanelOpen(true);
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setPanelMode("ADD");
    setIsPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <AdminSidebar />

      <main className="flex-1 ml-60 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-irms-text-primary">Inventory Control</h1>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search ingredients..."
                className="pl-10 pr-4 py-2 bg-[#F0F2F5] border-none rounded-lg text-sm focus:ring-2 focus:ring-irms-green focus:outline-none w-70"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">Total Stock Value</p>
              <h3 className="text-3xl font-bold text-irms-green mb-4">$42,850</h3>
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="bg-irms-green w-[70%] h-full"></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">Low Stock Alerts</p>
              <h3 className="text-3xl font-bold text-[#64748B] mb-4">08</h3>
              <div className="flex gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-[#64748B]"></div>
                <div className="w-2 h-2 rounded-full bg-[#64748B]"></div>
                <div className="w-2 h-2 rounded-full bg-[#CBD5E1]"></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">Critical Shortage</p>
              <h3 className="text-3xl font-bold text-[#EF4444] mb-4">03</h3>
              <div className="flex gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">Deliveries Today</p>
              <h3 className="text-3xl font-bold text-[#8B5CF6] mb-4">12</h3>
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#8B5CF6] w-[60%] h-full"></div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#EFEFEF] hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 tracking-wide uppercase transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filter Category
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#EFEFEF] hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 tracking-wide uppercase transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="21" y1="10" x2="3" y2="10"></line>
                  <line x1="21" y1="6" x2="3" y2="6"></line>
                  <line x1="21" y1="14" x2="3" y2="14"></line>
                  <line x1="21" y1="18" x2="3" y2="18"></line>
                </svg>
                Sort By Stock
              </button>
            </div>

            <div className="flex gap-3">
              <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-irms-green hover:bg-irms-green-light rounded-lg text-xs font-bold text-white tracking-wide uppercase transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export Report
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-300 inline-block"></span>
              Fresh Produce
            </h2>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-4 gap-6">
            {inventoryItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleEditItem(item)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full relative group"
              >
                {/* Image Placeholder Space - Required by specs */}
                <div className="w-full h-32 bg-gray-50 rounded-xl mb-4 border border-gray-100 flex items-center justify-center text-gray-300">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>

                <div className="flex justify-between items-start mb-3">
                  <span className="bg-[#F1F5F9] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                    {item.category}
                  </span>

                  {item.status === 'optimal' && (
                    <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                  )}
                  {item.status === 'low' && (
                    <div className="w-3 h-3 rounded-full bg-[#64748B] flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full bg-[#64748B] opacity-50 animate-ping"></div>
                      <div className="w-2 h-2 rounded-full bg-[#64748B] relative z-10"></div>
                    </div>
                  )}
                  {item.status === 'critical' && (
                    <div className="bg-[#FEE2E2] text-[#EF4444] rounded-sm w-4 h-5 flex items-center justify-center font-bold text-xs relative">
                      <div className="absolute inset-0 bg-[#FEE2E2] opacity-50 animate-ping"></div>
                      <span className="relative z-10">!</span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-6">{item.supplier}</p>

                <div className="mt-auto">
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">Quantity</p>
                  <p className={`text-2xl font-bold ${item.status === 'critical' ? 'text-[#EF4444]' : 'text-gray-900'}`}>
                    {item.quantity} <span className="text-sm font-semibold">{item.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Add Button */}
        <button
          onClick={handleAddItem}
          className="fixed bottom-10 right-10 w-14 h-14 bg-irms-green hover:bg-irms-green-light text-white rounded-xl shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-30"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </main>

      <InventoryItemPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        mode={panelMode}
        item={selectedItem}
        onSuccess={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
