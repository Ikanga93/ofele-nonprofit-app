'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Gift, Users } from 'lucide-react'
import { formatBirthdayDate } from '@/lib/utils'
import { toZonedTime } from 'date-fns-tz'

interface User {
  id: string
  fullName: string
  birthday: string
}

interface BirthdayGroup {
  month: string
  users: User[]
}

export default function BirthdaysPage() {
  const [birthdays, setBirthdays] = useState<BirthdayGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState<string>('')

  useEffect(() => {
    fetchBirthdays()
    setCurrentMonth(new Date().toLocaleString('default', { month: 'long' }))
  }, [])

  const fetchBirthdays = async () => {
    try {
      const response = await fetch('/api/birthdays')
      if (response.ok) {
        const data = await response.json()
        
        // Group users by birth month
        const monthGroups: { [key: string]: User[] } = {}
        
        data.users.forEach((user: User) => {
          if (user.birthday) {
            const birthDate = new Date(user.birthday)
            // Parse the date correctly to avoid timezone issues
            const dateStr = birthDate.toISOString()
            const parts = dateStr.split('T')[0].split('-')
            const month = parseInt(parts[1]) - 1 // JavaScript months are 0-indexed
            const localDate = new Date(2000, month, 1) // Use dummy year and day
            const monthName = localDate.toLocaleDateString('en-US', { 
              month: 'long'
            })
            
            if (!monthGroups[monthName]) {
              monthGroups[monthName] = []
            }
            monthGroups[monthName].push(user)
          }
        })
        
        // Sort users within each month by day
        Object.keys(monthGroups).forEach(month => {
          monthGroups[month].sort((a, b) => {
            // Parse dates correctly to avoid timezone issues
            const birthdayA = new Date(a.birthday)
            const birthdayB = new Date(b.birthday)
            const dayA = parseInt(birthdayA.toISOString().split('T')[0].split('-')[2])
            const dayB = parseInt(birthdayB.toISOString().split('T')[0].split('-')[2])
            return dayA - dayB
          })
        })
        
        // Convert to array and sort by month order
        const monthOrder = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]
        
        const sortedGroups = monthOrder
          .filter(month => monthGroups[month])
          .map(month => ({
            month,
            users: monthGroups[month]
          }))
        
        setBirthdays(sortedGroups)
      }
    } catch (error) {
      console.error('Error fetching birthdays:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBirthday = (birthday: string) => {
    const date = new Date(birthday)
    // Use the same formatting function as everywhere else in the app
    return formatBirthdayDate(date)
  }

  const isCurrentMonth = (month: string) => {
    return month === currentMonth
  }

  const isUpcoming = (birthday: string) => {
    const today = new Date()
    const birthDate = new Date(birthday)
    const thisYear = today.getFullYear()
    
    // Parse the birthday date correctly to avoid timezone issues
    const dateStr = birthDate.toISOString()
    const parts = dateStr.split('T')[0].split('-')
    const birthdayMonth = parseInt(parts[1]) - 1 // JavaScript months are 0-indexed
    const birthdayDay = parseInt(parts[2])
    
    // Set the birthday to this year using local time
    const thisBirthday = new Date(thisYear, birthdayMonth, birthdayDay)
    
    // If birthday has passed this year, check next year
    if (thisBirthday < today) {
      thisBirthday.setFullYear(thisYear + 1)
    }
    
    // Check if birthday is within next 30 days
    const diffTime = thisBirthday.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= 30 && diffDays >= 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading birthdays...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <Link href="/" className="mr-3 sm:mr-4 text-gray-600 hover:text-gray-900 flex-shrink-0">
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2 flex-shrink-0" />
                  <span className="truncate">Community Birthdays</span>
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Celebrate with our Stone Creek family</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Current Month Highlight */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-purple-900">This Month: {currentMonth}</h2>
          </div>
          {birthdays.find(group => group.month === currentMonth) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {birthdays
                .find(group => group.month === currentMonth)
                ?.users.map((user) => (
                  <div key={user.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-purple-200">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-3 flex-shrink-0">
                        <Gift className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.fullName}</h3>
                        <p className="text-purple-600 text-xs sm:text-sm">{formatBirthday(user.birthday)}</p>
                        {isUpcoming(user.birthday) && (
                          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                            Coming Soon!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-purple-700 text-sm sm:text-base">No birthdays this month</p>
          )}
        </div>

        {/* All Birthdays by Month */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-gray-600 mr-2" />
              All Birthdays by Month
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {birthdays.map((group) => (
              <div key={group.month} className="p-4 sm:p-6">
                <h3 className={`text-lg font-medium mb-4 ${
                  isCurrentMonth(group.month) ? 'text-purple-600' : 'text-gray-900'
                }`}>
                  {group.month}
                  {isCurrentMonth(group.month) && (
                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      Current Month
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {group.users.map((user) => (
                    <div key={user.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="bg-purple-100 p-2 rounded-full mr-3 flex-shrink-0">
                        <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{user.fullName}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">{formatBirthday(user.birthday)}</p>
                        {isUpcoming(user.birthday) && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {birthdays.length === 0 && (
            <div className="p-8 sm:p-12 text-center">
              <Gift className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Birthdays Found</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                No community members have birthdays on record yet.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 