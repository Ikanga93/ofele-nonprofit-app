import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and get user department
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

    const prayerSubjects = await prisma.prayerSubject.findMany({
      where: {
        department: currentUser.department
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ prayerSubjects })
  } catch (error) {
    console.error('Error fetching prayer subjects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get admin's department
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { department: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const { title, description } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const subject = await prisma.prayerSubject.create({
      data: {
        title,
        description: description || null,
        department: admin.department
      }
    })

    return NextResponse.json({ subject }, { status: 201 })
  } catch (error) {
    console.error('Error creating prayer subject:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 