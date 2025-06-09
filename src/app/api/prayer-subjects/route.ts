import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const prayerSubjects = await prisma.prayerSubject.findMany({
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
        description: description || null
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