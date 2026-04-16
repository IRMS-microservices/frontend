"use client";

import { Topbar } from "@/components/shared/Topbar";
import { useState } from "react";

interface TicketItem {
  name: string;
  qty: number;
  course: "STARTERS" | "MAINS" | "SPECIALS";
  courseColor: string;
  note?: string;
  stations: { label: string; active?: boolean }[];
  status: "Ready" | "Cooking...";
}

interface Ticket {
  id: string;
  tableNum: string;
  guests: number;
  order: string;
  server: string;
  elapsed: string;
  isUrgent: boolean;
  items: TicketItem[];
  canBump: boolean;
}

const TICKETS: Ticket[] = [
  {
    id: "T-14",
    tableNum: "14",
    guests: 4,
    order: "#8821",
    server: "MARCUS",
    elapsed: "14:20",
    isUrgent: true,
    canBump: false,
    items: [
      {
        name: "Wagyu Tartare",
        qty: 2,
        course: "STARTERS",
        courseColor: "bg-orange-100 text-orange-700",
        stations: [
          { label: "S" },
          { label: "C" },
          { label: "D", active: true },
        ],
        status: "Ready",
      },
      {
        name: "Sea Bass",
        qty: 1,
        course: "MAINS",
        courseColor: "bg-blue-100 text-blue-700",
        note: "NO BUTTER – ALLERGY",
        stations: [
          { label: "S" },
          { label: "C", active: true },
          { label: "D" },
        ],
        status: "Cooking...",
      },
      {
        name: "Dry Aged Ribeye",
        qty: 1,
        course: "MAINS",
        courseColor: "bg-blue-100 text-blue-700",
        note: "Medium Rare",
        stations: [
          { label: "S", active: true },
          { label: "C" },
          { label: "D" },
        ],
        status: "Cooking...",
      },
    ],
  },
  {
    id: "T-02",
    tableNum: "02",
    guests: 2,
    order: "#8825",
    server: "SARAH",
    elapsed: "04:12",
    isUrgent: false,
    canBump: true,
    items: [
      {
        name: "Burrata & Fig",
        qty: 2,
        course: "STARTERS",
        courseColor: "bg-orange-100 text-orange-700",
        stations: [
          { label: "S" },
          { label: "C" },
          { label: "D", active: true },
        ],
        status: "Ready",
      },
      {
        name: "Truffle Risotto",
        qty: 1,
        course: "MAINS",
        courseColor: "bg-blue-100 text-blue-700",
        stations: [
          { label: "S" },
          { label: "C" },
          { label: "D", active: true },
        ],
        status: "Ready",
      },
    ],
  },
  {
    id: "T-08",
    tableNum: "08",
    guests: 5,
    order: "#8830",
    server: "CHLOE",
    elapsed: "02:45",
    isUrgent: false,
    canBump: false,
    items: [
      {
        name: "Tasting Menu",
        qty: 5,
        course: "SPECIALS",
        courseColor: "bg-purple-100 text-purple-700",
        note: "Course 1: Amuse Bouche",
        stations: [
          { label: "S", active: true },
          { label: "C" },
          { label: "D" },
        ],
        status: "Cooking...",
      },
    ],
  },
  {
    id: "T-21",
    tableNum: "21",
    guests: 3,
    order: "#8832",
    server: "MARCUS",
    elapsed: "00:30",
    isUrgent: false,
    canBump: false,
    items: [
      {
        name: "Oysters (Half Dozen)",
        qty: 3,
        course: "STARTERS",
        courseColor: "bg-orange-100 text-orange-700",
        stations: [
          { label: "S", active: true },
          { label: "C" },
          { label: "D" },
        ],
        status: "Cooking...",
      },
    ],
  },
];

const STATION_SUMMARIES = [
  {
    label: "HOT STATION",
    count: 6,
    icon: "🔥",
    bg: "bg-[#1a4035]",
    text: "text-white",
  },
  {
    label: "COLD STATION",
    count: 2,
    icon: "❄️",
    bg: "bg-white",
    text: "text-[#111827]",
  },
  {
    label: "PASTRY STATION",
    count: 0,
    icon: "🍰",
    bg: "bg-white",
    text: "text-[#111827]",
  },
];

export default function ExpeditorViewPage() {
  const [bumpedTickets, setBumpedTickets] = useState<string[]>([]);

  const activeTickets = TICKETS.filter((t) => !bumpedTickets.includes(t.id));
  const totalActive = activeTickets.length;
  const avgPrepTime = "08:42";

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <Topbar title="Expeditor View" />

      <div className="flex-1 overflow-y-auto p-8">
        {/* Live overview stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-irms-text-secondary tracking-widest uppercase mb-1">
              Live Service Overview
            </p>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-4xl font-bold text-irms-text-primary">
                  {totalActive}
                </span>
                <span className="text-sm text-irms-text-secondary ml-1">
                  Active Tickets
                </span>
              </div>
              <div>
                <span className="text-4xl font-bold text-irms-text-primary">
                  {avgPrepTime}
                </span>
                <span className="text-sm text-irms-text-secondary ml-1">
                  Avg. Prep Time
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-irms-border rounded-lg text-sm font-semibold text-irms-text-primary hover:bg-irms-surface transition-colors cursor-pointer">
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
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              All Stations
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-irms-border rounded-lg text-sm font-semibold text-irms-text-primary hover:bg-irms-surface transition-colors cursor-pointer">
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
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              Oldest First
            </button>
          </div>
        </div>

        {/* Tickets grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {activeTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`bg-white rounded-xl border-t-4 overflow-hidden ${
                ticket.isUrgent ? "border-red-400" : "border-green-400"
              }`}
            >
              {/* Ticket header */}
              <div className="p-4 border-b border-irms-border">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xl font-bold text-irms-text-primary">
                    {ticket.id}
                  </span>
                  <span
                    className={`text-sm font-bold px-2 py-0.5 rounded-lg ${
                      ticket.isUrgent
                        ? "bg-red-50 text-red-500"
                        : "bg-irms-surface text-irms-text-primary"
                    }`}
                  >
                    {ticket.elapsed}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-irms-text-secondary mb-0.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {ticket.guests} Guests
                </div>
                <div className="flex items-center justify-between text-xs text-irms-text-secondary">
                  <span>ORDER {ticket.order}</span>
                  <span>SERVER: {ticket.server}</span>
                </div>
              </div>

              {/* Items */}
              <div className="p-4 space-y-4 flex-1">
                {ticket.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`${item.status === "Cooking..." && item.note === "NO BUTTER – ALLERGY" ? "border-l-2 border-blue-400 pl-2" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-irms-text-primary">
                        {item.qty}× {item.name}
                      </span>
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.courseColor}`}
                      >
                        {item.course}
                      </span>
                    </div>
                    {item.note && (
                      <p
                        className={`text-xs mb-1 ${item.note === "NO BUTTER – ALLERGY" ? "text-red-500 font-bold" : "text-irms-text-secondary"}`}
                      >
                        {item.note}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {item.stations.map((st) => (
                          <div
                            key={st.label}
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                              st.active
                                ? "bg-irms-green text-white"
                                : "bg-irms-surface text-irms-text-secondary"
                            }`}
                          >
                            {st.label}
                          </div>
                        ))}
                      </div>
                      <span
                        className={`text-xs flex items-center gap-1 ${
                          item.status === "Ready"
                            ? "text-green-600"
                            : "text-irms-text-secondary"
                        }`}
                      >
                        {item.status === "Ready" ? (
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
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 .49-3.67" />
                          </svg>
                        )}
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bump button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() =>
                    ticket.canBump &&
                    setBumpedTickets((prev) => [...prev, ticket.id])
                  }
                  className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
                    ticket.canBump
                      ? "bg-irms-green hover:bg-irms-green/80 text-white cursor-pointer"
                      : "bg-irms-surface text-irms-text-secondary cursor-not-allowed"
                  }`}
                >
                  {ticket.canBump ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      BUMP TICKET
                    </span>
                  ) : (
                    "BUMP TICKET"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Station summary */}
        <div className="grid grid-cols-3 gap-4">
          {STATION_SUMMARIES.map((station) => (
            <div
              key={station.label}
              className={`${station.bg} rounded-2xl p-5 flex items-center justify-between border border-irms-border`}
            >
              <div>
                <p
                  className={`text-xs font-bold tracking-widest uppercase mb-1 ${station.count > 0 && station.bg === "bg-irms-green" ? "text-white/70" : "text-irms-text-secondary"}`}
                >
                  {station.label}
                </p>
                <p className={`text-2xl font-bold ${station.text}`}>
                  {station.count} Active Items
                </p>
              </div>
              <span className="text-3xl opacity-60">{station.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
