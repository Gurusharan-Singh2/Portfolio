"use client";

export default function AddProjectPage() {
  return (
    <div className="text-white">
      <h1 className="text-xl font-semibold mb-4">Add Project</h1>
      <form className="space-y-4">
        <input className="w-full p-3 rounded-lg border border-white/20 bg-white/10 placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Title" />
        <textarea className="w-full p-3 rounded-lg border border-white/20 bg-white/10 placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Description" rows={4} />
        <div className="flex gap-2">
          <input className="flex-1 p-3 rounded-lg border border-white/20 bg-white/10 placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Image URL" />
          <input className="flex-1 p-3 rounded-lg border border-white/20 bg-white/10 placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Link" />
        </div>
        <button type="button" className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">Save</button>
      </form>
    </div>
  );
}


