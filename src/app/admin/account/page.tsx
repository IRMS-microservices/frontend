"use client";

import { useState, useEffect } from "react";
import { UserService } from "@/services/user.service";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NewStaffPanel } from "@/components/admin/NewStaffPanel";
import { Pagination } from "@/types/common.types";
import { UserResponse } from "@/types/user.types";

export default function AdminAccountPage() {
  const [users, setUsers] = useState<Pagination<UserResponse[]>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isFetching, setIsFetching] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsFetching(true);
    try {
      const response = await UserService.listUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const onPageSwitch = async (page: number) => {
    try {
      const response = await UserService.listUsers({ page });
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <AdminSidebar />

      <main className="flex-1 ml-60 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-irms-text-primary">
              Staff Management
            </h1>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search accounts..."
                className="pl-10 pr-4 py-2 bg-[#F0F2F5] border-none rounded-lg text-sm focus:ring-2 focus:ring-irms-green focus:outline-none w-70"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                  Total Staff
                </p>
                <h3 className="text-4xl font-bold text-irms-text-primary">
                  {users.total}
                </h3>
              </div>
              <p className="text-xs text-irms-green font-semibold mt-4 flex items-center gap-1">
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
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                +2 from last month
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                  Active Shifts
                </p>
                <h3 className="text-4xl font-bold text-irms-text-primary">
                  {users.total}
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span> Live
                operations
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                  Pending Requests
                </p>
                <h3 className="text-4xl font-bold text-irms-text-primary">
                  {users.total}
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-4">
                Leave & Shift Swaps
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-4 w-full text-left">
                Quick Action
              </p>
              <button
                onClick={() => setIsPanelOpen(true)}
                className="bg-irms-green hover:bg-irms-green-light text-white rounded-xl px-4 py-3 w-full flex items-center justify-center gap-2 font-bold shadow-md transition-colors text-sm"
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Register New Account
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-irms-text-primary">
                Employee Directory
              </h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors">
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
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Filter Roles
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors">
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold tracking-wider uppercase text-gray-400">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isFetching ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      Loading directory...
                    </td>
                  </tr>
                ) : (
                  users.data?.map((user: UserResponse) => {
                    const initials = user.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : user.username?.substring(0, 2).toUpperCase();

                    const roleColor =
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "KITCHEN"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700";

                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              user.role === "ADMIN"
                                ? "bg-[#D1F2D1] text-irms-green"
                                : user.role === "KITCHEN"
                                  ? "bg-[#E0E7FF] text-[#4F46E5]"
                                  : "bg-[#F3E8FF] text-[#9333EA]"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-irms-text-primary">
                              {user.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.role}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${roleColor}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.username.toLowerCase()}@culinarycurator.com
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                            Active
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-700 transition-colors mr-4">
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
                              <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon>
                            </svg>
                          </button>
                          <button className="text-red-400 hover:text-red-600 transition-colors">
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
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
              <span>
                Showing {users.limit * (users.page - 1) + 1} -{" "}
                {Math.min(users.limit * users.page, users.total)} of{" "}
                {users.total} members
              </span>
              <div className="flex gap-1">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    const currentGroupStart =
                      Math.floor((users.page - 1) / 5) * 5 + 1;
                    onPageSwitch(Math.max(1, currentGroupStart - 1));
                  }}
                  disabled={users.page <= 5}
                >
                  &lt;
                </button>
                {Array.from(
                  {
                    length: Math.min(
                      5,
                      users.totalPages - Math.floor((users.page - 1) / 5) * 5,
                    ),
                  },
                  (_, i) => {
                    const pageNum =
                      Math.floor((users.page - 1) / 5) * 5 + i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${users.page === pageNum ? "bg-irms-green text-white" : "bg-gray-50 hover:bg-gray-100"}`}
                        onClick={() => onPageSwitch(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    const currentGroupStart =
                      Math.floor((users.page - 1) / 5) * 5 + 1;
                    onPageSwitch(
                      Math.min(users.totalPages, currentGroupStart + 5),
                    );
                  }}
                  disabled={
                    Math.floor((users.page - 1) / 5) * 5 + 5 >= users.totalPages
                  }
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <NewStaffPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSuccess={() => {
          setIsPanelOpen(false);
          fetchUsers();
        }}
      />
    </div>
  );
}
