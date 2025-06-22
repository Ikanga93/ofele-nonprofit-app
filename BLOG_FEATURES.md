# Blog Features Documentation

## New Social Media-Style Blog Features

### File Upload Support
- Blog posts now support direct file uploads (JPG, PNG, WebP, GIF)
- Images are uploaded to the server and stored securely
- Real-time image preview during post creation
- File validation (type and size limits)
- Maximum file size: 5MB per image

### Image Management
- Images are automatically resized and optimized for web display
- Unique filenames prevent conflicts
- Images are stored in `/public/uploads/` directory
- Preview functionality before posting
- Easy image removal during editing

### Content Truncation & "Read More"
- Long post content is automatically truncated in the preview (150 characters)
- Posts longer than 150 characters show a "Read more →" link
- Clicking anywhere on the post preview takes you to the full post

### Individual Post Pages
- Each blog post has its own dedicated page at `/blog/[post-id]`
- Full post pages show:
  - Complete post title and content
  - Full-size uploaded image (if provided)
  - Author information with role badge
  - Publication date
  - Back navigation to homepage

### Post Creation Experience
Family Department users can now:
- Upload images directly from their device
- See real-time preview of their post with image
- Remove/replace images before publishing
- Create rich, social media-style posts with visual content

### Navigation
- All blog posts are clickable and link to their individual pages
- Consistent navigation between public homepage, family dashboard, and individual posts
- Mobile-responsive design for all views

### API Updates
- `POST /api/upload` - New endpoint for image file uploads
- `POST /api/family-board` now accepts `imageUrl` field from uploaded images
- `GET /api/family-board/[id]` endpoint for individual posts
- All existing posts continue to work (images are optional)

## Usage Examples

### Creating a Post with Uploaded Image
1. Click "New Blog Post" button
2. Enter post title and content
3. Click "Choose File" to select an image from your device
4. Preview the image in the form
5. Click "Publish Post" to upload image and create post

### File Upload Process
1. **File Selection**: User selects image file from device
2. **Client Validation**: File type and size checked instantly
3. **Preview Generation**: Image preview shown immediately
4. **Upload on Submit**: Image uploaded to server when form is submitted
5. **Post Creation**: Blog post created with uploaded image URL

## Technical Details

### File Upload Security
- File type validation (only image formats allowed)
- File size limits (5MB maximum)
- Unique filename generation to prevent conflicts
- Server-side validation and sanitization

### Storage
- Images stored in `/public/uploads/` directory
- Accessible via `/uploads/[filename]` URLs
- Automatic directory creation if needed
- Git-ignored to prevent repository bloat

### User Experience
- Real-time file validation and feedback
- Image preview before upload
- Progress indicators during upload
- Error handling for failed uploads
- Mobile-friendly file selection interface

### Performance
- Client-side image preview (no server requests)
- Efficient file upload handling
- Responsive image display
- Optimized for mobile and desktop use 