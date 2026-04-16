import { Topbar } from "@/components/shared/Topbar";
import Link from "next/link";
import type { Metadata } from "next";
import { UsersRound } from "lucide-react";
import TableDiagram from "@/components/app/table/TableDiagram";

export const metadata: Metadata = {
  title: "Table & Order — IRMS",
};

type TableStatus = "available" | "occupied" | "waiting";

interface TableData {
  id: number;
  seats: number;
  /** Guests currently seated at this table */
  seatedGuests?: number;
  status: TableStatus;
  time?: string;
  guest?: string;
  hasAlert?: boolean;
}

const TABLES: TableData[] = [
  { id: 1, seats: 4, seatedGuests: 0, status: "available" },
  {
    id: 5,
    seats: 2,
    seatedGuests: 2,
    status: "occupied",
    time: "42M",
    guest: "Mr. Sterling Archer",
    hasAlert: true,
  },
  { id: 12, seats: 6, seatedGuests: 0, status: "available" },
  {
    id: 8,
    seats: 4,
    seatedGuests: 3,
    status: "occupied",
    time: "1H 15M",
    guest: "Dr. Linda Watson",
    hasAlert: true,
  },
  { id: 2, seats: 4, seatedGuests: 0, status: "available" },
  {
    id: 10,
    seats: 2,
    seatedGuests: 2,
    status: "occupied",
    time: "1H 15M",
    guest: "Ms. Elena Gilbert",
    hasAlert: true,
  },
  { id: 3, seats: 4, seatedGuests: 0, status: "available" },
  { id: 4, seats: 4, seatedGuests: 2, status: "waiting", time: "12M", guest: "Mr. David Chou" },
];

const STATUS_STYLES: Record<
  TableStatus,
  { dot: string; label: string; text: string }
> = {
  available: {
    dot: "bg-green-400",
    label: "AVAILABLE",
    text: "text-green-600",
  },
  occupied: { dot: "bg-red-500", label: "OCCUPIED", text: "text-red-600" },
  waiting: { dot: "bg-gray-400", label: "WAITING", text: "text-gray-500" },
};

const NUM_STYLES: Record<TableStatus, string> = {
  available: "text-[#1a4035]",
  occupied: "text-red-400 bg-red-50 rounded-lg px-1",
  waiting: "text-gray-500 bg-gray-100 rounded-lg px-1",
};

export default function TablesPage() {
  const emptyCount = TABLES.filter((t) => t.status === "available").length;
  const waitingCount = TABLES.filter((t) => t.status === "waiting").length;
  const occupiedGuests =
    TABLES.filter((t) => t.status === "occupied").length * 2; // approx

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <Topbar title="Table & Order" />

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table grid */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            {TABLES.map((table) => {
              const s = STATUS_STYLES[table.status];
              return (
                <div
                  key={table.id}
                  className="bg-white rounded-xl border border-irms-border p-5 relative hover:shadow-md transition-shadow"
                >
                  {/* Table number + seats */}
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

                  {/* Status */}
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

                  {/* Table diagram */}
                  <div className="flex justify-center my-3">
                    <div className="w-[88px] h-[88px]">
                      <TableDiagram
                        capacity={table.seats as 2 | 4 | 6 | 8}
                        guests={table.seatedGuests ?? 0}
                      />
                    </div>
                  </div>

                  {/* Guest name */}
                  <p className="font-semibold text-irms-text-primary mb-4 truncate">
                    {table.guest ?? "Ready for Service"}
                  </p>

                  {/* CTA */}
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
        </div>

        {/* Service overview sidebar */}
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

          {/* Capacity */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#374151]">Daily Capacity</span>
              <span className="text-sm font-bold text-irms-text-primary">
                82%
              </span>
            </div>
            <div className="h-2 bg-irms-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-irms-green rounded-full"
                style={{ width: "82%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
