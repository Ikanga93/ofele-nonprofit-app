import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's department and role
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { department: true, role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only Family department admins can edit posts
    if (currentUser.department !== 'FAMILY' || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { title, content, imageUrl } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if post exists and is not deleted
    const existingPost = await prisma.familyBoard.findUnique({
      where: {
        id: id,
        isDeleted: false
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Update the post
    const updatedPost = await prisma.familyBoard.update({
      where: { id: id },
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { fullName: true, role: true }
        }
      }
    })

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Error updating family board post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 