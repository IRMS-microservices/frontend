"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IrmsLogo } from "@/components/shared/IrmsLogo";
import { AuthService } from "@/services/auth.service";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-60 shrink-0 bg-[#E8ECEF] flex flex-col h-screen fixed left-0 top-0 border-r border-gray-200">
      <div className="px-6 py-6 flex items-center gap-3">
        <IrmsLogo className="text-irms-green" />
        <span className="font-bold text-lg text-irms-text-primary tracking-wide">IRMS</span>
      </div>

      <nav className="flex-1 px-4 mt-6 flex flex-col gap-2">
        <Link
          href="/admin/account"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${pathname.startsWith("/admin/account")
              ? "bg-white text-irms-text-primary shadow-sm"
              : "text-gray-500 hover:bg-white/50"
            }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Staff Management
        </Link>
        <Link
          href="/admin/inventory"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${pathname.startsWith("/admin/inventory")
              ? "bg-white text-irms-text-primary shadow-sm"
              : "text-gray-500 hover:bg-white/50"
            }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          Inventory Control
        </Link>
      </nav>

      <div className="px-4 pb-8 flex flex-col gap-2">
        <button className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:text-gray-800 font-semibold transition-colors w-full text-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:text-gray-800 font-semibold transition-colors w-full text-left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
