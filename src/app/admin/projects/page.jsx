"use client";
import Link from "next/link";

export default function ManageProjectsPage() {
  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Manage Projects</h1>
        <Link href="/admin/projects/add" className="text-sm px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition">Add Project</Link>
      </div>
      <div className="p-4 rounded-xl border border-white/20 bg-white/10">Project list coming soon…</div>
    </div>
  );
}


