"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Edit, ExternalLink, Loader2 } from "lucide-react";

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/projects");
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      } else {
        setError("Failed to load projects");
      }
    } catch (err) {
      setError("Error loading projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete the image from S3.`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setProjects(projects.filter(p => p._id !== id));
      } else {
        alert("Failed to delete project: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting project");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="text-foreground">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Projects</h1>
        <Link 
          href="/admin/projects/add" 
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition flex items-center gap-2 text-white"
        >
          <span>+</span> Add Project
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-200">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="p-8 rounded-xl border border-border bg-muted text-center">
          <p className="text-muted-foreground mb-4">No projects yet</p>
          <Link 
            href="/admin/projects/add"
            className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition text-white"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className="rounded-xl border border-border bg-card overflow-hidden hover:border-violet-400 transition group"
            >
              {/* Project Image */}
              <div className="relative h-48 bg-muted overflow-hidden">
                <img 
                  src={project.imageUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Project Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-card-foreground">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description}
                </p>

                {/* Project Link */}
                <a 
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-500 hover:text-violet-600 flex items-center gap-1 mb-4"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="truncate">{project.link}</span>
                </a>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/projects/edit/${project._id}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(project._id, project.title)}
                    disabled={deleteLoading === project._id}
                    className="flex-1 px-3 py-2 rounded-lg border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400"
                  >
                    {deleteLoading === project._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
