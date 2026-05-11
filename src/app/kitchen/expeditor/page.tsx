"use client";

import { Topbar } from "@/components/shared/Topbar";
import { useEffect, useState, useCallback } from "react";
import { KitchenService } from "@/services/kitchen.service";
import { OrderService } from "@/services/order.service";
import {
  KitchenOrderResponse,
  KitchenOrderItemResponse,
  CookingStatus,
  KitchenOrderStatus,
} from "@/types/kitchen.types";

/** A ticket = kitchen order enriched with the parent order's tableId */
interface Ticket {
  kitchenOrderId: number;
  orderId: number;
  tableId: number;
  fireTime: string;
  items: KitchenOrderItemResponse[];
}

export default function ExpeditorViewPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [bumpingIds, setBumpingIds] = useState<Set<number>>(new Set());

  // ─── Initial load ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch PENDING kitchen orders and Waiting service orders in parallel
      const [kitchenRes, ordersRes] = await Promise.all([
        KitchenService.listOrders(KitchenOrderStatus.PENDING),
        OrderService.getOrders(undefined, "Waiting"),
      ]);

      const kitchenOrders: KitchenOrderResponse[] = kitchenRes.data ?? [];
      const waitingOrders = ordersRes.data ?? [];

      // Build a map orderId → tableId
      const tableMap = new Map<number, number>(
        waitingOrders.map((o) => [o.orderId, o.tableId])
      );

      const enriched: Ticket[] = kitchenOrders
        .filter((ko) => tableMap.has(ko.orderId))
        .map((ko) => ({
          kitchenOrderId: ko.id,
          orderId: ko.orderId,
          tableId: tableMap.get(ko.orderId)!,
          fireTime: ko.fireTime,
          items: ko.items,
        }));

      setTickets(enriched);
    } catch (err) {
      console.error("Failed to load expeditor data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── WebSocket: listen for item status changes ────────────────────────────
  useEffect(() => {
    KitchenService.connect();

    const unsubscribeItem = KitchenService.onItemStatusChanged(
      (updated: KitchenOrderItemResponse) => {
        setTickets((prev) =>
          prev.map((ticket) => ({
            ...ticket,
            items: ticket.items.map((item) =>
              item.id === updated.id ? { ...item, cookingStatus: updated.cookingStatus } : item
            ),
          }))
        );
      }
    );

    // Optionally remove bumped tickets when their status advances
    const unsubscribeOrder = KitchenService.onOrderStatusChanged(
      (updatedOrder: KitchenOrderResponse) => {
        if (updatedOrder.status !== KitchenOrderStatus.PENDING) {
          setTickets((prev) =>
            prev.filter((t) => t.kitchenOrderId !== updatedOrder.id)
          );
        }
      }
    );

    return () => {
      unsubscribeItem();
      unsubscribeOrder();
      KitchenService.disconnect();
    };
  }, []);

  // ─── Bump ticket ──────────────────────────────────────────────────────────
  const handleBump = async (ticket: Ticket) => {
    if (bumpingIds.has(ticket.kitchenOrderId)) return;
    setBumpingIds((prev) => new Set(prev).add(ticket.kitchenOrderId));
    try {
      await Promise.all([
        KitchenService.advanceOrderStatus(ticket.kitchenOrderId),
        OrderService.updateServiceStatus(ticket.orderId, "Eating"),
      ]);
      // Optimistically remove the ticket
      setTickets((prev) =>
        prev.filter((t) => t.kitchenOrderId !== ticket.kitchenOrderId)
      );
    } catch (err) {
      console.error("Failed to bump ticket:", err);
    } finally {
      setBumpingIds((prev) => {
        const next = new Set(prev);
        next.delete(ticket.kitchenOrderId);
        return next;
      });
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const canBump = (ticket: Ticket) =>
    ticket.items.length > 0 &&
    ticket.items.every((i) => i.cookingStatus === CookingStatus.COMPLETED);

  const statusLabel = (status: CookingStatus) => {
    switch (status) {
      case CookingStatus.COMPLETED:
        return "Ready";
      case CookingStatus.IN_PROGRESS:
        return "Cooking…";
      default:
        return status;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
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
                  {tickets.length}
                </span>
                <span className="text-sm text-irms-text-secondary ml-1">
                  Active Tickets
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border border-irms-border rounded-lg text-sm font-semibold text-irms-text-primary hover:bg-irms-surface transition-colors cursor-pointer"
          >
            {/* Refresh icon */}
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
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.67" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-irms-text-secondary text-sm">
            Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-irms-text-secondary">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-30"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            <span className="text-sm font-medium">No active tickets</span>
          </div>
        ) : (
          /* Tickets grid */
          <div className="grid grid-cols-4 gap-4 mb-8">
            {tickets.map((ticket) => {
              const ready = canBump(ticket);
              const bumping = bumpingIds.has(ticket.kitchenOrderId);

              return (
                <div
                  key={ticket.kitchenOrderId}
                  className={`bg-white rounded-xl border-t-4 overflow-hidden flex flex-col ${
                    ready ? "border-green-400" : "border-amber-400"
                  }`}
                >
                  {/* Ticket header */}
                  <div className="p-4 border-b border-irms-border">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xl font-bold text-irms-text-primary">
                        Table {ticket.tableId}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-irms-surface text-irms-text-secondary">
                        KO #{ticket.kitchenOrderId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-irms-text-secondary mt-1">
                      <span>ORDER #{ticket.orderId}</span>
                      <span>
                        {new Date(ticket.fireTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Items — simplified: name, qty, status */}
                  <div className="p-4 space-y-3 flex-1">
                    {ticket.items.map((item) => {
                      const isReady = item.cookingStatus === CookingStatus.COMPLETED;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-sm font-semibold text-irms-text-primary truncate">
                            {item.quantity}× {item.dishName}
                          </span>
                          <span
                            className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${
                              isReady
                                ? "text-green-600"
                                : "text-irms-text-secondary"
                            }`}
                          >
                            {isReady ? (
                              <svg
                                width="11"
                                height="11"
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
                                width="11"
                                height="11"
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
                            {statusLabel(item.cookingStatus)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bump button */}
                  <div className="p-4 pt-0">
                    <button
                      disabled={!ready || bumping}
                      onClick={() => handleBump(ticket)}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
                        ready && !bumping
                          ? "bg-irms-green hover:bg-irms-green/80 text-white cursor-pointer"
                          : "bg-irms-surface text-irms-text-secondary cursor-not-allowed"
                      }`}
                    >
                      {bumping ? (
                        "BUMPING…"
                      ) : ready ? (
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
