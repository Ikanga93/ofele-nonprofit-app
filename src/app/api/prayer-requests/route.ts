import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Require authentication to view prayer requests
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required to view prayer requests' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const requests = await prisma.prayerRequest.findMany({
      include: {
        user: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching prayer requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, isAnonymous } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    let userId = null

    // If not anonymous, try to get user from token
    if (!isAnonymous) {
      const token = request.cookies.get('auth-token')?.value
      if (token) {
        const decoded = verifyToken(token)
        if (decoded) {
          userId = decoded.userId
        }
      }
    }

    const prayerRequest = await prisma.prayerRequest.create({
      data: {
        title,
        content,
        isAnonymous: isAnonymous || false,
        userId: userId
      }
    })

    return NextResponse.json({ request: prayerRequest }, { status: 201 })
  } catch (error) {
    console.error('Error creating prayer request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 