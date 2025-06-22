import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { getWeekRange, shuffleArray } from '@/lib/utils'

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

    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    
    let whereClause: any = {
      OR: [
        {
          member1: {
            department: currentUser.department
          }
        },
        {
          member2: {
            department: currentUser.department
          }
        }
      ]
    }
    
    if (!all) {
      // Default behavior: only current week teams
      const currentWeek = getWeekRange(new Date())
      whereClause = {
        ...whereClause,
        weekStart: {
          gte: currentWeek.start,
          lte: currentWeek.end
        }
      }
    }
    
    const teams = await prisma.prayerTeam.findMany({
      where: whereClause,
      include: {
        member1: {
          select: { id: true, fullName: true, email: true, department: true }
        },
        member2: {
          select: { id: true, fullName: true, email: true, department: true }
        }
      },
      orderBy: { weekStart: 'desc' }
    })

    return NextResponse.json({ teams })
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

    // Get admin's department
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { department: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Parse request body safely
    let requestBody = {}
    try {
      const text = await request.text()
      if (text) {
        requestBody = JSON.parse(text)
      }
    } catch (parseError) {
      // If JSON parsing fails, use empty object (for requests without body)
      requestBody = {}
    }

    const { replaceExisting = false, weekStart, weekEnd } = requestBody as any

    // Determine the week to generate teams for
    let targetWeek
    if (weekStart && weekEnd) {
      targetWeek = {
        start: new Date(weekStart),
        end: new Date(weekEnd)
      }
    } else {
      // Default to current week
      targetWeek = getWeekRange(new Date())
    }
    
    // Check if teams already exist for this week (for this department)
    const existingTeams = await prisma.prayerTeam.findMany({
      where: {
        weekStart: {
          gte: targetWeek.start,
          lte: targetWeek.end
        },
        OR: [
          {
            member1: {
              department: admin.department
            }
          },
          {
            member2: {
              department: admin.department
            }
          }
        ]
      }
    })

    if (existingTeams.length > 0 && !replaceExisting) {
      return NextResponse.json(
        { error: 'Prayer teams already exist for this week in your department. Use replaceExisting: true to replace them.' },
        { status: 400 }
      )
    }

    // If replacing existing teams, delete them first
    if (existingTeams.length > 0 && replaceExisting) {
      await prisma.prayerTeam.deleteMany({
        where: {
          weekStart: {
            gte: targetWeek.start,
            lte: targetWeek.end
          },
          OR: [
            {
              member1: {
                department: admin.department
              }
            },
            {
              member2: {
                department: admin.department
              }
            }
          ]
        }
      })
    }

    // Get all users from the same department
    const users = await prisma.user.findMany({
      where: {
        department: admin.department
      },
      select: { id: true, fullName: true }
    })

    if (users.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 users in your department to create prayer teams' },
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
        weekStart: targetWeek.start,
        weekEnd: targetWeek.end
      })
    }

    // If odd number of users, create a team with the last user and first user
    if (shuffledUsers.length % 2 !== 0) {
      teams.push({
        member1Id: shuffledUsers[shuffledUsers.length - 1].id,
        member2Id: shuffledUsers[0].id,
        weekStart: targetWeek.start,
        weekEnd: targetWeek.end
      })
    }

    // Create teams in database
    const createdTeams = await prisma.prayerTeam.createMany({
      data: teams
    })

    const action = replaceExisting && existingTeams.length > 0 ? 'replaced' : 'created'
    return NextResponse.json({ 
      message: `${action === 'replaced' ? 'Replaced' : 'Created'} ${createdTeams.count} prayer teams for ${admin.department} department`,
      count: createdTeams.count,
      action,
      weekStart: targetWeek.start,
      weekEnd: targetWeek.end
    })
  } catch (error) {
    console.error('Error creating prayer teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 