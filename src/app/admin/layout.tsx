"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session || session.user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-dark">
        <p className="text-slate-300">
          Access denied. Admin privileges required.
        </p>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/dictionaries", label: "Dictionaries" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/teams", label: "Teams" },
  ];

  return (
    <div className="flex min-h-screen bg-surface-dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface">
        <div className="p-6">
          <h1 className="mb-6 text-2xl font-bold text-white">Admin Panel</h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-2 transition ${
                  pathname === item.href
                    ? "bg-primary text-white font-semibold"
                    : "text-slate-300 hover:bg-surface-dark/50 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
