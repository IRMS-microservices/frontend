import { Topbar } from "@/components/shared/Topbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions — IRMS",
};

export default function TransactionsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Transactions" hideSearch />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-irms-text-secondary text-sm">
          Transaction history coming soon.
        </p>
      </div>
    </div>
  );
}
