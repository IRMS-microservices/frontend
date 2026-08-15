"use client";

import { Topbar } from "@/components/shared/Topbar";
import Link from "next/link";
import { useState, useEffect, use, useCallback } from "react";
import { UsersRound } from "lucide-react";
import TableDiagram from "@/components/app/table/TableDiagram";
import AssignGuestModal from "@/components/app/table/AssignGuestModal";
import { CustomerInfoModal } from "@/components/app/table/CustomerInfoModal";
import { OrderService } from "@/services/order.service";
import { OrderResponse, ServiceStatus } from "@/types/menuOrder.types";
import { TableService } from "@/services/table.service";
import { CustomerService } from "@/services/customer.service";
import { TableResponse, TableStatus } from "@/types/table.types";

type TableState = "empty" | "assigned";

interface GuestInfo {
  name: string;
  gender: string;
  phone: string;
  partySize: number;
  preference: string;
}

const TABLE_ATTRS = [
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1a4035"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    title: "Window Side",
    desc: "Premium view of the garden",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1a4035"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    title: "Quiet Zone",
    desc: "Ideal for intimate conversations",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1a4035"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Power Access",
    desc: "Under-table charging available",
  },
];

export default function TableDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tableId = resolvedParams.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const [tableState, setTableState] = useState<TableState>("empty");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);
  const [tableInfo, setTableInfo] = useState<TableResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTableStatus = async () => {
      setIsLoading(true);
      setGuest(null); // ← reset guest before each fetch so the !guest guard doesn't block
      try {
        const [tableRes, ordersRes] = await Promise.all([
          TableService.getTable(tableId),
          OrderService.getOrders({ tableId }),
        ]);

        const tableData = tableRes.data;
        setTableInfo(tableData);

        const orders = ordersRes.data;
        const currentActiveOrder = orders?.data.find(
          (o) =>
            o.serviceStatus === ServiceStatus.WAITING ||
            o.serviceStatus === ServiceStatus.EATING,
        );

        let customerData = null;
        if (currentActiveOrder?.customerId) {
          try {
            const customerRes = await CustomerService.getCustomerById(
              currentActiveOrder.customerId,
            );
            customerData = customerRes.data;
          } catch (e) {
            console.error("Failed to fetch customer", e);
          }
        }

        if (tableData?.status !== TableStatus.AVAILABLE || currentActiveOrder) {
          if (currentActiveOrder) setActiveOrder(currentActiveOrder);
          setTableState("assigned");

          let localGuest = null;
          try {
            const saved = localStorage.getItem(`table_guest_${tableId}`);
            if (saved) localGuest = JSON.parse(saved);
          } catch (e) {}

          // ← removed !guest guard, always set from fresh fetch
          if (localGuest && !currentActiveOrder) {
            setGuest(localGuest);
          } else {
            const customerDisplay = customerData
              ? customerData.gender === "Male"
                ? `Mr. ${customerData.name}`
                : `Ms. ${customerData.name}`
              : null;

            setGuest({
              name:
                customerDisplay ||
                (currentActiveOrder?.note
                  ? `Note: ${currentActiveOrder.note}`
                  : `Guest #${currentActiveOrder?.customerId || "Walk-in"}`),
              gender: customerData?.gender || "N/A",
              phone: customerData?.phone || "N/A",
              partySize: tableData?.currentGuestsNumber || 0,
              preference: "N/A",
            });
          }
        } else {
          setActiveOrder(null);
          setTableState("empty");
          setGuest(null);
        }
      } catch (error) {
        console.error("Failed to check table status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTableStatus();
  }, [tableId, refreshKey]);

  const handleConfirmAssign = async (g: GuestInfo) => {
    try {
      // 1. Create customer first to get real customerId
      let customerId: string | undefined;
      try {
        const customerRes = await CustomerService.createCustomer({
          name: g.name,
          gender: g.gender,
          phone: g.phone,
        });
        customerId = customerRes.data.id;

        // Save to localStorage immediately
        localStorage.setItem(
          `table_guest_${tableId}`,
          JSON.stringify({
            ...g,
            customerId: customerId,
          }),
        );
      } catch (err) {
        console.error("Failed to create customer:", err);
        localStorage.setItem(`table_guest_${tableId}`, JSON.stringify(g));
      }

      // 2. Assign table with customer info
      await TableService.updateTable(tableId, {
        status: TableStatus.OCCUPIED,
        currentGuestsNumber: g.partySize,
        customerId: customerId,
      });

      setGuest(g);
      setTableState("assigned");
      setShowAssignModal(false);
    } catch (e) {
      console.error("Failed to assign table:", e);
      alert("Failed to assign table. Please try again.");
    }
  };

  // Clear table button — replace the inline onClick
  const handleClearTable = async () => {
    try {
      await TableService.updateTable(tableId, {
        status: TableStatus.AVAILABLE,
        currentGuestsNumber: 0,
        customerId: undefined,
      });

      // Refresh table info
      const tableRes = await TableService.getTable(tableId);
      setTableInfo(tableRes.data);

      localStorage.removeItem(`table_guest_${tableId}`);
      localStorage.removeItem(`table_cart_${tableId}`);

      setTableState("empty");
      setGuest(null);
      setActiveOrder(null);
    } catch (e) {
      console.error("Failed to clear table:", e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <Topbar title="Table & Order" />

      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-irms-text-muted font-semibold tracking-widest uppercase mb-3">
            <Link
              href="/server/tables"
              className="hover:text-irms-green transition-colors"
            >
              Table Tracking
            </Link>
            <span>›</span>
            <span className="text-irms-text-primary">
              Table {tableId} Detail
            </span>
          </nav>

          {/* Title */}
          <h2 className="text-4xl font-bold text-irms-text-primary mb-2">
            Table {tableId}
          </h2>
          <p className="text-sm text-irms-text-muted flex items-center gap-2 mb-8">
            <span
              className={`w-2 h-2 rounded-full ${tableState === "empty" ? "bg-green-400" : "bg-irms-orange"}`}
            />
            {tableState === "empty" ? (
              `Status: Currently Available • Capacity: ${tableInfo?.capacity ?? 4} Guests`
            ) : (
              <>
                <span>Status: Assigned to</span>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="text-irms-orange font-semibold hover:underline cursor-pointer"
                >
                  {guest?.name}
                </button>
                <span>• Capacity: {tableInfo?.capacity ?? 4} Guests</span>
              </>
            )}
          </p>

          {/* State card */}
          <div className="bg-white rounded-2xl border border-irms-border flex flex-col items-center justify-center py-16 px-8 text-center min-h-100">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-irms-green/20 border-t-irms-green rounded-full animate-spin" />
                <p className="text-irms-text-muted font-medium">
                  Checking table status...
                </p>
              </div>
            ) : tableState === "empty" ? (
              <>
                {/* Table diagram – empty */}
                <div className="w-28 h-28 mb-5">
                  <TableDiagram
                    capacity={(tableInfo?.capacity as 2 | 4 | 6 | 8) ?? 4}
                    guests={0}
                  />
                </div>
                <h3 className="text-2xl font-bold text-irms-text-primary mb-2">
                  Table is Empty
                </h3>
                <p className="text-irms-text-muted text-sm max-w-xs mb-8">
                  This table is currently ready for guests. You can assign a
                  walk-in or check in a reservation to start service.
                </p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-2 bg-irms-green hover:bg-irms-green/80 text-white font-semibold py-3 px-8 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Assign Guest
                </button>
              </>
            ) : (
              <>
                {/* Table diagram – assigned */}
                <div className="w-48 h-48 mb-5">
                  <TableDiagram
                    capacity={(tableInfo?.capacity as 2 | 4 | 6 | 8) ?? 4}
                    guests={guest?.partySize ?? 0}
                  />
                </div>
                <h3 className="text-xl font-bold text-irms-text-primary mb-8">
                  <span className="text-irms-green">Table {tableId}</span> has
                  been assigned to the customer
                </h3>

                <div className="w-full max-w-lg flex gap-3">
                  <Link
                    href={`/server/tables/${tableId}/payment`}
                    className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-irms-green-dark to-irms-green-light cursor-pointer duration-500
                              hover:bg-linear-to-r hover:from-irms-green-light hover:to-irms-green-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
                  >
                    <UsersRound />
                    Track items and payment
                  </Link>
                  <Link
                    href={`/server/tables/${tableId}/order`}
                    className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-orange-600 to-orange-400 cursor-pointer duration-500
                              hover:bg-linear-to-r hover:from-orange-400 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                    </svg>
                    Create order
                  </Link>
                  <button
                    onClick={handleClearTable}
                    className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-gray-300 to-gray-100 cursor-pointer duration-500
                              hover:bg-linear-to-r hover:from-gray-100 hover:to-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Clear Table
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right attributes sidebar */}
        <div className="w-70 shrink-0 p-6 space-y-4">
          <div className="bg-white rounded-xl border border-irms-border p-5">
            <h3 className="text-xs font-bold text-irms-text-muted tracking-widest uppercase mb-4">
              Table Attributes
            </h3>
            <div className="space-y-4">
              {TABLE_ATTRS.map((attr) => (
                <div key={attr.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-irms-bg-secondary flex items-center justify-center shrink-0">
                    {attr.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-irms-text-primary">
                      {attr.title}
                    </p>
                    <p className="text-xs text-irms-text-muted">{attr.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tableState === "assigned" && guest && (
            <div className="bg-white rounded-xl border border-irms-border p-5">
              <h3 className="text-xs font-bold text-irms-text-muted tracking-widest uppercase mb-3">
                Staff Notes
              </h3>
              <p className="text-xs text-irms-text-primary italic">
                &quot;Recently polished cherry wood. Ensure center candle is lit
                upon seating.&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAssignModal && (
        <AssignGuestModal
          tableId={tableId}
          onClose={() => setShowAssignModal(false)}
          onConfirm={handleConfirmAssign}
        />
      )}
      {showInfoModal && guest && (
        <CustomerInfoModal
          guest={guest}
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </div>
  );
}
