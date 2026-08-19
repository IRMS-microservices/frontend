"use client";

import { Topbar } from "@/components/shared/Topbar";
import { useEffect, useState, useCallback, useRef } from "react";
import { KitchenService } from "@/services/kitchen.service";
import { OrderService } from "@/services/order.service";
import {
  KitchenOrderResponse,
  KitchenOrderItemResponse,
  CookingStatus,
  KitchenOrderStatus,
} from "@/types/kitchen.types";
import { OrderResponse, ServiceStatus } from "@/types/menuOrder.types";

interface Ticket {
  kitchenOrderId: string;
  orderId: string;
  tableId: string;
  tableNumber: number;
  fireTime: string;
  items: KitchenOrderItemResponse[];
}

function getItemIdentifier(item: KitchenOrderItemResponse & { _id?: string }) {
  return String(item.id ?? item._id ?? "");
}

function isTicketReady(ticket: Ticket) {
  return ticket.items.length > 0 &&
    ticket.items.every((item) => item.cookingStatus === CookingStatus.COMPLETED);
}

export default function ExpeditorViewPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [bumpingIds, setBumpingIds] = useState<Set<string>>(new Set());

  // orderId → tableId lookup
  const orderIdToTableIdRef = useRef<Map<string, string>>(new Map());

  const buildTicket = useCallback(
    (
      ko: KitchenOrderResponse,
      tableId: string,
      tableNumber: number,
    ): Ticket => {
      const kitchenOrderId = String(
        (ko as KitchenOrderResponse & { _id?: string })._id ?? ko.id ?? "",
      );

      return {
        kitchenOrderId,
        orderId: ko.orderId,
        tableId,
        tableNumber,
        fireTime: ko.fireTime,
        items: ko.items,
      };
    },
    [],
  );

  // Initial load
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [kitchenRes, ordersRes] = await Promise.all([
        KitchenService.listOrders({
          status: KitchenOrderStatus.PENDING,
          limit: 999_999_999,
        }),
        OrderService.getOrders({
          serviceStatus: ServiceStatus.EATING,
          limit: 999_999_999,
        }),
      ]);

      const kitchenOrders: KitchenOrderResponse[] = kitchenRes.data ?? [];
      const waitingOrders = ordersRes.data ?? [];

      const tableMap = new Map<string, string>(
        waitingOrders.map((o) => [String(o._id), String(o.tableId)]),
      );
      orderIdToTableIdRef.current = tableMap;

      const enriched: Ticket[] = kitchenOrders
        .filter((ko) => tableMap.has(ko.orderId))
        .map((ko) =>
          buildTicket(ko, tableMap.get(ko.orderId)!, ko.tableNumber),
        );

      setTickets(enriched);
    } catch (err) {
      console.error("Failed to load expeditor data:", err);
    } finally {
      setLoading(false);
    }
  }, [buildTicket]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // WebSocket listeners
  useEffect(() => {
    const socket = KitchenService.connect();

    socket.on("connect", () => {
      KitchenService.joinRoom("expeditor");
    });
    // Also try immediately in case already connected
    if (socket.connected) {
      KitchenService.joinRoom("expeditor");
    }

    // Kitchen order created → add new ticket or fetch tableId if unknown
    const unsubscribeKitchenCreated = KitchenService.onOrderCreated(
      async (newOrder: KitchenOrderResponse) => {
        let tableId = orderIdToTableIdRef.current.get(newOrder.orderId);

        if (tableId === undefined) {
          try {
            const res = await OrderService.getOrderById(
              String(newOrder.orderId),
            );
            if (res.data) {
              tableId = String(res.data.tableId);
              orderIdToTableIdRef.current.set(newOrder.orderId, tableId);
            }
          } catch (err) {
            console.error("Failed to fetch order for new kitchen order:", err);
          }
        }

        if (tableId !== undefined) {
          const nextTicket = buildTicket(newOrder, tableId!, newOrder.tableNumber);
          setTickets((prev) => {
            const existingIndex = prev.findIndex(
              (ticket) =>
                String(ticket.kitchenOrderId) === String(nextTicket.kitchenOrderId) ||
                String(ticket.orderId) === String(nextTicket.orderId),
            );

            if (existingIndex === -1) {
              return [...prev, nextTicket];
            }

            const next = [...prev];
            next[existingIndex] = {
              ...next[existingIndex],
              ...nextTicket,
            };
            return next;
          });
        }
      },
    );

    // Kitchen order item completed
    const unsubscribeItemCompleted = KitchenService.onItemCompleted(
      (completedItem: any) => {
        setTickets((prev) =>
          prev.map((ticket) => {
            if (
              completedItem.orderId &&
              String(ticket.orderId) !== String(completedItem.orderId)
            ) {
              return ticket;
            }

            const updatedItems = ticket.items.map((item) =>
              getItemIdentifier(item as KitchenOrderItemResponse & { _id?: string }) ===
              String(completedItem.id ?? completedItem._id ?? "")
                ? { ...item, cookingStatus: CookingStatus.COMPLETED }
                : item,
            );

            return {
              ...ticket,
              items: updatedItems,
            };
          }),
        );
      },
    );

    const unsubscribeOrderUpdated = OrderService.onOrderServiceStatusChanged(
      (updatedOrder) => {
        if (updatedOrder.serviceStatus !== ServiceStatus.FINISHED) {
          return;
        }

        const updatedOrderId = String(
          (updatedOrder as OrderResponse & { orderId?: string }).orderId ??
            updatedOrder._id,
        );

        setTickets((prev) =>
          prev.filter((ticket) => String(ticket.orderId) !== updatedOrderId),
        );
      },
    );

    return () => {
      unsubscribeKitchenCreated();
      unsubscribeItemCompleted();
      unsubscribeOrderUpdated();
      KitchenService.disconnect();
    };
  }, [buildTicket]);

  // Bump ticket
  const handleBump = async (ticket: Ticket) => {
    if (!ticket.kitchenOrderId) {
      console.error("Missing kitchen order id on ticket", ticket);
      return;
    }

    if (bumpingIds.has(ticket.kitchenOrderId)) return;
    setBumpingIds((prev) => new Set(prev).add(ticket.kitchenOrderId));
    try {
      // Send socket event to bump kitchen order
      // We use SERVED to trigger the backend RabbitMQ pipeline to order-payment-service
      await KitchenService.bumpOrder(String(ticket.kitchenOrderId), {
        status: KitchenOrderStatus.SERVED,
      });
      setTickets((prev) =>
        prev.filter((t) => t.kitchenOrderId !== ticket.kitchenOrderId),
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

  const canBump = (ticket: Ticket) =>
    ticket.items.length > 0 &&
    ticket.items.every((i) => i.cookingStatus === CookingStatus.COMPLETED);

  const statusLabel = (status: CookingStatus) => {
    switch (status) {
      case CookingStatus.COMPLETED:
        return "Ready";
      default:
        return "Cooking...";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Expeditor View" />

      <div className="flex-1 overflow-y-auto p-8">
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
          <div className="grid grid-cols-4 gap-4 mb-8">
            {tickets.map((ticket, idx) => {
              const ready = canBump(ticket);
              const bumping = bumpingIds.has(ticket.kitchenOrderId);

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border-t-4 overflow-hidden flex flex-col ${ready ? "border-green-400" : "border-amber-400"}`}
                >
                  <div className="p-4 border-b border-irms-border">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xl font-bold text-irms-text-primary">
                        Table {ticket.tableNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-irms-text-secondary mt-1">
                      <span>
                        {new Date(ticket.fireTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1">
                    {ticket.items.map((item, idx) => {
                      const isReady =
                        item.cookingStatus === CookingStatus.COMPLETED;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-sm font-semibold text-irms-text-primary truncate">
                            {item.quantity}× {item.dishName}
                          </span>
                          <span
                            className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${isReady ? "text-green-600" : "text-irms-text-secondary"}`}
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

                  <div className="p-4 pt-0">
                    <button
                      disabled={!ready || bumping}
                      onClick={() => handleBump(ticket)}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all ${ready && !bumping ? "bg-irms-green hover:bg-irms-green/80 text-white cursor-pointer" : "bg-irms-surface text-irms-text-secondary cursor-not-allowed"}`}
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
