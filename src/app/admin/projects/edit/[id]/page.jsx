"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";

export default function EditProjectPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    imageUrl: "",
  });

  // Fetch project on mount
  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          title: data.project.title,
          description: data.project.description,
          link: data.project.link,
          imageUrl: data.project.imageUrl,
        });
        setImagePreview(data.project.imageUrl);
      } else {
        setError("Failed to load project");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading project");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);
    setNewImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearNewImage = () => {
    setNewImageFile(null);
    setImagePreview(formData.imageUrl); // Revert to original image
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.title || !formData.description || !formData.link) {
      setError("Title, description, and link are required");
      return;
    }

    try {
      setSaving(true);

      // Create FormData
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("link", formData.link);
      
      // Only append new image if one was selected
      if (newImageFile) {
        data.append("image", newImageFile);
      }

      const response = await fetch(`/api/projects/${params.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to projects list
        router.push("/admin/projects");
      } else {
        setError(result.error || "Failed to update project");
      }
    } catch (err) {
      console.error(err);
      setError("Error updating project");
    } finally {
      setSaving(false);
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
    <div className="text-foreground max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/admin/projects"
          className="p-2 rounded-lg border border-border bg-background hover:bg-accent transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Project</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Project Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="My Awesome Project"
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="A brief description of your project..."
            rows={5}
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            required
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-sm font-medium mb-2">Project Link *</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://example.com"
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Project Image {newImageFile && <span className="text-violet-400">(New image selected)</span>}
          </label>
          
          <div className="space-y-3">
            {/* Current/Preview Image */}
            {imagePreview && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {newImageFile && (
                  <button
                    type="button"
                    onClick={clearNewImage}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 hover:bg-red-600 transition text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Upload New Image Button */}
            <label className="flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-lg bg-muted hover:bg-accent cursor-pointer transition">
              <Upload className="w-5 h-5" />
              <span>{newImageFile ? "Change Image" : "Upload New Image"}</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <Link
            href="/admin/projects"
            className="px-6 py-3 rounded-lg border border-border bg-background hover:bg-accent transition flex items-center justify-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
