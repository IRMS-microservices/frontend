"use client";

import { Topbar } from "@/components/shared/Topbar";
import Link from "next/link";
import { JSX, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { KitchenService } from "@/services/kitchen.service";
import {
  OrderResponse,
  PaymentStatus,
  ServiceStatus,
} from "@/types/menuOrder.types";
import { CustomerService } from "@/services/customer.service";
import { CookingStatus, KitchenOrderItemResponse, KitchenOrderResponse } from "@/types/kitchen.types";
import { PaymentService } from "@/services/payment.service";
import { getPaymentAdapterUI } from "./adapters/PaymentAdapterRegistry";
import { TableResponse } from "@/types/table.types";
import { TableService } from "@/services/table.service";

type PaymentMethodItem = {
  id: string;
  code: string;
  name: string;
  logo: string;
};

const STATUS_STYLES: Record<string, string> = {
  SERVED: "text-green-600",
  READY: "text-green-600",
  COOKING: "text-amber-500",
  WAITING: "text-[#9ca3af]",
};

const STATUS_ICONS: Record<string, JSX.Element> = {
  SERVED: (
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
  ),
  READY: (
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
  ),
  COOKING: (
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
  ),
  WAITING: (
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
  ),
};

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tableId = resolvedParams.id;
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodItem | null>(null);
  const [supportedMethods, setSupportedMethods] = useState<PaymentMethodItem[]>(
    [],
  );
  const [showPopup, setShowPopup] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);
  const [displayCustomerId, setDisplayCustomerId] = useState<string | null>(
    null,
  );
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<TableResponse | null>(null);
  const [kitchenOrder, setKitchenOrder] = useState<KitchenOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await OrderService.getOrders({ tableId });
        const orders = response.data;
        // Find active order (Waiting or Eating)
        const currentActiveOrder = orders?.find(
          (o) => o.serviceStatus === "WAITING" || o.serviceStatus === "EATING",
        );
        setActiveOrder(currentActiveOrder || null);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setLoading(false);
      }
    };
    fetchOrder();
  }, [tableId]);
  useEffect(() => {
    const fetchKitchenOrder = async () => {
      if (!activeOrder?._id) {
        setKitchenOrder(null);
        return;
      }

      try {
        const response = await KitchenService.listOrders({
          orderId: activeOrder._id,
          limit: 1,
        });
        setKitchenOrder(response.data?.[0] ?? null);
      } catch (err) {
        console.error("Failed to fetch kitchen order", err);
        setKitchenOrder(null);
      }
    };

    fetchKitchenOrder();
  }, [activeOrder?._id]);


  useEffect(() => {
    const fetchCustomer = async () => {
      let cid = activeOrder?.customerId ?? tableInfo?.currentGuestId ?? null;

      setDisplayCustomerId(cid || null);

      if (cid) {
        try {
          const response = await CustomerService.getCustomerById(
            cid.toString(),
          );
          if (response.success) {
            const customerData = response.data;
            const formattedName =
              customerData.gender === "Male"
                ? `Mr. ${customerData.name}`
                : `Ms. ${customerData.name}`;
            setCustomerName(formattedName);
          }
        } catch (err) {
          console.error("Failed to fetch customer", err);
        }
      } else {
        setCustomerName(null);
      }
    };
    fetchCustomer();
  }, [activeOrder, tableId, tableInfo?.currentGuestId]);

  useEffect(() => {
    if (!activeOrder?._id) return;

    KitchenService.connect();

    const unsubscribeItemCompleted = KitchenService.onItemCompleted(
      (completedItem: KitchenOrderItemResponse & { orderId?: string }) => {
        if (completedItem.orderId && String(completedItem.orderId) !== String(activeOrder._id)) {
          return;
        }

        setKitchenOrder((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            items: prev.items.map((item) =>
              String(item.id) === String(completedItem.id)
                ? { ...item, ...completedItem }
                : item,
            ),
          };
        });
      },
    );

    return () => {
      unsubscribeItemCompleted();
      KitchenService.disconnect();
    };
  }, [activeOrder?._id]);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const [credsRes, methodsRes] = await Promise.all([
          PaymentService.getPaymentCredentials(),
          PaymentService.getPaymentMethods(),
        ]);

        const CASH_METHOD: PaymentMethodItem = {
          id: "cash-id",
          code: "CASH",
          name: "CASH",
          logo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>`,
        };

        if (credsRes.success && methodsRes.success) {
          const creds = credsRes.data;
          const methods = methodsRes.data;

          const supported = creds
            .map((cred) => {
              const method = methods.find(
                (m) => m._id === cred.paymentMethodId,
              );
              if (method && method.isActive) {
                return {
                  id: method._id,
                  code: method.code,
                  name: method.name,
                  logo: method.logo,
                };
              }
              return null;
            })
            .filter(Boolean) as PaymentMethodItem[];

          setSupportedMethods([CASH_METHOD, ...supported]);
          if (!selectedMethod) setSelectedMethod(CASH_METHOD);
        } else {
          setSupportedMethods([CASH_METHOD]);
          if (!selectedMethod) setSelectedMethod(CASH_METHOD);
        }
      } catch (err) {
        console.error("Failed to fetch payment methods", err);
        setSupportedMethods([
          {
            id: "cash",
            code: "CASH",
            name: "CASH",
            logo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>`,
          },
        ]);
      }
    };
    fetchMethods();
  }, []);

  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        const response = await TableService.getTable(tableId);
        if (response.success) {
          setTableInfo(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch table info", err);
      }
    };
    fetchTableInfo();
  }, [tableId]);

  // ── Real-time: listen for service-status changes from the kitchen ──
  useEffect(() => {
    OrderService.connect();

    const unsubscribe = OrderService.onOrderServiceStatusChanged(
      (updatedOrder: OrderResponse) => {
        // Only update if it's for the current table
        if (updatedOrder.tableId !== tableId) return;

        setActiveOrder((prev) => {
          if (prev && prev._id === updatedOrder._id) {
            return { ...prev, ...updatedOrder };
          }
          // If no active order yet, pick up this one if it's in a relevant status
          if (
            !prev &&
            (updatedOrder.serviceStatus === ServiceStatus.WAITING ||
              updatedOrder.serviceStatus === ServiceStatus.FINISHED)
          ) {
            return updatedOrder;
          }
          return prev;
        });
      },
    );

    return () => {
      unsubscribe();
      OrderService.disconnect();
    };
  }, []);

  const subtotal = activeOrder
    ? activeOrder.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      )
    : 0;

  const serviceCharge = subtotal * 0.18;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + serviceCharge + tax;
  const findKitchenItemForOrderItem = (
    item: OrderResponse["items"][number],
  ) => {
    if (!kitchenOrder) return null;

    return (
      kitchenOrder.items.find(
        (kitchenItem) =>
          kitchenItem.dishId === item.dishId &&
          kitchenItem.quantity === item.quantity &&
          (kitchenItem.notes || "") === (item.notes || ""),
      ) ?? null
    );
  };

  const getItemStatus = (item: OrderResponse["items"][number]) => {
    if (activeOrder?.serviceStatus === ServiceStatus.FINISHED) {
      return "SERVED";
    }

    const kitchenItem = findKitchenItemForOrderItem(item);
    if (!kitchenItem) {
      return activeOrder?.serviceStatus === ServiceStatus.WAITING
        ? "WAITING"
        : "COOKING";
    }

    return kitchenItem.cookingStatus === CookingStatus.COMPLETED
      ? "READY"
      : "COOKING";
  };


  const handleCompletePaymentClick = () => {
    if (!activeOrder) return;
    setShowPopup(true);
  };

  const handlePaymentSuccess = async () => {
    if (!activeOrder) return;
    setIsProcessing(true);
    setShowPopup(false);
    try {
      await OrderService.updateOrder(activeOrder._id.toString(), {
        serviceStatus: ServiceStatus.FINISHED,
        paymentStatus: PaymentStatus.PAID,
      });
      router.push(`/server/tables/${tableId}`);
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPopup(false);
  };

  const PaymentPopupComponent = selectedMethod
    ? getPaymentAdapterUI(selectedMethod.code)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <Topbar title="Table & Order" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left — order details */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-irms-text-muted font-semibold tracking-widest uppercase mb-3">
            <Link href="/server/tables" className="hover:text-irms-green">
              Table &amp; Order
            </Link>
            <span>›</span>
            <Link
              href={`/server/tables/${tableId}`}
              className="hover:text-irms-green"
            >
              Table {tableInfo?.tableNumber} Detail
            </Link>
            <span>›</span>
            <span className="text-irms-text-primary">Payment</span>
          </nav>

          <h2 className="text-4xl font-bold text-irms-text-primary mb-2">
            Table {tableInfo?.tableNumber}
          </h2>
          <div className="flex items-center gap-3 text-sm text-irms-text-muted mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
            <span>
              Customer:{" "}
              {customerName ||
                (displayCustomerId ? `#${displayCustomerId}` : "Walk-in")}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48 text-irms-text-muted">
              Loading order details...
            </div>
          ) : !activeOrder ? (
            <div className="flex flex-col items-center justify-center h-48 text-irms-text-muted">
              <p className="mb-4">No active order for this table.</p>
              <Link
                href={`/server/tables/${tableId}/order`}
                className="text-irms-green font-bold hover:underline"
              >
                Create an order first
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-irms-border p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-irms-text-primary">
                  Order Details (ID: #{activeOrder._id})
                </h3>
                <span className="text-xs font-bold text-irms-text-muted tracking-widest">
                  {activeOrder.items.reduce((s, i) => s + i.quantity, 0)} ITEMS
                  TOTAL
                </span>
              </div>

              <div className="space-y-4">
                {activeOrder.items.map((item, idx) => {
                  const itemStatus = getItemStatus(item);
                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-irms-bg-secondary flex items-center justify-center text-sm font-bold text-irms-text-primary shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-irms-text-primary text-sm flex items-center gap-2">
                          {item.quantity > 1 && (
                            <span className="bg-irms-green text-white px-1.5 py-0.5 rounded text-xs">
                              {item.quantity}x
                            </span>
                          )}
                          {item.dishName}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-irms-text-muted italic mt-1">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs font-semibold ${STATUS_STYLES[itemStatus] ?? "text-irms-text-secondary"}`}
                      >
                        {STATUS_ICONS[itemStatus] ?? STATUS_ICONS.WAITING}
                        {itemStatus}
                      </div>
                      <span className="text-sm font-bold text-irms-text-primary w-32 text-right">
                        {(item.price * item.quantity).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right — payment summary */}
        <div className="w-87.5 shrink-0 bg-white border-l border-irms-border flex flex-col p-6 overflow-y-auto">
          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-irms-border rounded-lg text-sm font-semibold text-irms-text-primary hover:bg-irms-bg-secondary transition-colors cursor-pointer disabled:opacity-50"
              disabled={!activeOrder}
            >
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
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
            <Link
              href={`/server/tables/${tableId}/order`}
              className={`flex-1 flex items-center justify-center gap-2 bg-irms-green hover:bg-irms-green-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm ${!activeOrder ? "opacity-50 pointer-events-none" : ""}`}
            >
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Items
            </Link>
          </div>

          {/* Summary */}
          <h3 className="text-lg font-bold text-irms-text-primary mb-4">
            Payment Summary
          </h3>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm text-irms-text-primary">
              <span>Subtotal</span>
              <span>
                {subtotal.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm text-irms-text-primary">
              <span>Service Charge (18%)</span>
              <span>
                {serviceCharge.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm text-irms-text-primary">
              <span>Tax (8%)</span>
              <span>
                {tax.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6 pt-4 border-t border-irms-border">
            <span className="text-base font-bold text-irms-text-primary">
              Grand Total
            </span>
            <span className="text-2xl font-bold text-irms-green">
              {grandTotal.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>

          {/* Payment methods */}
          <p className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-3">
            Payment Method
          </p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {supportedMethods.map((m) => (
              <button
                key={m.code}
                onClick={() => setSelectedMethod(m)}
                disabled={!activeOrder}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 text-xs font-bold tracking-wider transition-all cursor-pointer ${
                  selectedMethod?.code === m.code
                    ? "bg-white border-irms-green text-irms-green"
                    : "bg-irms-bg-secondary border-irms-border text-irms-text-muted hover:border-irms-green/40"
                } ${!activeOrder ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {m.logo && m.logo.startsWith("<svg") ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: m.logo }}
                    className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  />
                ) : m.logo ? (
                  <img
                    src={m.logo}
                    alt={m.name}
                    className="w-5 h-5 object-contain"
                  />
                ) : (
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                )}
                {m.name}
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleCompletePaymentClick}
            disabled={
              !activeOrder ||
              isProcessing ||
              activeOrder.serviceStatus === ServiceStatus.WAITING ||
              activeOrder.paymentStatus === PaymentStatus.PAID
            }
            className={`flex items-center justify-center gap-2 w-full duration-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm
              ${
                !activeOrder ||
                isProcessing ||
                activeOrder.serviceStatus === ServiceStatus.WAITING ||
                activeOrder.paymentStatus === PaymentStatus.PAID
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-irms-green to-irms-green-light hover:from-irms-green-light hover:to-irms-green cursor-pointer"
              }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {isProcessing ? "PROCESSING..." : "Complete Payment"}
          </button>
          <button
            disabled={!activeOrder}
            className="w-full mt-3 py-3 rounded-xl bg-irms-bg-secondary hover:bg-irms-bg-secondary-dark text-irms-text-primary font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Tip Manually
          </button>
        </div>
      </div>

      {/* Payment Popup */}
      {showPopup && activeOrder && selectedMethod && PaymentPopupComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative border border-gray-100">
            <button
              onClick={handlePaymentCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <PaymentPopupComponent
              order={activeOrder}
              paymentMethodId={selectedMethod.id}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}


