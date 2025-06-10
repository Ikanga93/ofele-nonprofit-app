import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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

    const { member1Id, member2Id, weekStart, weekEnd } = await request.json()

    if (!member1Id || !member2Id || !weekStart || !weekEnd) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (member1Id === member2Id) {
      return NextResponse.json(
        { error: 'Team members must be different people' },
        { status: 400 }
      )
    }

    // Check if users exist
    const users = await prisma.user.findMany({
      where: {
        id: { in: [member1Id, member2Id] }
      }
    })

    if (users.length !== 2) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 400 }
      )
    }

    // Check for overlapping teams for the same week
    const existingTeam = await prisma.prayerTeam.findFirst({
      where: {
        OR: [
          { member1Id: member1Id },
          { member2Id: member1Id },
          { member1Id: member2Id },
          { member2Id: member2Id }
        ],
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd)
      }
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: 'One or both members already have a team for this week' },
        { status: 400 }
      )
    }

    const newTeam = await prisma.prayerTeam.create({
      data: {
        member1Id,
        member2Id,
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd)
      },
      include: {
        member1: {
          select: { id: true, fullName: true, email: true }
        },
        member2: {
          select: { id: true, fullName: true, email: true }
        }
      }
    })

    return NextResponse.json({ team: newTeam }, { status: 201 })
  } catch (error) {
    console.error('Error creating prayer team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 