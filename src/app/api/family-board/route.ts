import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { PerformanceMonitor } from '@/lib/performance'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Public endpoint - anyone can view blog posts (only non-deleted)
    // Optimize query by limiting results and selecting only needed fields
    const posts = await PerformanceMonitor.measure('family-board-query', async () => {
      return await prisma.familyBoard.findMany({
        where: {
          isDeleted: false
        },
        select: {
          id: true,
          title: true,
          content: true,
          imageUrl: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { 
              fullName: true, 
              role: true 
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })
    })

    // Get total count for pagination (only if needed)
    const totalCount = page === 1 ? await PerformanceMonitor.measure('family-board-count', async () => {
      return await prisma.familyBoard.count({
        where: { isDeleted: false }
      })
    }) : null

    return NextResponse.json({ 
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: posts.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching family board posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get user's department
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { department: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only Family department users can post
    if (currentUser.department !== 'FAMILY') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { title, content, imageUrl } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const post = await prisma.familyBoard.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        userId: decoded.userId
      },
      include: {
        user: {
          select: { fullName: true, role: true }
        }
      }
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating family board post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    // Get user's department and role
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { department: true, role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only Family department admins can delete/restore posts
    if (currentUser.department !== 'FAMILY' || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { postId, action } = await request.json()

    if (!postId || !action) {
      return NextResponse.json(
        { error: 'Post ID and action are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}
    
    if (action === 'delete') {
      updateData = {
        isDeleted: true,
        deletedAt: new Date()
      }
    } else if (action === 'restore') {
      updateData = {
        isDeleted: false,
        deletedAt: null
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "delete" or "restore"' },
        { status: 400 }
      )
    }

    const post = await prisma.familyBoard.update({
      where: { id: postId },
      data: updateData,
      include: {
        user: {
          select: { fullName: true, role: true }
        }
      }
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error updating family board post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 