"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/shared/Topbar";
import { InventoryService } from "@/services/inventory.service";
import { InventoryResponse } from "@/types/inventory.types";

function getStatus(item: InventoryResponse): "optimal" | "low" | "critical" {
  if (item.quantity <= 0) return "critical";
  if (item.lastImportQuantity) {
    const warningLimit =
      item.lastImportQuantity * ((item.warningThreshold ?? 20) / 100);
    if (warningLimit > 0 && item.quantity <= warningLimit) return "low";
  }
  return "optimal";
}

function getUpdatedAgo(updatedAt?: string): string {
  if (!updatedAt) return "unknown";
  const diff = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return "yesterday";
}

export default function KitchenInventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryResponse[]>([]);
  const [animatedItemId, setAnimatedItemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const getInventoryId = (item: InventoryResponse & { _id?: string }) =>
    String(item.id ?? item._id ?? "");
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
        const idx = prevItems.findIndex((item) => getInventoryId(item) === payload.id);
        const newItems = [...prevItems];
        if (idx > -1) {
          const updatedItem: InventoryResponse = {
            ...newItems[idx],
            quantity: payload.quantity,
            unit: payload.unit,
            lastImportQuantity: payload.lastImportQuantity,
            warningThreshold: payload.warningThreshold,
            updatedAt: payload.updatedAt,
          };
          newItems.splice(idx, 1);
          newItems.unshift(updatedItem);
        } else {
          newItems.unshift(payload as unknown as InventoryResponse);
        }
        return newItems;
      });

      setAnimatedItemId(payload.id);
      setTimeout(() => setAnimatedItemId(null), 1000);
    });

    return () => {
      unsubscribe();
      InventoryService.disconnect();
    };
  }, []);

  const filtered = search.trim()
    ? inventoryItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      )
    : inventoryItems;

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA]">
      <Topbar title="INVENTORIES" />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header area */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Live Inventory Status
              </h1>
              <p className="text-sm text-gray-500">
                Real-time tracking for crucial high-value ingredients.
              </p>
            </div>

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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inventory..."
                className="pl-10 pr-4 py-2.5 bg-[#EFEFEF] border-none rounded-lg text-sm focus:ring-2 focus:ring-irms-green focus:outline-none w-70"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-6">
            {filtered.map((item, index) => {
              const status = getStatus(item);
              const isAnimated = animatedItemId === getInventoryId(item);

              return (
                <div
                  key={getInventoryId(item) || index}
                  className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-500 ${
                    isAnimated
                      ? "bg-green-50 scale-[1.02] shadow-md ring-2 ring-irms-green ring-opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-[#F1F5F9] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                      INVENTORY
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-500 capitalize">
                        {status}
                      </span>
                      {status === "optimal" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                      )}
                      {status === "low" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#64748B] flex items-center justify-center relative">
                          <div className="absolute inset-0 rounded-full bg-[#64748B] opacity-50 animate-ping"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#64748B] relative z-10"></div>
                        </div>
                      )}
                      {status === "critical" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] flex items-center justify-center relative">
                          <div className="absolute inset-0 rounded-full bg-[#EF4444] opacity-50 animate-ping"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] relative z-10"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3
                      className="font-bold text-gray-800 text-lg leading-tight mb-2 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-bold ${status === "critical" ? "text-[#EF4444]" : "text-gray-900"}`}
                      >
                        {item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-gray-500">
                        {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-auto">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Updated {getUpdatedAgo(item.updatedAt)}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-4 text-center py-20 text-gray-400">
                <svg
                  className="mx-auto mb-4 opacity-30"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <p className="text-sm font-semibold">
                  No inventory items found.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


