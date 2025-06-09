import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { getWeekRange, shuffleArray } from '@/lib/utils'

export async function GET() {
  try {
    const currentWeek = getWeekRange(new Date())
    
    const currentTeams = await prisma.prayerTeam.findMany({
      where: {
        weekStart: {
          gte: currentWeek.start,
          lte: currentWeek.end
        }
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

    return NextResponse.json({ teams: currentTeams })
  } catch (error) {
    console.error('Error fetching prayer teams:', error)
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

    // Generate prayer teams for the current week
    const currentWeek = getWeekRange(new Date())
    
    // Check if teams already exist for this week
    const existingTeams = await prisma.prayerTeam.findMany({
      where: {
        weekStart: {
          gte: currentWeek.start,
          lte: currentWeek.end
        }
      }
    })

    if (existingTeams.length > 0) {
      return NextResponse.json(
        { error: 'Prayer teams already exist for this week' },
        { status: 400 }
      )
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, fullName: true }
    })

    if (users.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 users to create prayer teams' },
        { status: 400 }
      )
    }

    // Shuffle users and pair them
    const shuffledUsers = shuffleArray(users)
    const teams = []

    for (let i = 0; i < shuffledUsers.length - 1; i += 2) {
      teams.push({
        member1Id: shuffledUsers[i].id,
        member2Id: shuffledUsers[i + 1].id,
        weekStart: currentWeek.start,
        weekEnd: currentWeek.end
      })
    }

    // If odd number of users, create a team with the last user and first user
    if (shuffledUsers.length % 2 !== 0) {
      teams.push({
        member1Id: shuffledUsers[shuffledUsers.length - 1].id,
        member2Id: shuffledUsers[0].id,
        weekStart: currentWeek.start,
        weekEnd: currentWeek.end
      })
    }

    // Create teams in database
    const createdTeams = await prisma.prayerTeam.createMany({
      data: teams
    })

    return NextResponse.json({ 
      message: `Created ${createdTeams.count} prayer teams`,
      count: createdTeams.count
    })
  } catch (error) {
    console.error('Error creating prayer teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 