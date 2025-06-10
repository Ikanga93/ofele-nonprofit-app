import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { getWeekRange } from '@/lib/utils'

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

    const { weekStart, weekEnd } = requestBody as any

    // Determine the week to clear teams for
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

    // Delete all teams for the specified week
    const deletedTeams = await prisma.prayerTeam.deleteMany({
      where: {
        weekStart: {
          gte: targetWeek.start,
          lte: targetWeek.end
        }
      }
    })

    return NextResponse.json({ 
      message: `Cleared ${deletedTeams.count} prayer teams`,
      count: deletedTeams.count,
      weekStart: targetWeek.start,
      weekEnd: targetWeek.end
    })
  } catch (error) {
    console.error('Error clearing prayer teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 