import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Project from '@/models/Project';
import { verifyAdmin } from '@/lib/auth';
import { uploadToS3, isValidImageType } from '@/lib/s3';

/**
 * GET /api/projects
 * Get all projects (public endpoint)
 */
export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find().sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project (admin only)
 * Expects multipart/form-data with: title, description, link, and image file
 */
export async function POST(request) {
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

    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const link = formData.get('link');
    const imageFile = formData.get('image');

    // Validate required fields
    if (!title || !description || !link || !imageFile) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate image file
    if (!isValidImageType(imageFile.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const imageUrl = await uploadToS3(buffer, imageFile.name, imageFile.type);

    // Create project in database
    const project = new Project({
      title,
      description,
      link,
      imageUrl,
    });

    await project.save();

    return NextResponse.json(
      { success: true, project },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
