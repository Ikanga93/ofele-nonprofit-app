import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { getUpcomingBirthdays, formatDate, formatTime, formatBirthdayDate } from '@/lib/utils'

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

    // Get current Monday moderator from the same department
    const today = new Date()
    const currentMonday = await prisma.moderatorSchedule.findFirst({
      where: {
        dayType: 'MONDAY',
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        },
        user: {
          department: currentUser.department
        }
      },
      include: {
        user: {
          select: { fullName: true }
        }
      },
      orderBy: { date: 'asc' }
    })

    // Get current Saturday moderator from the same department
    const currentSaturday = await prisma.moderatorSchedule.findFirst({
      where: {
        dayType: 'SATURDAY',
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        },
        user: {
          department: currentUser.department
        }
      },
      include: {
        user: {
          select: { fullName: true }
        }
      },
      orderBy: { date: 'asc' }
    })

    // Get users from the same department for birthday calculation
    const users = await prisma.user.findMany({
      where: {
        department: currentUser.department
      },
      select: { fullName: true, birthday: true }
    })

    // Get upcoming birthdays for current month
    const upcomingBirthdays = getUpcomingBirthdays(users)

    // Get active prayer subjects from the same department
    const prayerSubjects = await prisma.prayerSubject.findMany({
      where: { 
        isActive: true,
        department: currentUser.department
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get news and events from the same department (sorted by event date, then creation date)
    const news = await prisma.news.findMany({
      where: {
        department: currentUser.department
      },
      orderBy: [
        { eventDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      mondayModerator: currentMonday ? {
        name: currentMonday.user.fullName,
        date: formatDate(currentMonday.date),
        time: `${formatTime(currentMonday.startTime)} - ${formatTime(currentMonday.endTime)}`
      } : null,
      saturdayModerator: currentSaturday ? {
        name: currentSaturday.user.fullName,
        date: formatDate(currentSaturday.date),
        time: `${formatTime(currentSaturday.startTime)} - ${formatTime(currentSaturday.endTime)}`
      } : null,
      upcomingBirthdays: upcomingBirthdays.map(user => ({
        name: user.fullName,
        date: formatBirthdayDate(user.birthdayThisYear)
      })),
      prayerSubjects,
      news
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 