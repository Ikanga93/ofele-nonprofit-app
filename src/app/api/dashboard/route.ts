import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUpcomingBirthdays, formatDate, formatTime, formatBirthdayDate } from '@/lib/utils'

export async function GET() {
  try {
    // Get current Monday moderator
    const today = new Date()
    const currentMonday = await prisma.moderatorSchedule.findFirst({
      where: {
        dayType: 'MONDAY',
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        }
      },
      include: {
        user: {
          select: { fullName: true }
        }
      },
      orderBy: { date: 'asc' }
    })

    // Get current Saturday moderator
    const currentSaturday = await prisma.moderatorSchedule.findFirst({
      where: {
        dayType: 'SATURDAY',
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        }
      },
      include: {
        user: {
          select: { fullName: true }
        }
      },
      orderBy: { date: 'asc' }
    })

    // Get all users for birthday calculation
    const users = await prisma.user.findMany({
      select: { fullName: true, birthday: true }
    })

    // Get upcoming birthdays for current month
    const upcomingBirthdays = getUpcomingBirthdays(users)

    // Get active prayer subjects
    const prayerSubjects = await prisma.prayerSubject.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    // Get news and events (sorted by event date, then creation date)
    const news = await prisma.news.findMany({
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