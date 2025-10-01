"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/projects/add", label: "Add Project" },
    { href: "/admin/projects", label: "Manage Projects" },
    { href: "/admin/chat", label: "Chat" },
  ];

  return (
    <div className="min-h-screen w-screen p-4 sm:p-6 overflow-hidden hide-scrollbar">
      <div className="w-full h-full flex flex-col md:grid md:grid-cols-[220px_1fr] gap-4 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl">

        {/* Mobile toggle button */}
        <div className="md:hidden flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg text-white">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white font-bold px-3 py-1 bg-white/20 rounded-md"
          >
            {sidebarOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`
            bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white p-4
            overflow-y-auto hide-scrollbar
            transition-all duration-300
            md:sticky md:top-0 md:h-screen md:block
            ${sidebarOpen ? "block max-h-96 mb-4" : "hidden md:block"}
          `}
        >
          <h2 className="font-bold text-lg mb-4 hidden md:block">Admin Panel</h2>
          <nav className="flex flex-col gap-2">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-2 rounded-lg text-sm transition-all border border-white/10 ${
                    active ? "bg-white/20 font-semibold" : "hover:bg-white/10"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 sm:p-6 overflow-auto hide-scrollbar md:h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
