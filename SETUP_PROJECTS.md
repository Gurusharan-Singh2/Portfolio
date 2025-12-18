# Project Management Feature - Setup Guide

## Quick Start

### 1. Add AWS S3 Credentials

Add the following to your `.env.local` file:

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region
AWS_S3_BUCKET_NAME=your_bucket_name
```

### 2. S3 Bucket Configuration

Make sure your S3 bucket has:
- Public read access for uploaded files (or adjust ACL in `src/lib/s3.js`)
- CORS configuration if uploading from browser

Example CORS configuration:
```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. Start the Application

```bash
npm run dev
```

## Usage

### Admin Access

1. Log in as admin at `/login`
2. Navigate to `/admin/projects`
3. Click "Add Project" to create a new project
4. Fill in the form and upload an image
5. Project will be saved to MongoDB and image to S3

### Public View

Visit `/portfolio` to see all published projects

## API Endpoints

- `GET /api/projects` - Get all projects (public)
- `POST /api/projects` - Create project (admin only)
- `GET /api/projects/[id]` - Get single project (public)
- `PUT /api/projects/[id]` - Update project (admin only)
- `DELETE /api/projects/[id]` - Delete project (admin only)

## File Structure

```
src/
├── models/
│   └── Project.js              # MongoDB schema
├── lib/
│   ├── s3.js                   # S3 upload/delete utilities
│   └── auth.js                 # Admin authentication
├── app/
│   ├── api/
│   │   └── projects/
│   │       ├── route.js        # GET, POST endpoints
│   │       └── [id]/route.js   # GET, PUT, DELETE endpoints
│   ├── admin/
│   │   └── projects/
│   │       ├── page.jsx        # Projects list
│   │       ├── add/page.jsx    # Create project form
│   │       └── edit/[id]/page.jsx  # Edit project form
│   └── portfolio/
│       └── page.jsx            # Public portfolio display
└── components/
    └── PortfolioPage.jsx       # Portfolio component
```
