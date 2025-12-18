# S3 Bucket Configuration Guide

## Issue Fixed
Removed the `ACL: 'public-read'` parameter from S3 uploads because your bucket doesn't allow ACLs (this is the default for newer S3 buckets).

## Required: Configure Your S3 Bucket for Public Access

You need to configure your S3 bucket to make uploaded images publicly accessible. Here's how:

### Option 1: Using Bucket Policy (Recommended)

1. **Go to AWS S3 Console**
   - Navigate to https://console.aws.amazon.com/s3/
   - Click on your bucket

2. **Go to Permissions Tab**
   - Click on the "Permissions" tab

3. **Edit Block Public Access**
   - Under "Block public access (bucket settings)", click "Edit"
   - **Uncheck** "Block all public access"
   - Click "Save changes"
   - Type "confirm" when prompted

4. **Add Bucket Policy**
   - Scroll down to "Bucket policy" section
   - Click "Edit"
   - Paste this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

5. **Click "Save changes"**

### Option 2: Using CloudFront (Production Recommended)

For production, consider using CloudFront CDN:
1. Create a CloudFront distribution
2. Set your S3 bucket as the origin
3. Update the `uploadToS3` function to return CloudFront URL instead

### Verify It Works

After configuration:
1. Try uploading a project with an image
2. Check if the image URL is accessible in your browser
3. The URL format should be: `https://YOUR-BUCKET-NAME.s3.YOUR-REGION.amazonaws.com/projects/...`

## Alternative: Keep Images Private

If you prefer to keep images private, you can:
1. Generate presigned URLs for temporary access
2. Use a proxy endpoint to serve images

Let me know if you need help implementing either alternative!
