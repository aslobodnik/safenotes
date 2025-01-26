import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="w-64 border-r">
        <Sidebar />
      </div>
      <div className="flex-1">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
} 