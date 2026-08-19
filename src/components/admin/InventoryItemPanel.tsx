"use client";

import { useState, useEffect } from "react";
import { InventoryService } from "@/services/inventory.service";

interface InventoryItemPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "ADD" | "EDIT";
  item?: any;
  onSuccess: () => void;
}

export function InventoryItemPanel({ isOpen, onClose, mode, item, onSuccess }: InventoryItemPanelProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number | string>("");
  const [category, setCategory] = useState("PRODUCE");
  const [unit, setUnit] = useState("kg");
  const [warningThreshold, setWarningThreshold] = useState<number | string>(20);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === "EDIT" && item) {
      setName(item.name || "");
      setQuantity(item.quantity || "");
      setCategory(item.category || "PRODUCE");
      setUnit(item.unit || "kg");
      setWarningThreshold(item.warningThreshold || 20);
    } else {
      setName("");
      setQuantity("");
      setCategory("PRODUCE");
      setUnit("kg");
      setWarningThreshold(20);
    }
  }, [mode, item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "ADD") {
        await InventoryService.createInventory({
          name,
          quantity: Number(quantity),
          unit: unit as any, // EUnit
          warningThreshold: Number(warningThreshold)
        });
      } else if (mode === "EDIT" && item) {
        // Find correct adjustment if any
        let delta = Number(quantity) - Number(item.quantity || 0);
        if (delta !== 0) {
          await InventoryService.adjustQuantity({
            id: String(item.id ?? item._id ?? ""),
            delta: delta,
            unit: unit as any,
            reason: 'IMPORT'
          });
        }
      }
      onSuccess();
    } catch (err) {
      console.error(err);
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
      <div className="fixed inset-y-0 right-0 w-105 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-irms-text-primary tracking-wide">
            {mode === "ADD" ? "Add New Item" : "Update Stock"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form id="inventory-item-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

            {mode === "EDIT" && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Selected Item
                </label>
                <div className="bg-[#F8F9FA] rounded-lg px-4 py-3 text-sm text-gray-800 font-semibold border border-gray-100">
                  {name}
                </div>
              </div>
            )}

            {mode === "ADD" && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Heirloom Tomatoes"
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:border-transparent focus:outline-none transition-shadow"
                />
              </div>
            )}

            {mode === "ADD" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:border-transparent focus:outline-none transition-shadow appearance-none"
                  >
                    <option value="PRODUCE">Produce</option>
                    <option value="MEAT">Meat</option>
                    <option value="DAIRY">Dairy</option>
                    <option value="SEAFOOD">Seafood</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. kg, lbs, units"
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:border-transparent focus:outline-none transition-shadow"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                    Warning Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-irms-green focus:border-transparent focus:outline-none transition-shadow"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                {mode === "ADD" ? "Initial Quantity" : "Update Quantity"}
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(0, Number(prev) - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-[#F8F9FA] border border-gray-200 rounded-l-lg hover:bg-gray-100 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full h-12 text-center text-xl font-bold bg-white border-y border-gray-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Number(prev) + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-[#F8F9FA] border border-gray-200 rounded-r-lg hover:bg-gray-100 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <button
            form="inventory-item-form"
            type="submit"
            disabled={isLoading}
            className={`w-full bg-irms-green hover:bg-irms-green-light text-white rounded-lg py-3.5 text-sm font-bold shadow-md transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {isLoading ? "Saving..." : mode === "ADD" ? "Add Item" : "Confirm Adjustment"}
          </button>
        </div>
      </div>
    </>
  );
}
