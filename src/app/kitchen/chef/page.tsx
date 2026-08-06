"use client";

import { Topbar } from "@/components/shared/Topbar";
import { useEffect, useRef, useState, useCallback } from "react";
import { KitchenService } from "@/services/kitchen.service";
import {
  KitchenOrderResponse,
} from "@/types/kitchen.types";
import useElapsed from "@/hooks/useElapsed";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A ticket as received from the backend via 'ticket:update'.
 * Each ticket represents one grouped dish across tables.
 * The backend sends the already-grouped array — no client-side grouping needed.
 */
interface Ticket {
  key: string;          // unique key derived from the order for React
  dishName: string;
  groupFireTimeMs: number;
  rows: { tableId: string | number; kitchenItemId: string; quantity: number }[];
  totalQty: number;
  station?: string;
  bumped: boolean;
}

type Station = "ALL STATIONS" | "GRILL" | "SALAD" | "FRYER" | "DESSERT";

const STATIONS: Station[] = [
  "ALL STATIONS",
  "GRILL",
  "SALAD",
  "FRYER",
  "DESSERT",
];

// ---------------------------------------------------------------------------
// Helper: map KitchenOrderResponse[] (from initial REST load) into Ticket[]
// The server socket sends already-grouped data, but the REST endpoint returns
// raw kitchen orders — we flatten items into a ticket per dish+order.
// ---------------------------------------------------------------------------

function parseFireTime(fireTime: any): number {
  if (!fireTime) return Date.now();
  if (typeof fireTime === "object" && "epochSecond" in fireTime) {
    return fireTime.epochSecond * 1000 + Math.floor(fireTime.nano / 1_000_000);
  }
  if (typeof fireTime === "string") return new Date(fireTime).getTime();
  if (typeof fireTime === "number") {
    return fireTime < 1_000_000_000_000 ? Math.floor(fireTime * 1000) : fireTime;
  }
  return Date.now();
}

function ordersToTickets(orders: KitchenOrderResponse[]): Ticket[] {
  const tickets: Ticket[] = [];
  for (const order of orders) {
    const fireMs = parseFireTime(order.fireTime);
    for (const item of order.items) {
      tickets.push({
        key: `${order.id}-${item.id}`,
        dishName: item.dishName,
        groupFireTimeMs: fireMs,
        rows: [{ tableId: order.orderId, kitchenItemId: String(item.id), quantity: item.quantity }],
        totalQty: item.quantity,
        bumped: false,
      });
    }
  }
  return tickets;
}

/**
 * Merge a newly received ticket:update array into the existing local state.
 * If a ticket key already exists (and hasn't been bumped), overwrite it;
 * if it's new, append it.
 */
function mergeTickets(prev: Ticket[], incoming: KitchenOrderResponse[]): Ticket[] {
  const incomingTickets = ordersToTickets(incoming);
  const map = new Map(prev.map((t) => [t.key, t]));
  for (const t of incomingTickets) {
    if (!map.get(t.key)?.bumped) {
      map.set(t.key, t);
    }
  }
  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Sub-component: one ticket card
// ---------------------------------------------------------------------------

function TicketCard({
  ticket,
  onBump,
}: {
  ticket: Ticket;
  onBump: (ticket: Ticket) => void;
}) {
  const timer = useElapsed(ticket.groupFireTimeMs);
  const [mm] = timer.split(":").map(Number);
  const isOverdue = mm >= 10;

  return (
    <div
      className={`bg-white rounded-xl border-2 p-5 transition-all ${
        isOverdue ? "border-red-400" : "border-irms-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-bold text-irms-text-primary text-base leading-tight">
          {ticket.dishName}
        </h3>
        <span className="text-2xl font-bold text-irms-text-primary ml-2">
          ×{ticket.totalQty}
        </span>
      </div>

      {/* Table rows */}
      <div className="space-y-2 mb-4 mt-3">
        {ticket.rows.map((row) => (
          <div
            key={`${row.tableId}-${row.kitchenItemId}`}
            className="flex items-center justify-between bg-[#f9fafb] rounded-lg px-3 py-1.5"
          >
            <span className="text-sm font-semibold text-[#374151]">
              Order #{String(row.tableId).padStart(2, "0")}
            </span>
            <span className="text-sm font-semibold text-[#374151]">
              ×{row.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className={`flex items-center gap-1.5 text-sm font-bold ${
            isOverdue ? "text-red-500" : "text-[#374151]"
          }`}
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
          {timer}
        </span>
        <button
          onClick={() => onBump(ticket)}
          className="px-3 py-1.5 bg-irms-green hover:bg-irms-green-dark text-white text-xs font-bold tracking-wider rounded-lg transition-colors cursor-pointer"
        >
          BUMP
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Longest-wait chip
// ---------------------------------------------------------------------------

function LongestWaitChip({ startMs }: { startMs: number }) {
  const timer = useElapsed(startMs);
  return (
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
        <p className="text-lg font-bold text-red-500">{timer}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ChefViewPage() {
  const [activeStation, setActiveStation] = useState<Station>("ALL STATIONS");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [bumpingKeys, setBumpingKeys] = useState<Set<string>>(new Set());

  // ---------------------------------------------------------------------------
  // Initial REST load
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await KitchenService.listOrders({ status: "PENDING" });
        if (cancelled) return;
        const sorted = (res.data ?? [])
          .slice()
          .sort(
            (a, b) =>
              new Date(a.fireTime).getTime() - new Date(b.fireTime).getTime(),
          );
        setTickets(ordersToTickets(sorted));
      } catch (err) {
        console.error("Failed to load kitchen orders", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ---------------------------------------------------------------------------
  // WebSocket – listen for 'ticket:update' (already grouped by the server)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const socket = KitchenService.connect();

    // Join the chef room so we receive ticket:update events
    socket.on("connect", () => {
      KitchenService.joinRoom("chef");
    });
    // Also try immediately in case already connected
    if (socket.connected) {
      KitchenService.joinRoom("chef");
    }

    const unsubscribe = KitchenService.onTicketUpdate(
      (incoming: KitchenOrderResponse[]) => {
        setTickets((prev) => mergeTickets(prev, incoming));
      },
    );

    return () => {
      unsubscribe();
      KitchenService.disconnect();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Bump handler — mark item as COMPLETED
  // ---------------------------------------------------------------------------
  const handleBump = useCallback(async (ticket: Ticket) => {
    setBumpingKeys((prev) => new Set(prev).add(ticket.key));
    try {
      await Promise.all(
        ticket.rows.map((row) =>
          KitchenService.updateOrderItem(row.kitchenItemId, {
            cookingStatus: "COMPLETED",
          }),
        ),
      );
      setTickets((prev) =>
        prev.map((t) => (t.key === ticket.key ? { ...t, bumped: true } : t)),
      );
    } catch (err) {
      console.error("Bump failed", err);
    } finally {
      setBumpingKeys((prev) => {
        const next = new Set(prev);
        next.delete(ticket.key);
        return next;
      });
    }
  }, []);

  // Derived data
  const activeTickets = tickets.filter((t) => {
    if (t.bumped) return false;
    if (activeStation === "ALL STATIONS") return true;
    return t.station?.toUpperCase().includes(activeStation) ?? false;
  });

  const totalItems = activeTickets.reduce((sum, t) => sum + t.totalQty, 0);

  const allActiveTickets = tickets.filter((t) => !t.bumped);
  const earliestFireMs =
    allActiveTickets.length > 0
      ? Math.min(...allActiveTickets.map((t) => t.groupFireTimeMs))
      : null;

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
        {loading ? (
          <div className="flex items-center justify-center h-48 text-irms-text-secondary font-semibold">
            Loading kitchen orders…
          </div>
        ) : activeTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-irms-text-secondary">
            <svg
              width="36"
              height="36"
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
            <p className="text-xs font-bold tracking-widest">
              ALL CLEAR — NO PENDING ITEMS
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {activeTickets.map((ticket) => (
              <TicketCard
                key={ticket.key}
                ticket={ticket}
                onBump={bumpingKeys.has(ticket.key) ? () => {} : handleBump}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating bottom chips */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 items-end">
        {earliestFireMs !== null && (
          <LongestWaitChip startMs={earliestFireMs} />
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
