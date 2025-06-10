'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Users } from 'lucide-react'

interface ModeratorSchedule {
  id: string
  date: string
  dayType: 'MONDAY' | 'SATURDAY'
  startTime: string
  endTime: string
  user: {
    fullName: string
  }
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ModeratorSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'MONDAY' | 'SATURDAY'>('ALL')

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/moderator-schedule')
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    // For dates stored as UTC strings, we need to extract the original date parts
    // to avoid timezone conversion issues
    const parts = dateString.split('T')[0].split('-')
    const year = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1 // JavaScript months are 0-indexed
    const day = parseInt(parts[2])
    
    // Create a new local date with the extracted parts
    const localDate = new Date(year, month, day)
    
    return localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const filteredSchedules = schedules.filter(schedule => 
    filter === 'ALL' || schedule.dayType === filter
  )

  const groupedSchedules = filteredSchedules.reduce((groups, schedule) => {
    const type = schedule.dayType
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(schedule)
    return groups
  }, {} as Record<string, ModeratorSchedule[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedules...</p>
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
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2 flex-shrink-0" />
                  <span className="truncate">Prayer Moderator Schedule</span>
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Monday and Saturday prayer session moderators</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {[
                { id: 'ALL', name: 'All Sessions', color: 'gray' },
                { id: 'MONDAY', name: 'Monday Sessions', color: 'blue' },
                { id: 'SATURDAY', name: 'Saturday Sessions', color: 'green' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Session Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                  <h3 className="font-medium text-blue-900 text-sm sm:text-base">Monday Prayer Sessions</h3>
                </div>
                <p className="text-blue-800 text-xs sm:text-sm mb-2">Time: 6:00 PM - 7:00 PM</p>
                <p className="text-blue-700 text-xs sm:text-sm">
                  Weekly prayer sessions moderated by rotating community members
                </p>
              </div>
              <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                  <h3 className="font-medium text-green-900 text-sm sm:text-base">Saturday Prayer Sessions</h3>
                </div>
                <p className="text-green-800 text-xs sm:text-sm mb-2">Time: 4:30 PM - 6:00 PM</p>
                <p className="text-green-700 text-xs sm:text-sm">
                  Weekend prayer sessions with extended time for fellowship
                </p>
              </div>
            </div>

            {/* Schedule Lists */}
            {Object.entries(groupedSchedules).map(([dayType, daySchedules]) => (
              <div key={dayType} className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <Users className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${dayType === 'MONDAY' ? 'text-blue-600' : 'text-green-600'}`} />
                  {dayType === 'MONDAY' ? 'Monday' : 'Saturday'} Prayer Moderators
                </h2>
                
                {daySchedules.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {daySchedules.map((schedule) => (
                      <div 
                        key={schedule.id} 
                        className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                          dayType === 'MONDAY' 
                            ? 'bg-blue-50 border-blue-500' 
                            : 'bg-green-50 border-green-500'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="mb-2 sm:mb-0">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{schedule.user.fullName}</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">{formatDate(schedule.date)}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className={`font-medium text-xs sm:text-sm ${
                              dayType === 'MONDAY' ? 'text-blue-700' : 'text-green-700'
                            }`}>
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {dayType === 'MONDAY' ? 'Monday Session' : 'Saturday Session'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                    <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      No {dayType.toLowerCase()} schedules yet
                    </h3>
                    <p className="text-gray-600 text-sm px-4">
                      Schedules will appear here once they are generated by an administrator.
                    </p>
                  </div>
                )}
              </div>
            ))}

            {filteredSchedules.length === 0 && (
              <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
                <Calendar className="h-10 w-10 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No schedules found</h3>
                <p className="text-gray-600 text-sm sm:text-base px-4">
                  Prayer moderator schedules will appear here once they are generated by administrators.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            About Prayer Moderators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base text-green-800">
            <div>
              <h3 className="font-medium mb-2">Moderator Role</h3>
              <ul className="space-y-1 text-green-700">
                <li>• Lead prayer sessions</li>
                <li>• Guide discussion and prayer</li>
                <li>• Create welcoming environment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Schedule Details</h3>
              <ul className="space-y-1 text-green-700">
                <li>• Rotating weekly assignments</li>
                <li>• All community members participate</li>
                <li>• Consistent prayer times</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 