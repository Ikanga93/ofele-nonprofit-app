import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { DayType } from '@prisma/client'

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

    const { userId, date, dayType, startTime, endTime } = await request.json()

    // Validate required fields
    if (!userId || !date || !dayType || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check for existing schedule on the same date and dayType
    const existingSchedule = await prisma.moderatorSchedule.findFirst({
      where: {
        date: new Date(date),
        dayType: dayType as DayType
      }
    })

    if (existingSchedule) {
      return NextResponse.json(
        { error: 'A schedule already exists for this date and day type' },
        { status: 400 }
      )
    }

    // Create the new schedule
    const newSchedule = await prisma.moderatorSchedule.create({
      data: {
        userId,
        date: new Date(date),
        dayType: dayType as DayType,
        startTime,
        endTime
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Schedule created successfully',
      schedule: newSchedule
    })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 