'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Gift, Users } from 'lucide-react'

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
            // Use Central Time for month grouping
            const monthName = birthDate.toLocaleDateString('en-US', { 
              month: 'long',
              timeZone: 'America/Chicago'
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
            // Use Central Time for day comparison
            const dayA = new Date(a.birthday).toLocaleDateString('en-US', { 
              day: 'numeric',
              timeZone: 'America/Chicago'
            })
            const dayB = new Date(b.birthday).toLocaleDateString('en-US', { 
              day: 'numeric',
              timeZone: 'America/Chicago'
            })
            return parseInt(dayA) - parseInt(dayB)
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
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Chicago'
    })
  }

  const isCurrentMonth = (month: string) => {
    return month === currentMonth
  }

  const isUpcoming = (birthday: string) => {
    const today = new Date()
    const birthDate = new Date(birthday)
    const thisYear = today.getFullYear()
    
    // Set the birthday to this year
    const thisBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate())
    
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
      <div className="min-h-screen flex items-center justify-center">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Gift className="h-6 w-6 text-purple-600 mr-2" />
                  Community Birthdays
                </h1>
                <p className="text-gray-600 mt-1">Celebrate with our Stone Creek family</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Month Highlight */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-purple-900">This Month: {currentMonth}</h2>
          </div>
          {birthdays.find(group => group.month === currentMonth) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {birthdays
                .find(group => group.month === currentMonth)
                ?.users.map((user) => (
                  <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-purple-200">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <Gift className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.fullName}</h3>
                        <p className="text-purple-600 text-sm">{formatBirthday(user.birthday)}</p>
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
            <p className="text-purple-700">No birthdays this month</p>
          )}
        </div>

        {/* All Birthdays by Month */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-gray-600 mr-2" />
              All Birthdays by Month
            </h2>
          </div>

          <div className="p-6">
            {birthdays.length > 0 ? (
              <div className="space-y-8">
                {birthdays.map((group) => (
                  <div key={group.month}>
                    <h3 className={`text-lg font-medium mb-4 flex items-center ${
                      isCurrentMonth(group.month) ? 'text-purple-700' : 'text-gray-900'
                    }`}>
                      <Calendar className={`h-5 w-5 mr-2 ${
                        isCurrentMonth(group.month) ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                      {group.month}
                      {isCurrentMonth(group.month) && (
                        <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Current Month
                        </span>
                      )}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.users.map((user) => (
                        <div 
                          key={user.id} 
                          className={`p-4 rounded-lg border ${
                            isCurrentMonth(group.month)
                              ? 'bg-purple-50 border-purple-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${
                              isCurrentMonth(group.month)
                                ? 'bg-purple-100'
                                : 'bg-gray-100'
                            }`}>
                              <Gift className={`h-4 w-4 ${
                                isCurrentMonth(group.month)
                                  ? 'text-purple-600'
                                  : 'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{user.fullName}</h4>
                              <p className={`text-sm ${
                                isCurrentMonth(group.month)
                                  ? 'text-purple-600'
                                  : 'text-gray-600'
                              }`}>
                                {formatBirthday(user.birthday)}
                              </p>
                              {isUpcoming(user.birthday) && (
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                                  Upcoming
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No birthdays available</h3>
                <p className="text-gray-600">
                  Birthday information will appear here as community members join.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 