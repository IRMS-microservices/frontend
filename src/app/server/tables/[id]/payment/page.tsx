"use client";

import { Topbar } from "@/components/shared/Topbar";
import Link from "next/link";
import { JSX, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { OrderResponse } from "@/types/menuOrder.types";

type PaymentMethod = "CREDIT CARD" | "QR CODE" | "CASH" | "DIGITAL WALLET";

const STATUS_STYLES: Record<string, string> = {
  SERVED: "text-green-600",
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

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CREDIT CARD");
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await OrderService.getOrders(parseInt(tableId));
        const orders = response.data;
        // Find active order (Waiting or Eating)
        const currentActiveOrder = orders?.find(
          (o) => o.serviceStatus === "Waiting" || o.serviceStatus === "Eating",
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

  const subtotal = activeOrder
    ? activeOrder.items.reduce(
        (sum, item) => sum + item.salePrice * item.quantity,
        0,
      )
    : 0;

  const serviceCharge = subtotal * 0.18;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + serviceCharge + tax;

  const handlePayment = async () => {
    if (!activeOrder) return;
    setIsProcessing(true);
    try {
      // Gọi API cập nhật trạng thái
      await OrderService.updatePaymentStatus(activeOrder.orderId, "Paid");
      await OrderService.updateServiceStatus(activeOrder.orderId, "Finished");

      alert("Payment successful! Table is now clear.");
      router.push("/server/tables");
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const PAYMENT_METHODS: { label: PaymentMethod; icon: JSX.Element }[] = [
    {
      label: "CREDIT CARD",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
    },
    {
      label: "QR CODE",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="5" height="5" />
          <rect x="16" y="3" width="5" height="5" />
          <rect x="3" y="16" width="5" height="5" />
          <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
          <line x1="21" y1="21" x2="21" y2="21" />
          <path d="M3.03 14H5" />
          <path d="M9 13v2" />
          <path d="M11 11h2v2" />
          <path d="M14 11h1" />
        </svg>
      ),
    },
    {
      label: "CASH",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      ),
    },
    {
      label: "DIGITAL WALLET",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
        </svg>
      ),
    },
  ];

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
              Table {tableId} Detail
            </Link>
            <span>›</span>
            <span className="text-irms-text-primary">Payment</span>
          </nav>

          <h2 className="text-4xl font-bold text-irms-text-primary mb-2">
            Table {tableId}
          </h2>
          <div className="flex items-center gap-3 text-sm text-irms-text-muted mb-8">
            <span>Server: Julian</span>
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
            <span>Customer #{activeOrder?.customerId || "Walk-in"}</span>
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
                  Order Details (ID: #{activeOrder.orderId})
                </h3>
                <span className="text-xs font-bold text-irms-text-muted tracking-widest">
                  {activeOrder.items.reduce((s, i) => s + i.quantity, 0)} ITEMS
                  TOTAL
                </span>
              </div>

              <div className="space-y-4">
                {activeOrder.items.map((item, idx) => {
                  const itemStatus =
                    activeOrder.serviceStatus === "Waiting"
                      ? "WAITING"
                      : "SERVED";
                  return (
                    <div
                      key={item.itemId}
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
                        className={`flex items-center gap-1 text-xs font-semibold ${STATUS_STYLES[itemStatus]}`}
                      >
                        {STATUS_ICONS[itemStatus]}
                        {itemStatus}
                      </div>
                      <span className="text-sm font-bold text-irms-text-primary w-32 text-right">
                        {(item.salePrice * item.quantity).toLocaleString(
                          "vi-VN",
                          {
                            style: "currency",
                            currency: "VND",
                          },
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right — payment summary */}
        <div className="w-[350px] shrink-0 bg-white border-l border-irms-border flex flex-col p-6 overflow-y-auto">
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
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.label}
                onClick={() => setPaymentMethod(m.label)}
                disabled={!activeOrder}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 text-xs font-bold tracking-wider transition-all cursor-pointer ${
                  paymentMethod === m.label
                    ? "bg-white border-irms-green text-irms-green"
                    : "bg-irms-bg-secondary border-irms-border text-irms-text-muted hover:border-irms-green/40"
                } ${!activeOrder ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handlePayment}
            disabled={!activeOrder || isProcessing}
            className={`flex items-center justify-center gap-2 w-full duration-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm
              ${
                !activeOrder || isProcessing
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
            {isProcessing ? "PROCESSING..." : "Complete Payment & Clear Table"}
          </button>
          <button
            disabled={!activeOrder}
            className="w-full mt-3 py-3 rounded-xl bg-irms-bg-secondary hover:bg-irms-bg-secondary-dark text-irms-text-primary font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Tip Manually
          </button>
        </div>
      </div>
    </div>
  );
}
