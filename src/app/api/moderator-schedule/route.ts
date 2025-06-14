import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { getNextMonday, getNextSaturday } from '@/lib/utils'
import { DayType } from '@prisma/client'

export async function GET() {
  try {
    const schedules = await prisma.moderatorSchedule.findMany({
      where: {
        date: {
          gte: new Date()
        }
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('Error fetching moderator schedules:', error)
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

    const { weeksToGenerate = 4 } = await request.json()

    // Get all users for rotation
    const users = await prisma.user.findMany({
      select: { id: true, fullName: true }
    })

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No users available for scheduling' },
        { status: 400 }
      )
    }

    const schedules = []
    let userIndex = 0

    // Generate schedules for the specified number of weeks
    for (let week = 0; week < weeksToGenerate; week++) {
      const mondayDate = getNextMonday()
      mondayDate.setDate(mondayDate.getDate() + (week * 7))

      const saturdayDate = getNextSaturday()
      saturdayDate.setDate(saturdayDate.getDate() + (week * 7))

      // Check if schedules already exist for these dates
      const existingMonday = await prisma.moderatorSchedule.findFirst({
        where: {
          date: mondayDate,
          dayType: 'MONDAY'
        }
      })

      const existingSaturday = await prisma.moderatorSchedule.findFirst({
        where: {
          date: saturdayDate,
          dayType: 'SATURDAY'
        }
      })

      // Add Monday schedule if it doesn't exist
      if (!existingMonday) {
        schedules.push({
          userId: users[userIndex % users.length].id,
          date: mondayDate,
          dayType: DayType.MONDAY,
          startTime: '18:00',
          endTime: '19:00',
          isAutoGenerated: true
        })
        userIndex++
      }

      // Add Saturday schedule if it doesn't exist
      if (!existingSaturday) {
        schedules.push({
          userId: users[userIndex % users.length].id,
          date: saturdayDate,
          dayType: DayType.SATURDAY,
          startTime: '16:30',
          endTime: '18:00',
          isAutoGenerated: true
        })
        userIndex++
      }
    }

    if (schedules.length === 0) {
      return NextResponse.json(
        { message: 'All schedules already exist for the specified period' }
      )
    }

    // Create schedules in database
    const createdSchedules = await prisma.moderatorSchedule.createMany({
      data: schedules
    })

    return NextResponse.json({
      message: `Created ${createdSchedules.count} moderator schedules`,
      count: createdSchedules.count
    })
  } catch (error) {
    console.error('Error creating moderator schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 