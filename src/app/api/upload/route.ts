import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('image') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload JPG, PNG, WebP, or GIF images only.' 
      }, { status: 400 })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Please upload images smaller than 5MB.' 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // In production, use base64 data URLs for serverless compatibility
    if (process.env.NODE_ENV === 'production') {
      // For large images, warn about performance impact
      if (file.size > 1024 * 1024) { // If larger than 1MB
        console.warn(`Large image uploaded (${Math.round(file.size / 1024)}KB). Consider using cloud storage for better performance.`)
      }
      
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      return NextResponse.json({ 
        success: true, 
        imageUrl: dataUrl,
        url: dataUrl, // Also include 'url' for backward compatibility
        message: 'Image uploaded successfully',
        size: file.size // Include size info for debugging
      })
    }

    // Development environment - use local file system
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    
    try {
      await writeFile(join(uploadsDir, filename), buffer)
    } catch (error) {
      // If uploads directory doesn't exist, create it
      await mkdir(uploadsDir, { recursive: true })
      await writeFile(join(uploadsDir, filename), buffer)
    }

    // Return the public URL
    const imageUrl = `/uploads/${filename}`
    
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      url: imageUrl, // Also include 'url' for backward compatibility
      message: 'Image uploaded successfully' 
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ 
      error: 'Failed to upload image' 
    }, { status: 500 })
  }
} 