"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { IrmsLogo } from "@/components/shared/IrmsLogo";

type User = {
  id: string; // username
  name: string; // fullName
  phone: string;
  role: string;
};

const initialUsers: User[] = [
  { id: "admin_master", name: "Charlie Davis", phone: "+1 555 123 4567", role: "ADMIN" },
  { id: "staff_001", name: "Alice Johnson", phone: "+1 234 567 8900", role: "SERVER" },
  { id: "kitchen_02", name: "Bob Smith", phone: "+1 987 654 3210", role: "KITCHEN" },
];

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("SERVER");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const openAddModal = () => {
    setModalMode("ADD");
    setEditingUserId(null);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setPhoneNumber("");
    setRole("SERVER");
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("EDIT");
    setEditingUserId(user.id);
    setUsername(user.id);
    setFullName(user.name);
    setPhoneNumber(user.phone);
    setRole(user.role);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setError("");
    setSuccessMsg("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    if (modalMode === "ADD" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      if (modalMode === "ADD") {
        // Real API call for adding (Register)
        const response = await AuthService.register({ username, password, fullName, phoneNumber });
        if (response.success) {
          setSuccessMsg("User successfully registered!");
          setUsers([...users, { id: username, name: fullName, phone: phoneNumber, role }]);
          setTimeout(closeAndResetModal, 1500);
        } else {
          setError(response.message || "Registration failed");
        }
      } else {
        // MOCK Edit API call
        setSuccessMsg("User successfully updated! (Mock)");
        setUsers(users.map(u => u.id === editingUserId ? { id: username, name: fullName, phone: phoneNumber, role } : u));
        setTimeout(closeAndResetModal, 1500);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "An error occurred. Check your Admin access.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete user ${id}?`)) {
      // Mock delete
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-irms-green text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <IrmsLogo className="text-white w-8 h-8" />
          <h1 className="text-xl font-bold tracking-wide">Admin Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">Welcome, Administrator</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-irms-text-primary">User Management</h2>
              <p className="text-sm text-irms-text-secondary mt-1">Manage staff access and roles across the system.</p>
            </div>
            <button 
              onClick={openAddModal}
              className="bg-irms-green hover:bg-irms-green-light transition-colors text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Add New Staff
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-irms-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-irms-border text-xs uppercase tracking-wider text-irms-text-secondary">
                  <th className="p-4 font-semibold">Staff Member</th>
                  <th className="p-4 font-semibold">Username (ID)</th>
                  <th className="p-4 font-semibold">Phone Number</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-irms-border">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-irms-text-primary">{user.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-irms-text-secondary">{user.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-irms-text-secondary">{user.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'KITCHEN' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="text-irms-green hover:text-irms-green-dark transition-colors mr-3 text-sm font-semibold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700 transition-colors text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-irms-text-secondary">
                      No staff members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-irms-border flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-irms-text-primary">
                {modalMode === "ADD" ? "Register New Staff" : "Edit Staff Member"}
              </h3>
              <button onClick={closeAndResetModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="register-form" onSubmit={handleRegister} className="flex flex-col gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#f9fafb] border border-irms-border rounded-lg px-3 py-2.5 text-sm text-irms-text-primary focus:border-irms-green focus:outline-none transition-colors"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">Username (Staff ID)</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === "EDIT"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="staff_001"
                    className={`w-full bg-[#f9fafb] border border-irms-border rounded-lg px-3 py-2.5 text-sm text-irms-text-primary focus:border-irms-green focus:outline-none transition-colors ${modalMode === "EDIT" ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="w-full bg-[#f9fafb] border border-irms-border rounded-lg px-3 py-2.5 text-sm text-irms-text-primary focus:border-irms-green focus:outline-none transition-colors"
                    />
                  </div>
                  
                  {/* Role */}
                  <div>
                    <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">Role</label>
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#f9fafb] border border-irms-border rounded-lg px-3 py-2.5 text-sm text-irms-text-primary focus:border-irms-green focus:outline-none transition-colors"
                    >
                      <option value="SERVER">Server</option>
                      <option value="KITCHEN">Kitchen</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Password Fields - Only required for ADD, optional for EDIT (mock logic) */}
                {(modalMode === "ADD" || modalMode === "EDIT") && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">
                        {modalMode === "EDIT" ? "New Password" : "Password"}
                      </label>
                      <input
                        type="password"
                        required={modalMode === "ADD"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f9fafb] border border-irms-border rounded-lg px-3 py-2.5 text-sm text-irms-text-primary focus:border-irms-green focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-irms-text-primary tracking-widest uppercase mb-1.5 block">Confirm Password</label>
                      <input
                        type="password"
                        required={modalMode === "ADD" && password.length > 0}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f9fafb] border border-irms-border rounded-lg px-3 py-2.5 text-sm text-irms-text-primary focus:border-irms-green focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {error && <div className="text-red-500 text-sm font-semibold mt-2">{error}</div>}
                {successMsg && <div className="text-green-600 text-sm font-semibold mt-2">{successMsg}</div>}
              </form>
            </div>
            
            <div className="p-6 border-t border-irms-border bg-gray-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={closeAndResetModal}
                className="px-5 py-2.5 text-sm font-semibold text-irms-text-secondary hover:text-irms-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                form="register-form"
                type="submit"
                disabled={isLoading}
                className={`bg-irms-green hover:bg-irms-green-light text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Saving..." : modalMode === "ADD" ? "Register Staff" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
