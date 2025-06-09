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

    // Find all schedules grouped by date and dayType
    const allSchedules = await prisma.moderatorSchedule.findMany({
      orderBy: [
        { date: 'asc' },
        { dayType: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    // Group schedules by date and dayType to find duplicates
    const scheduleGroups = new Map<string, typeof allSchedules>()
    
    allSchedules.forEach(schedule => {
      const key = `${schedule.date.toISOString().split('T')[0]}-${schedule.dayType}`
      if (!scheduleGroups.has(key)) {
        scheduleGroups.set(key, [])
      }
      scheduleGroups.get(key)!.push(schedule)
    })

    // Find duplicates and keep only the first one
    const duplicatesToDelete: string[] = []
    
    scheduleGroups.forEach((schedules) => {
      if (schedules.length > 1) {
        // Keep the first one (oldest), delete the rest
        const [, ...duplicates] = schedules
        duplicatesToDelete.push(...duplicates.map((d) => d.id))
      }
    })

    if (duplicatesToDelete.length === 0) {
      return NextResponse.json({
        message: 'No duplicate schedules found',
        deletedCount: 0
      })
    }

    // Delete duplicates
    const deleteResult = await prisma.moderatorSchedule.deleteMany({
      where: {
        id: {
          in: duplicatesToDelete
        }
      }
    })

    return NextResponse.json({
      message: `Cleaned up ${deleteResult.count} duplicate schedules`,
      deletedCount: deleteResult.count
    })
  } catch (error) {
    console.error('Error cleaning up duplicate schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 