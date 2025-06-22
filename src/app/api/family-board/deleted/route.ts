import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Only Family department admins can view deleted posts
    if (currentUser.department !== 'FAMILY' || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch deleted posts
    const deletedPosts = await prisma.familyBoard.findMany({
      where: {
        isDeleted: true
      },
      include: {
        user: {
          select: { fullName: true, role: true }
        }
      },
      orderBy: { deletedAt: 'desc' }
    })

    return NextResponse.json({ posts: deletedPosts })
  } catch (error) {
    console.error('Error fetching deleted family board posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 