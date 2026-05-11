"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IrmsLogo } from "@/components/shared/IrmsLogo";
import { AuthService } from "@/services/auth.service";

type Role = "kitchen" | "server";

const navItemsByRole: Record<
  Role,
  { href: string; label: string; icon: React.ReactNode; exactMatch?: boolean }[]
> = {
  kitchen: [
    {
      href: "/kitchen/chef",
      label: "CHEF VIEW",
      exactMatch: true,
      icon: (
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
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      href: "/kitchen/expeditor",
      label: "EXPEDITOR VIEW",
      exactMatch: true,
      icon: (
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
  ],
  server: [
    {
      href: "/server/tables",
      label: "TABLE & ORDER",
      icon: (
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
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      href: "/server/transactions",
      label: "TRANSACTION",
      icon: (
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
  ],
};

interface AppSidebarProps {
  role: Role;
  user?: {
    initials: string;
    name: string;
    title: string;
  };
}

export function Sidebar({
  role,
  user = { initials: "JV", name: "Julian Vane", title: "SENIOR HOST" },
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = navItemsByRole[role];

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  return (
    <aside className="w-[220px] shrink-0 bg-irms-green flex flex-col h-full">
      <div className="px-5 py-5">
        <IrmsLogo className="text-white" />
      </div>

      <nav className="flex-1 px-3 mt-2">
        {navItems.map((item) => {
          const isActive = item.exactMatch
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-xs font-semibold tracking-wider transition-all duration-150 ${
                isActive
                  ? "bg-white/10 text-white border-l-4 border-irms-orange pl-2.5"
                  : "text-[#a7c4b5] hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-irms-green-light border-2 border-[#a7c4b5] flex items-center justify-center text-white text-sm font-bold">
            {user.initials}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{user.name}</p>
            <p className="text-[#a7c4b5] text-xs">{user.title}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 py-1.5 mt-2 text-xs text-[#a7c4b5] hover:text-white tracking-wider font-medium transition-colors w-full cursor-pointer"
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          LOG OUT
        </button>
      </div>
    </aside>
  );
}
