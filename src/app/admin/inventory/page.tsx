"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { InventoryItemPanel } from "@/components/admin/InventoryItemPanel";
import { InventoryService } from "@/services/inventory.service";
import { InventoryResponse } from "@/types/inventory.types";

export default function AdminInventoryPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"ADD" | "EDIT">("ADD");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [inventoryItems, setInventoryItems] = useState<InventoryResponse[]>([]);
  const [animatedItemId, setAnimatedItemId] = useState<string | null>(null);
  const [lowStock, setLowStock] = useState<string[]>([]);
  const [critical, setCritical] = useState<string[]>([]);

  const loadInventory = async () => {
    try {
      const response = await InventoryService.listInventories({
        limit: 999_999_999,
      });
      if (response.data && response.data) {
        setInventoryItems(response.data);
      }
    } catch (err) {
      console.error("Failed to load inventories", err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    InventoryService.connect();
    const unsubscribe = InventoryService.onQuantityUpdated((payload) => {
      setInventoryItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.id === payload.id,
        );
        let newItems = [...prevItems];
        if (existingItemIndex > -1) {
          const updatedItem = {
            ...newItems[existingItemIndex],
            quantity: payload.quantity,
            unit: payload.unit,
            lastImportQuantity: payload.lastImportQuantity,
            warningThreshold: payload.warningThreshold,
          };
          newItems.splice(existingItemIndex, 1);
          newItems.unshift(updatedItem);
          if (
            payload.quantity > 0 &&
            payload.quantity <= payload.warningThreshold
          ) {
            setLowStock((prev) => [...prev, updatedItem.id]);
          } else {
            setLowStock((prev) => prev.filter((id) => id !== updatedItem.id));
          }
          if (payload.quantity === 0) {
            setCritical((prev) => [...prev, updatedItem.id]);
          } else {
            setCritical((prev) => prev.filter((id) => id !== updatedItem.id));
          }
        } else {
          newItems.unshift(payload as any);
        }
        return newItems;
      });

      setAnimatedItemId(payload.id);
      setTimeout(() => setAnimatedItemId(null), 1000); // 1s animation
    });

    return () => {
      unsubscribe();
      InventoryService.disconnect();
    };
  }, []);

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
            <h1 className="text-3xl font-bold text-irms-text-primary">
              Inventory Control
            </h1>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                Low Stock Alerts
              </p>
              <h3 className="text-3xl font-bold text-[#64748B] mb-4">
                {lowStock.length}
              </h3>
              <div className="flex gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-[#64748B]"></div>
                <div className="w-2 h-2 rounded-full bg-[#64748B]"></div>
                <div className="w-2 h-2 rounded-full bg-[#CBD5E1]"></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                Critical Shortage
              </p>
              <h3 className="text-3xl font-bold text-[#EF4444] mb-4">
                {critical.length}
              </h3>
              <div className="flex gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#EFEFEF] hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 tracking-wide uppercase transition-colors">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filter Category
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#EFEFEF] hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 tracking-wide uppercase transition-colors">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-irms-green hover:bg-irms-green-light rounded-lg text-xs font-bold text-white tracking-wide uppercase transition-colors">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
            {inventoryItems.map((item, index) => {
              const warningLimit = item.lastImportQuantity
                ? item.lastImportQuantity *
                  ((item.warningThreshold ?? 20) / 100)
                : 0;
              let status = "optimal";
              if (item.quantity <= 0) {
                status = "critical";
              } else if (warningLimit > 0 && item.quantity <= warningLimit) {
                status = "low";
              }

              return (
                <div
                  key={item.id || index}
                  onClick={() => handleEditItem(item)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 cursor-pointer flex flex-col h-full relative group ${animatedItemId === item.id ? "bg-green-50 scale-[1.02] shadow-md ring-2 ring-irms-green ring-opacity-50" : ""}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    {status === "optimal" && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                        <span className="text-[#10B981] font-bold">
                          OPTIMAL
                        </span>
                      </div>
                    )}
                    {status === "low" && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#64748B]"></div>
                        <span className="text-[#64748B] font-bold">
                          LOW STOCK
                        </span>
                      </div>
                    )}
                    {status === "critical" && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                        <span className="text-[#EF4444] font-bold">
                          CRITICAL
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">
                    {item.name}
                  </h3>

                  <div className="mt-auto">
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                      Quantity
                    </p>
                    <p
                      className={`text-2xl font-bold ${status === "critical" ? "text-[#EF4444]" : "text-gray-900"}`}
                    >
                      {item.quantity}{" "}
                      <span className="text-sm font-semibold">{item.unit}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Add Button */}
        <button
          onClick={handleAddItem}
          className="fixed bottom-10 right-10 w-14 h-14 bg-irms-green hover:bg-irms-green-light text-white rounded-xl shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-30"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
        onSuccess={() => {
          setIsPanelOpen(false);
          loadInventory();
        }}
      />
    </div>
  );
}
