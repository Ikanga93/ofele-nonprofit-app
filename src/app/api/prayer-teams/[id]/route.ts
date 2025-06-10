import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const team = await prisma.prayerTeam.findUnique({
      where: { id: params.id },
      include: {
        member1: {
          select: { id: true, fullName: true, email: true }
        },
        member2: {
          select: { id: true, fullName: true, email: true }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Prayer team not found' }, { status: 404 })
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error fetching prayer team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updatedTeam = await prisma.prayerTeam.update({
      where: { id: params.id },
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

    return NextResponse.json({ team: updatedTeam })
  } catch (error) {
    console.error('Error updating prayer team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await prisma.prayerTeam.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Prayer team deleted successfully' })
  } catch (error) {
    console.error('Error deleting prayer team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 