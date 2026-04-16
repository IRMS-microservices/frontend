import { Sidebar } from "@/components/shared/Sidebar";

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full bg-irms-surface">
      <Sidebar role="server" />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
