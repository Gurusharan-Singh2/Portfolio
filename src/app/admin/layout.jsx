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
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-4 sm:p-6">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <aside className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white p-4 md:sticky md:top-6 h-max">
          <h2 className="font-bold text-lg mb-3">Admin</h2>
          <nav className="flex md:flex-col gap-2">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-2 rounded-lg text-sm transition border border-white/10 ${
                    active ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 sm:p-6 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}


