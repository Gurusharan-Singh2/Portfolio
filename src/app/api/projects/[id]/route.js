import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Project from '@/models/Project';
import { verifyAdmin } from '@/lib/auth';
import { uploadToS3, deleteFromS3, isValidImageType } from '@/lib/s3';

/**
 * GET /api/projects/[id]
 * Get a single project by ID (public endpoint)
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const project = await Project.findById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project (admin only)
 * Can update any field, optionally upload a new image
 */
export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find existing project
    const existingProject = await Project.findById(params.id);
    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const link = formData.get('link');
    const imageFile = formData.get('image');

    // Prepare update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (link) updateData.link = link;

    // Handle image update if a new image is provided
    if (imageFile && imageFile.size > 0) {
      // Validate image
      if (!isValidImageType(imageFile.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF' },
          { status: 400 }
        );
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { success: false, error: 'Image size must be less than 5MB' },
          { status: 400 }
        );
      }

      // Upload new image to S3
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const newImageUrl = await uploadToS3(buffer, imageFile.name, imageFile.type);

      // Delete old image from S3
      await deleteFromS3(existingProject.imageUrl);

      updateData.imageUrl = newImageUrl;
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    );

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project and its S3 image (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find and delete project
    const project = await Project.findByIdAndDelete(params.id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete image from S3
    await deleteFromS3(project.imageUrl);

    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
