"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/projects/add", label: "Add Project" },
    { href: "/admin/projects", label: "Manage Projects" },
    { href: "/admin/chat", label: "Chat" },
  ];

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 ">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 dark:bg-black/20 rounded-lg">
        {/* Sidebar */}
        <aside className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white p-4 md:sticky md:top-6 h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <h2 className="font-bold text-lg mb-4">Admin Panel</h2>
          <nav className="flex md:flex-col gap-2">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-2 rounded-lg text-sm transition-all border border-white/10 ${
                    active
                      ? "bg-white/20 font-semibold"
                      : "hover:bg-white/10"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 sm:p-6 overflow-auto h-[calc(100vh-1rem)] scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hide-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
