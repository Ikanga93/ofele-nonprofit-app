import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // First check if post exists and is not deleted
    const post = await prisma.familyBoard.findUnique({
      where: {
        id: id,
        isDeleted: false
      },
      include: {
        user: {
          select: {
            fullName: true,
            role: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.familyBoard.update({
      where: { id: id },
      data: {
        views: {
          increment: 1
        }
      }
    })

    // Return post with updated view count
    const updatedPost = {
      ...post,
      views: post.views + 1
    }

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    // Only Family department admins can permanently delete posts
    if (currentUser.department !== 'FAMILY' || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if post exists
    const existingPost = await prisma.familyBoard.findUnique({
      where: { id: id }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Permanently delete the post
    await prisma.familyBoard.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Post permanently deleted' })
  } catch (error) {
    console.error('Error permanently deleting blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 