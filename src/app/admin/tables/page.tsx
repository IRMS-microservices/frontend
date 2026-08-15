"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import TableDiagram from "@/components/app/table/TableDiagram";
import { TableService } from "@/services/table.service";
import { TableResponse, TableStatus } from "@/types/table.types";
import { Loader2, Minus, Plus, Search, ChevronRight } from "lucide-react";

type SupportedCapacity = 2 | 4 | 6 | 8;

const supportedCapacities: SupportedCapacity[] = [2, 4, 6, 8];

const clampCapacity = (value: number): SupportedCapacity => {
  if (value <= 2) return 2;
  if (value <= 4) return 4;
  if (value <= 6) return 6;
  return 8;
};

const nextCapacity = (value: number, direction: 1 | -1): SupportedCapacity => {
  const current = clampCapacity(value);
  const index = supportedCapacities.indexOf(current);
  const nextIndex = Math.min(
    supportedCapacities.length - 1,
    Math.max(0, index + direction),
  );
  return supportedCapacities[nextIndex];
};

export default function AdminTablesPage() {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTableNumber, setCreateTableNumber] = useState(0);
  const [createTableCapacity, setCreateTableCapacity] =
    useState<SupportedCapacity>(4);
  const [createTableStatus, setCreateTableStatus] = useState<TableStatus>(
    TableStatus.AVAILABLE,
  );
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [tableActionError, setTableActionError] = useState<string | null>(null);

  const loadTables = useCallback(async (preferredSelectedId?: string) => {
    setLoading(true);
    setTableActionError(null);

    try {
      const tablesRes = await TableService.getTables({ limit: 999999 });

      const source = tablesRes.success ? (tablesRes.data ?? []) : [];
      const initialTables = source.map(
        (table): TableResponse => ({
          ...table,
          capacity: clampCapacity(table.capacity),
        }),
      );

      setTables(initialTables);
      setSelectedId((current) => {
        if (
          preferredSelectedId &&
          initialTables.some((table) => table.id === preferredSelectedId)
        ) {
          return preferredSelectedId;
        }
        return initialTables[0]?.id ?? current ?? null;
      });

      return initialTables;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTables();
  }, [loadTables]);

  const filteredTables = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tables.filter((table) => {
      if (!term) return true;
      return [table.tableNumber, table.status, table.capacity]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [search, tables]);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedId) ?? null,
    [selectedId, tables],
  );

  const handleSelect = (tableId: string) => {
    setSelectedId(tableId);
  };

  const adjustCapacity = (tableId: string, direction: 1 | -1) => {
    const currentTable = tables.find((table) => table.id === tableId);
    if (!currentTable) return;

    const updatedCapacity = nextCapacity(currentTable.capacity, direction);
    const previousTables = tables;
    setTableActionError(null);

    setTables((current) =>
      current.map((table) =>
        table.id === tableId
          ? {
              ...table,
              capacity: updatedCapacity,
              currentGuestsNumber: Math.min(
                table.currentGuestsNumber ?? 0,
                updatedCapacity,
              ),
            }
          : table,
      ),
    );

    void (async () => {
      try {
        const response = await TableService.updateTable(tableId, {
          capacity: updatedCapacity,
        });
        if (!response.success || !response.data) {
          throw new Error(
            response.message || "Failed to update table capacity.",
          );
        }
      } catch (error) {
        setTables(previousTables);
        setTableActionError(
          error instanceof Error
            ? error.message
            : "Failed to update table capacity.",
        );
      }
    })();
  };

  const handleCreateTable = async () => {
    setIsSubmittingCreate(true);
    setTableActionError(null);
    try {
      const response = await TableService.createTable({
        tableNumber: createTableNumber || tables.length + 1,
        capacity: createTableCapacity,
        status: createTableStatus,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create table.");
      }

      setIsCreateOpen(false);
      setCreateTableNumber(0);
      setCreateTableCapacity(4);
      setCreateTableStatus(TableStatus.AVAILABLE);
      await loadTables(response.data.id);
    } catch (error) {
      setTableActionError(
        error instanceof Error ? error.message : "Failed to create table.",
      );
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const totalTables = tables.length;

  return (
    <div className="h-screen flex overflow-hidden bg-[#F4F7F6]">
      <AdminSidebar />

      <main className="ml-60 flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex flex-col flex-1 min-h-0 px-8 py-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 shrink-0">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-500">
                Configuration
              </p>
              <h1 className="mt-3 text-3xl font-bold text-irms-text-primary">
                Table Management
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                Configure dining areas, capacities, and layout spatiality.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-irms-green px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-irms-green/20 transition hover:bg-irms-green-light"
            >
              <Plus className="h-4 w-4" />
              Add Table
            </button>
          </div>

          {tableActionError && (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shrink-0">
              {tableActionError}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[340px_1fr] flex-1 min-h-0 overflow-hidden p-2">
            <section className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-black/5 flex flex-col min-h-0">
              <div className="mb-5 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-irms-text-primary">
                  Active Tables
                </h2>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                  {totalTables} total
                </span>
              </div>

              <div className="mb-5 rounded-2xl bg-[#F4F7F6] px-4 py-3 ring-1 ring-black/5 shrink-0">
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tables..."
                    className="w-full bg-transparent text-sm text-irms-text-primary outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-irms-green" />
                  Loading tables...
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-[#FAFBFC] px-5 py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF7F0] text-irms-green">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-irms-text-primary">
                    No tables found
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    No table records are available for this restaurant yet.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
                  {filteredTables.map((table, idx) => {
                    const isSelected = selectedId === table.id;
                    const capacity = clampCapacity(table.capacity);
                    return (
                      <div
                        key={`${table.id}-${idx}`}
                        onClick={() => handleSelect(table.id)}
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition cursor-pointer ${
                          isSelected
                            ? "border-irms-green bg-[#F4FBF7] shadow-md"
                            : "border-gray-100 bg-[#FAFBFC] hover:border-gray-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${isSelected ? "bg-irms-green text-white" : "bg-white text-irms-text-primary ring-1 ring-black/5"}`}
                          >
                            {String(table.tableNumber).padStart(2, "0")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mt-1 text-xs text-gray-500">
                              ID: {table.id}
                            </div>
                          </div>
                          <span className="inline-flex -mt-2 mb-auto items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 ring-1 ring-black/5">
                            {table.status}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                            Capacity
                            <div className="mt-1 text-base text-irms-text-primary">
                              {capacity} seats
                            </div>
                          </div>
                          <div className="flex items-center gap-1 rounded-xl bg-white px-2 py-1.5 ring-1 ring-black/5">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                adjustCapacity(table.id, -1);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition hover:bg-gray-200"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-9 text-center text-sm font-bold text-irms-text-primary">
                              {capacity}
                            </span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                adjustCapacity(table.id, 1);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition hover:bg-gray-200"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-irms-green">
                            <ChevronRight className="h-4 w-4" />
                            Selected
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-black/5 flex flex-col min-h-0 overflow-hidden">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-irms-text-primary">
                    Table Preview
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Select a table on the left to view a large diagram here.
                  </p>
                </div>
              </div>

              {selectedTable ? (
                <div className="rounded-4xl overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_30%),linear-gradient(180deg,#fbfcfd,#f7f9fa)] h-100 p-6">
                  <div className="rounded-4xl max-h-80 px-6 py-4 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400">
                          Selected Table
                        </div>
                        <p className="mt-2 text-sm text-gray-600 flex gap-2">
                          <span>
                            <strong>ID: </strong> {selectedTable.id}
                          </span>{" "}
                          |
                          <span>
                            <strong> Status:</strong> {selectedTable.status}
                          </span>{" "}
                          |
                          <span>
                            <strong> Capacity:</strong>{" "}
                            {clampCapacity(selectedTable.capacity)}
                          </span>
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#F8FAFB] px-4 py-3 text-right ring-1 ring-black/5">
                        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">
                          Guests
                        </div>
                        <div className="mt-1 text-2xl font-bold text-irms-text-primary">
                          {Math.min(
                            selectedTable.currentGuestsNumber ?? 0,
                            clampCapacity(selectedTable.capacity),
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-45 -mt-5 flex items-center">
                      <TableDiagram
                        capacity={clampCapacity(selectedTable.capacity)}
                        guests={Math.min(
                          selectedTable.currentGuestsNumber ?? 0,
                          clampCapacity(selectedTable.capacity),
                        )}
                        className="mx-auto w-2 origin-center"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-95 items-center justify-center rounded-4xl bg-[#F8FAFB] text-sm text-gray-500 ring-1 ring-black/5">
                  Select a table to preview its diagram.
                </div>
              )}

              {selectedTable && (
                <div className="mt-4 rounded-2xl bg-[#F8FAFB] px-4 py-3 text-sm text-gray-600 ring-1 ring-black/5">
                  <span className="font-bold text-irms-text-primary">
                    Table number {selectedTable.tableNumber}
                  </span>{" "}
                  is selected. Use the capacity controls to adjust the table
                  diagram.
                </div>
              )}

              <div className="mt-4 grid gap-3 text-xs text-gray-500 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#F8FAFB] px-4 py-3 ring-1 ring-black/5">
                  <div className="font-bold uppercase tracking-[0.2em] text-gray-400">
                    Selected
                  </div>
                  <div className="mt-1 text-sm font-semibold text-irms-text-primary">
                    {selectedTable?.tableNumber ?? "None"}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFB] px-4 py-3 ring-1 ring-black/5">
                  <div className="font-bold uppercase tracking-[0.2em] text-gray-400">
                    Capacity
                  </div>
                  <div className="mt-1 text-sm font-semibold text-irms-text-primary">
                    {selectedTable ? clampCapacity(selectedTable.capacity) : 0}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFB] px-4 py-3 ring-1 ring-black/5">
                  <div className="font-bold uppercase tracking-[0.2em] text-gray-400">
                    Guests
                  </div>
                  <div className="mt-1 text-sm font-semibold text-irms-text-primary">
                    {selectedTable?.currentGuestsNumber ?? 0}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-4xl bg-white p-7 shadow-2xl shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
                  Add Table
                </p>
                <h3 className="mt-2 text-2xl font-bold text-irms-text-primary">
                  Create new table
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  New tables are saved through the API immediately, then added
                  to the floor plan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Table Number
                </span>
                <input
                  value={createTableNumber}
                  onChange={(event) =>
                    setCreateTableNumber(Number(event.target.value))
                  }
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                  placeholder="04"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Capacity
                  </span>
                  <select
                    value={createTableCapacity}
                    onChange={(event) =>
                      setCreateTableCapacity(
                        Number(event.target.value) as SupportedCapacity,
                      )
                    }
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                  >
                    {supportedCapacities.map((capacity) => (
                      <option key={capacity} value={capacity}>
                        {capacity}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <select
                    value={createTableStatus}
                    onChange={(event) =>
                      setCreateTableStatus(event.target.value as TableStatus)
                    }
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                  >
                    {["AVAILABLE", "OCCUPIED", "DIRTY", "WAITING"].map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-2xl cursor-pointer bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTable}
                disabled={isSubmittingCreate}
                className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-irms-green px-5 py-3 text-sm font-bold text-white transition hover:bg-irms-green-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmittingCreate ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
