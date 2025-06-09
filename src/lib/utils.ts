import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { startOfWeek, endOfWeek, addWeeks, format, isSameDay, addDays } from 'date-fns'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWeekRange(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }) // Sunday
  return { start, end }
}

export function getNextWeekRange(date: Date) {
  const nextWeek = addWeeks(date, 1)
  return getWeekRange(nextWeek)
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy')
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatBirthdayDate(date: Date): string {
  // Always format in Central Time zone to ensure consistency
  return formatInTimeZone(date, 'America/Chicago', 'MMM d')
}

export function getUpcomingBirthdays(users: Array<{ fullName: string; birthday: Date }>) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const nextYear = currentYear + 1
  
  // Get current date in Central Time
  const nowInCT = toZonedTime(now, 'America/Chicago')
  
  return users
    .map(user => {
      // Convert birthday to Central Time to get correct month/day
      const birthdayInCT = toZonedTime(user.birthday, 'America/Chicago')
      const birthdayMonth = birthdayInCT.getMonth()
      const birthdayDay = birthdayInCT.getDate()
      
      // Create birthday dates for this year and next year in Central Time
      const birthdayThisYear = new Date(currentYear, birthdayMonth, birthdayDay)
      const birthdayNextYear = new Date(nextYear, birthdayMonth, birthdayDay)
      
      // Use this year's birthday if it hasn't passed, otherwise use next year's
      const upcomingBirthday = birthdayThisYear >= nowInCT ? birthdayThisYear : birthdayNextYear
      
      return {
        ...user,
        birthdayThisYear: upcomingBirthday
      }
    })
    .filter(user => {
      // Show all upcoming birthdays for the next 12 months
      const oneYearFromNow = new Date(nowInCT.getFullYear() + 1, nowInCT.getMonth(), nowInCT.getDate())
      return user.birthdayThisYear <= oneYearFromNow
    })
    .sort((a, b) => a.birthdayThisYear.getTime() - b.birthdayThisYear.getTime())
}

export function getNextMonday(date: Date = new Date()): Date {
  const nextMonday = new Date(date)
  const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
  return nextMonday
}

export function getNextSaturday(date: Date = new Date()): Date {
  const nextSaturday = new Date(date)
  const daysUntilSaturday = (6 - nextSaturday.getDay() + 7) % 7 || 7
  nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday)
  return nextSaturday
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
} 