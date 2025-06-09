'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, Clock, Heart } from 'lucide-react'

interface PrayerTeam {
  id: string
  weekStart: string
  weekEnd: string
  member1: {
    fullName: string
  }
  member2: {
    fullName: string
  }
  member3?: {
    fullName: string
  }
}

export default function PrayerTeamsPage() {
  const [prayerTeams, setPrayerTeams] = useState<PrayerTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'CURRENT' | 'UPCOMING' | 'PAST' | 'ALL'>('CURRENT')

  useEffect(() => {
    fetchPrayerTeams()
  }, [])

  const fetchPrayerTeams = async () => {
    try {
      const response = await fetch('/api/prayer-teams')
      if (response.ok) {
        const data = await response.json()
        setPrayerTeams(data.teams)
      }
    } catch (error) {
      console.error('Error fetching prayer teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return `${start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`
  }

  const getWeekStatus = (startDate: string, endDate: string) => {
    const today = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (today >= start && today <= end) {
      return 'current'
    } else if (today < start) {
      return 'upcoming'
    } else {
      return 'past'
    }
  }

  const filteredTeams = prayerTeams.filter(team => {
    const status = getWeekStatus(team.weekStart, team.weekEnd)
    
    if (filter === 'ALL') return true
    if (filter === 'CURRENT') return status === 'current'
    if (filter === 'UPCOMING') return status === 'upcoming'
    if (filter === 'PAST') return status === 'past'
    return true
  })

  const sortedTeams = filteredTeams.sort((a, b) => {
    // Sort by week start date, most recent first
    return new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  })

  const currentWeekTeams = prayerTeams.filter(team => 
    getWeekStatus(team.weekStart, team.weekEnd) === 'current'
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prayer teams...</p>
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
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="truncate">Prayer Teams</span>
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Weekly prayer partnerships in our community</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Current Week Highlight */}
        {currentWeekTeams.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900">This Week's Prayer Teams</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {currentWeekTeams.map((team) => (
                <div key={team.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-blue-200">
                  <div className="flex items-center mb-3">
                    <Heart className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-blue-800 truncate">
                      {formatDateRange(team.weekStart, team.weekEnd)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="font-medium text-gray-900 text-sm truncate">{team.member1.fullName}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="font-medium text-gray-900 text-sm truncate">{team.member2.fullName}</span>
                    </div>
                    {team.member3 && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                        <span className="font-medium text-gray-900 text-sm truncate">{team.member3.fullName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-2 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {[
                { id: 'CURRENT', name: 'Current Week', count: prayerTeams.filter(t => getWeekStatus(t.weekStart, t.weekEnd) === 'current').length },
                { id: 'UPCOMING', name: 'Upcoming', count: prayerTeams.filter(t => getWeekStatus(t.weekStart, t.weekEnd) === 'upcoming').length },
                { id: 'PAST', name: 'Past Teams', count: prayerTeams.filter(t => getWeekStatus(t.weekStart, t.weekEnd) === 'past').length },
                { id: 'ALL', name: 'All Teams', count: prayerTeams.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                    filter === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                  <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                    filter === tab.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Prayer Teams List */}
        {sortedTeams.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {sortedTeams.map((team) => {
              const status = getWeekStatus(team.weekStart, team.weekEnd)
              return (
                <div 
                  key={team.id} 
                  className={`bg-white rounded-lg shadow-sm border-l-4 ${
                    status === 'current' 
                      ? 'border-blue-500' 
                      : status === 'upcoming'
                      ? 'border-green-500'
                      : 'border-gray-400'
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <Heart className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0 ${
                          status === 'current' 
                            ? 'text-blue-600' 
                            : status === 'upcoming'
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`} />
                        <span className="text-sm sm:text-base font-medium text-gray-900">
                          {formatDateRange(team.weekStart, team.weekEnd)}
                        </span>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'current'
                          ? 'bg-blue-100 text-blue-800'
                          : status === 'upcoming'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {status === 'current' ? 'This Week' : status === 'upcoming' ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        <span className="font-medium text-gray-900 text-sm truncate">{team.member1.fullName}</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        <span className="font-medium text-gray-900 text-sm truncate">{team.member2.fullName}</span>
                      </div>
                      {team.member3 && (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                          <span className="font-medium text-gray-900 text-sm truncate">{team.member3.fullName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
            <Users className="h-10 w-10 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              No {filter.toLowerCase() === 'all' ? '' : filter.toLowerCase()} prayer teams yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base px-4">
              {filter === 'CURRENT' 
                ? 'No prayer teams are active for this week. Teams are generated weekly by administrators.'
                : filter === 'UPCOMING'
                ? 'No upcoming prayer teams scheduled yet. Teams are generated weekly by administrators.'
                : filter === 'PAST'
                ? 'No past prayer teams found. Teams will appear here after they are completed.'
                : 'Prayer teams will appear here as they are generated by administrators.'
              }
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 sm:mt-12 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 text-blue-600 mr-2" />
            About Prayer Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base text-blue-800">
            <div>
              <h3 className="font-medium mb-2">How It Works</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• Teams change every week</li>
                <li>• Random pairing ensures variety</li>
                <li>• All members participate</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Team Structure</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• Usually 2 members per team</li>
                <li>• Sometimes 3 if odd number</li>
                <li>• Pray for each other during the week</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 