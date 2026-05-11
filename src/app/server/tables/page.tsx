"use client";

import { Topbar } from "@/components/shared/Topbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import TableDiagram from "@/components/app/table/TableDiagram";
import { OrderService } from "@/services/order.service";
import { TableService } from "@/services/table.service";
import { CustomerService } from "@/services/customer.service";
import { TableStatus } from "@/types/table.types";

interface TableData {
  id: number;
  seats: number;
  seatedGuests?: number;
  status: TableStatus;
  time?: string;
  guest?: string;
  hasAlert?: boolean;
}

const STATUS_STYLES: Record<
  TableStatus,
  { dot: string; label: string; text: string }
> = {
  Available: {
    dot: "bg-green-400",
    label: "AVAILABLE",
    text: "text-green-600",
  },
  Occupied: { dot: "bg-red-500", label: "OCCUPIED", text: "text-red-600" },
  Waiting: { dot: "bg-orange-400", label: "WAITING", text: "text-orange-500" },
  Dirty: { dot: "bg-amber-700", label: "DIRTY", text: "text-amber-800" },
};

const NUM_STYLES: Record<TableStatus, string> = {
  Available: "text-[#1a4035]",
  Occupied: "text-red-400 bg-red-50 rounded-lg px-1",
  Waiting: "text-orange-500 bg-orange-50 rounded-lg px-1",
  Dirty: "text-amber-800 bg-amber-50 rounded-lg px-1",
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTablesAndOrders = async () => {
      try {
        const [tableRes, orderRes, customerRes] = await Promise.all([
          TableService.getTables(),
          OrderService.getOrders(),
          CustomerService.getAllCustomers(),
        ]);

        const backendTables = tableRes.data;
        const orders = orderRes.data;
        const customers = customerRes.data;

        const dynamicTables: TableData[] = backendTables.map((bt) => {
          const activeOrder = orders?.find(
            (o) =>
              o.tableId === bt.tableId &&
              (o.serviceStatus === "Waiting" || o.serviceStatus === "Eating"),
          );

          let status: TableStatus = TableStatus.AVAILABLE;
          switch (bt.status) {
            case TableStatus.OCCUPIED:
              status = TableStatus.OCCUPIED;
              break;
            case TableStatus.WAITING:
              status = TableStatus.WAITING;
              break;
            case TableStatus.DIRTY:
              status = TableStatus.DIRTY;
              break;
            default:
              status = TableStatus.AVAILABLE;
          }

          const customer = activeOrder
            ? customers?.find((c) => c.customerId === activeOrder.customerId)
            : null;

          const customerDisplay =
            customer?.gender === "Male"
              ? `Mr. ${customer?.name}`
              : `Ms. ${customer?.name}`;

          const startTime = new Date(activeOrder?.createdAt || "");
          const now = new Date();
          const diffMs = now.getTime() - startTime.getTime();
          const diffHours = Math.floor(diffMs / 3600000);
          const diffMins = Math.floor((diffMs % 3600000) / 60000);
          const timeString =
            diffHours > 0 ? `${diffHours}h ${diffMins}m` : `${diffMins}m`;

          return {
            id: bt.tableId,
            seats: bt.capacity,
            seatedGuests: bt.currentGuestsNumber,
            status: status,
            time: activeOrder ? timeString : "",
            guest: customer
              ? customerDisplay
              : activeOrder
                ? "Active Order"
                : "Ready for Service",
            hasAlert: bt.status === TableStatus.WAITING,
          };
        });

        setTables(dynamicTables);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tables/orders:", error);
        setLoading(false);
      }
    };

    fetchTablesAndOrders();
  }, []);

  const emptyCount = tables.filter(
    (t) => t.status === TableStatus.AVAILABLE,
  ).length;
  const waitingCount = tables.filter(
    (t) => t.status === TableStatus.WAITING,
  ).length;
  const occupiedGuests = tables.reduce(
    (acc, t) => acc + (t.seatedGuests || 0),
    0,
  );

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Table & Order" />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-irms-text-muted">
              Loading tables...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {tables
                .sort((a, b) => a.id - b.id)
                .map((table) => {
                  const s = STATUS_STYLES[table.status];
                  return (
                    <div
                      key={table.id}
                      className="bg-white rounded-xl border border-irms-border p-5 relative hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className={`text-3xl font-bold ${NUM_STYLES[table.status]}`}
                        >
                          {String(table.id).padStart(2, "0")}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-irms-text-muted">
                          <UsersRound className="w-4 h-4" />
                          {table.seats} Seats
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider ${s.text} mb-1`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                        {table.time && (
                          <span className="text-irms-text-muted font-normal ml-1">
                            • {table.time}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-center my-3">
                        <div className="w-[88px] h-[88px]">
                          <TableDiagram
                            capacity={table.seats as 2 | 4 | 6 | 8}
                            guests={table?.seatedGuests!}
                          />
                        </div>
                      </div>

                      <p className="font-semibold text-irms-text-primary mb-4 truncate text-sm">
                        {table.guest ?? "Ready for Service"}
                      </p>

                      <Link
                        href={`/server/tables/${table.id}`}
                        className="block text-center text-xs font-bold tracking-widest text-white bg-linear-to-r from-irms-green to-irms-green/80 hover:from-irms-green/80 hover:to-irms-green py-2.5 px-4 rounded-lg transition-colors duration-300"
                      >
                        MANAGE TABLE
                      </Link>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="w-[350px] shrink-0 bg-white border-l border-irms-border p-6">
          <h2 className="text-xs font-bold text-irms-text-muted tracking-widest uppercase mb-5">
            Service Overview
          </h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-[#374151]">Empty Tables</span>
              </div>
              <span className="text-2xl font-bold text-irms-text-primary">
                {String(emptyCount).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-sm text-[#374151]">Waiting Service</span>
              </div>
              <span className="text-2xl font-bold text-irms-text-primary">
                {String(waitingCount).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-[#374151]">Seated Guests</span>
              </div>
              <span className="text-2xl font-bold text-irms-orange">
                {String(occupiedGuests).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#374151]">Daily Capacity</span>
              <span className="text-sm font-bold text-irms-text-primary">
                {tables.length > 0
                  ? Math.round(
                      ((tables.length - emptyCount) / tables.length) * 100,
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 bg-irms-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-irms-green rounded-full transition-all duration-500"
                style={{
                  width: `${tables.length > 0 ? Math.round(((tables.length - emptyCount) / tables.length) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
