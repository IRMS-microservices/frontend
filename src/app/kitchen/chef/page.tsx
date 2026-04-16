"use client";

import { Topbar } from "@/components/shared/Topbar";
import { useState } from "react";

type Station = "ALL STATIONS" | "GRILL" | "SALAD" | "FRYER" | "DESSERT";

interface TableRow {
  tableNum: number;
  modifiers?: string;
  isRush?: boolean;
  qty: number;
}

interface KitchenItem {
  id: number;
  name: string;
  station: string;
  stationColor: string;
  tables: TableRow[];
  totalQty: number;
  timer: string;
  isOverdue?: boolean;
}

const KITCHEN_ITEMS: KitchenItem[] = [
  {
    id: 1,
    name: "Wagyu Ribeye",
    station: "GRILL STATION",
    stationColor: "text-[#f97316]",
    tables: [
      { tableNum: 12, modifiers: "Medium Rare", qty: 1 },
      { tableNum: 8, modifiers: "Medium", qty: 2 },
    ],
    totalQty: 3,
    timer: "14:22",
    isOverdue: true,
  },
  {
    id: 2,
    name: "Lobster Bisque",
    station: "FRYER / HOT BOX",
    stationColor: "text-[#6b7280]",
    tables: [
      { tableNum: 22, qty: 4 },
      { tableNum: 4, qty: 1 },
    ],
    totalQty: 5,
    timer: "09:45",
  },
  {
    id: 3,
    name: "Burrata Salad",
    station: "SALAD STATION",
    stationColor: "text-green-600",
    tables: [{ tableNum: 15, isRush: true, qty: 2 }],
    totalQty: 2,
    timer: "03:10",
  },
  {
    id: 4,
    name: "Truffle Fries",
    station: "FRYER STATION",
    stationColor: "text-[#6b7280]",
    tables: [
      { tableNum: 31, qty: 1 },
      { tableNum: 33, qty: 1 },
      { tableNum: 11, qty: 1 },
    ],
    totalQty: 4,
    timer: "06:22",
  },
  {
    id: 5,
    name: "Valrhona Soufflé",
    station: "DESSERT STATION",
    stationColor: "text-purple-600",
    tables: [{ tableNum: 19, modifiers: "Celebration", qty: 1 }],
    totalQty: 1,
    timer: "01:50",
  },
];

const STATIONS: Station[] = [
  "ALL STATIONS",
  "GRILL",
  "SALAD",
  "FRYER",
  "DESSERT",
];

export default function ChefViewPage() {
  const [activeStation, setActiveStation] = useState<Station>("ALL STATIONS");
  const [bumpedItems, setBumpedItems] = useState<number[]>([]);

  const longestWaitItem = KITCHEN_ITEMS.filter(
    (item) => !bumpedItems.includes(item.id),
  ).sort((a, b) => {
    const toSecs = (t: string) => {
      const [m, s] = t.split(":").map(Number);
      return m * 60 + s;
    };
    return toSecs(b.timer) - toSecs(a.timer);
  })[0];

  const totalItems = KITCHEN_ITEMS.filter(
    (i) => !bumpedItems.includes(i.id),
  ).reduce((sum, i) => sum + i.totalQty, 0);

  const visibleItems = KITCHEN_ITEMS.filter((item) => {
    if (bumpedItems.includes(item.id)) return false;
    if (activeStation === "ALL STATIONS") return true;
    return item.station.toUpperCase().includes(activeStation);
  });

  return (
    <div className="flex flex-col h-full relative">
      {/* Top bar */}
      <Topbar title="Chef View" />
      {/* Station filter */}
      <div className="px-8 pt-5 pb-0 flex items-center gap-2">
        {STATIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStation(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeStation === s
                ? "bg-irms-green text-white"
                : "bg-white border border-irms-border text-irms-text-primary hover:border-irms-green/30"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border-2 p-5 transition-all ${
                item.isOverdue ? "border-red-400" : "border-irms-border"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold text-irms-text-primary text-base leading-tight">
                  {item.name}
                </h3>
                <span className="text-2xl font-bold text-irms-text-primary ml-2">
                  ×{item.totalQty}
                </span>
              </div>
              <p
                className={`text-xs font-bold tracking-wider mb-4 ${item.stationColor}`}
              >
                {item.station}
              </p>

              {/* Table rows */}
              <div className="space-y-2 mb-4">
                {item.tables.map((row) => (
                  <div
                    key={row.tableNum}
                    className="flex items-center justify-between bg-[#f9fafb] rounded-lg px-3 py-1.5"
                  >
                    <span className="text-sm font-semibold text-[#374151]">
                      Table {String(row.tableNum).padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-2">
                      {row.modifiers && (
                        <span className="text-xs text-irms-text-secondary">
                          {row.modifiers}
                        </span>
                      )}
                      {row.isRush && (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                          Rush
                        </span>
                      )}
                      <span className="text-sm font-semibold text-[#374151]">
                        ×{row.qty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span
                  className={`flex items-center gap-1.5 text-sm font-bold ${item.isOverdue ? "text-red-500" : "text-[#374151]"}`}
                >
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
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {item.timer}
                </span>
                <button
                  onClick={() => setBumpedItems((prev) => [...prev, item.id])}
                  className="px-3 py-1.5 bg-irms-green hover:bg-irms-green-dark text-white text-xs font-bold tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  BUMP ITEM
                </button>
              </div>
            </div>
          ))}

          {/* Recent history placeholder */}
          <div className="bg-white rounded-xl border-2 border-dashed border-irms-border p-5 flex flex-col items-center justify-center gap-2 min-h-[180px]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.67" />
            </svg>
            <p className="text-xs font-bold text-irms-text-secondary tracking-widest">
              RECENT HISTORY
            </p>
            <p className="text-xs text-irms-text-secondary">
              Tap to recall last item
            </p>
          </div>
        </div>
      </div>

      {/* Floating bottom chips */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 items-end">
        {longestWaitItem && (
          <div className="flex items-center gap-3 bg-white border border-irms-border rounded-xl shadow-lg px-4 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-irms-text-secondary font-semibold">
                LONGEST WAIT
              </p>
              <p className="text-lg font-bold text-red-500">
                {longestWaitItem.timer}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 bg-irms-green rounded-xl shadow-lg px-4 py-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-white/70 font-semibold">TOTAL ITEMS</p>
            <p className="text-lg font-bold text-white">{totalItems} Items</p>
          </div>
        </div>
      </div>
    </div>
  );
}
