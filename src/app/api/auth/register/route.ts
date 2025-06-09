import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, birthday, password, role } = await request.json()

    // Validate required fields
    if (!fullName || !email || !birthday || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check admin limit (max 3 admins)
    if (role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })

      if (adminCount >= 3) {
        return NextResponse.json(
          { error: 'Maximum number of admins (3) already reached' },
          { status: 400 }
        )
      }
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    
    // Parse birthday properly to avoid timezone issues
    const [year, month, day] = birthday.split('-').map(Number)
    const birthdayDate = new Date(year, month - 1, day) // month is 0-indexed
    
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        birthday: birthdayDate,
        password: hashedPassword,
        role: role || 'MEMBER'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        birthday: true,
        createdAt: true
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 