"use client";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-violet-200 mt-1">Overview and quick actions</p>
        </div>
        <Link
          href="/admin/chat"
          className="text-sm px-3 py-2 rounded-lg border border-white/20 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition"
        >
          Open Chat
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-violet-200">Projects</div>
          <div className="text-2xl font-semibold mt-1">—</div>
        </div>
        <div className="p-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-violet-200">Users</div>
          <div className="text-2xl font-semibold mt-1">—</div>
        </div>
        <div className="p-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-violet-200">Messages</div>
          <div className="text-2xl font-semibold mt-1">—</div>
        </div>
        <div className="p-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-violet-200">Pending</div>
          <div className="text-2xl font-semibold mt-1">—</div>
        </div>
      </div>

      {/* Two-column content */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-3">
          <div className="p-4 rounded-xl border border-white/20 bg-white/10">
            <h2 className="font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/admin/projects/add" className="px-3 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 transition">Add Project</Link>
              <Link href="/admin/projects" className="px-3 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 transition">Manage Projects</Link>
              <Link href="/admin/chat" className="px-3 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 transition">Respond to Messages</Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-white/20 bg-white/10">
          <h2 className="font-semibold mb-3">Recent Activity</h2>
          <ul className="space-y-2 text-sm text-violet-100/90">
            <li className="px-3 py-2 rounded-lg border border-white/10 bg-white/5">No recent items yet. Activity will appear here.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
