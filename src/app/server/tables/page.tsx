"use client";

import { Topbar } from "@/components/shared/Topbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import TableDiagram from "@/components/app/table/TableDiagram";
import { OrderService } from "@/services/order.service";
import { MOCK_TABLES } from "@/app/api/mockData";

type TableStatus = "available" | "occupied" | "waiting";

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
  available: { dot: "bg-green-400", label: "AVAILABLE", text: "text-green-600" },
  occupied: { dot: "bg-red-500", label: "OCCUPIED", text: "text-red-600" },
  waiting: { dot: "bg-gray-400", label: "WAITING", text: "text-gray-500" },
};

const NUM_STYLES: Record<TableStatus, string> = {
  available: "text-[#1a4035]",
  occupied: "text-red-400 bg-red-50 rounded-lg px-1",
  waiting: "text-gray-500 bg-gray-100 rounded-lg px-1",
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTablesAndOrders = async () => {
      try {
        const orders = await OrderService.getOrders();
        
        const dynamicTables: TableData[] = MOCK_TABLES.map(baseTable => {
          const activeOrder = orders.find(o => 
            o.tableId === baseTable.id && 
            (o.serviceStatus === 'Waiting' || o.serviceStatus === 'Eating')
          );

          if (activeOrder) {
            return {
              id: baseTable.id,
              seats: baseTable.seats,
              seatedGuests: 2, 
              status: activeOrder.serviceStatus === 'Waiting' ? 'waiting' : 'occupied',
              time: "Active", 
              guest: activeOrder.note ? `Note: ${activeOrder.note}` : `Customer #${activeOrder.customerId}`,
              hasAlert: activeOrder.serviceStatus === 'Waiting'
            };
          } else {
            return {
              id: baseTable.id,
              seats: baseTable.seats,
              seatedGuests: 0,
              status: "available"
            };
          }
        });

        setTables(dynamicTables);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setLoading(false);
      }
    };

    fetchTablesAndOrders();
    const interval = setInterval(fetchTablesAndOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const emptyCount = tables.filter((t) => t.status === "available").length;
  const waitingCount = tables.filter((t) => t.status === "waiting").length;
  const occupiedGuests = tables.filter((t) => t.status === "occupied").length * 2; 

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Table & Order" />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-irms-text-muted">Loading tables...</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {tables.map((table) => {
                const s = STATUS_STYLES[table.status];
                return (
                  <div
                    key={table.id}
                    className="bg-white rounded-xl border border-irms-border p-5 relative hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-3xl font-bold ${NUM_STYLES[table.status]}`}>
                        {String(table.id).padStart(2, "0")}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-irms-text-muted">
                        <UsersRound className="w-4 h-4" />
                        {table.seats} Seats
                      </span>
                    </div>

                    <div className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider ${s.text} mb-1`}>
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
                          guests={table.seatedGuests ?? 0}
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
                {Math.round(((MOCK_TABLES.length - emptyCount) / MOCK_TABLES.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-irms-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-irms-green rounded-full transition-all duration-500"
                style={{ width: `${Math.round(((MOCK_TABLES.length - emptyCount) / MOCK_TABLES.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
