"use client";
import { Search } from "lucide-react";

interface TopbarProps {
  title: string;
  hideSearch?: boolean;
}

export function Topbar({ title, hideSearch = false }: TopbarProps) {
  return (
    <header className="flex items-center justify-between shrink-0 px-8 py-4 bg-white border-b border-irms-border">
      <h1 className="text-sm font-bold text-irms-text-primary tracking-widest uppercase">
        {title}
      </h1>
      {!hideSearch && (
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64 focus-within:ring-2 ring-irms-green/20 transition-all">
          <Search className="w-4 h-4 text-irms-text-muted" />
          <input
            type="text"
            placeholder="Find table or guest..."
            className="bg-transparent text-sm text-irms-text-primary placeholder-irms-text-muted outline-none flex-1"
          />
        </div>
      )}
    </header>
  );
}
