import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get all users with birthdays (public endpoint for birthday page)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        birthday: true
      },
      orderBy: {
        fullName: 'asc'
      }
    })

    // Filter out users with null birthdays
    const usersWithBirthdays = users.filter(user => user.birthday !== null)

    return NextResponse.json({ users: usersWithBirthdays })
  } catch (error) {
    console.error('Error fetching birthdays:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 