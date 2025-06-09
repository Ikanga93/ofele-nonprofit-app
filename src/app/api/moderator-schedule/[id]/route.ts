import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { DayType } from '@prisma/client'

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

    // Check if schedule exists
    const existingSchedule = await prisma.moderatorSchedule.findUnique({
      where: { id: params.id }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Check for conflicts (same date and dayType with different schedule)
    const conflictingSchedule = await prisma.moderatorSchedule.findFirst({
      where: {
        date: new Date(date),
        dayType: dayType as DayType,
        id: { not: params.id }
      }
    })

    if (conflictingSchedule) {
      return NextResponse.json(
        { error: 'A schedule already exists for this date and day type' },
        { status: 400 }
      )
    }

    // Update the schedule
    const updatedSchedule = await prisma.moderatorSchedule.update({
      where: { id: params.id },
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
      message: 'Schedule updated successfully',
      schedule: updatedSchedule
    })
  } catch (error) {
    console.error('Error updating schedule:', error)
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

    // Check if schedule exists
    const existingSchedule = await prisma.moderatorSchedule.findUnique({
      where: { id: params.id }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Delete the schedule
    await prisma.moderatorSchedule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Schedule deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 