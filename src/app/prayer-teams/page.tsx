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
      <div className="min-h-screen flex items-center justify-center">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  Prayer Teams
                </h1>
                <p className="text-gray-600 mt-1">Weekly prayer partnerships in our community</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Week Highlight */}
        {currentWeekTeams.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-blue-900">This Week's Prayer Teams</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentWeekTeams.map((team) => (
                <div key={team.id} className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
                  <div className="flex items-center mb-3">
                    <Heart className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      {formatDateRange(team.weekStart, team.weekEnd)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-900">{team.member1.fullName}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-900">{team.member2.fullName}</span>
                    </div>
                    {team.member3 && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="font-medium text-gray-900">{team.member3.fullName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'CURRENT', name: 'Current Week', count: prayerTeams.filter(t => getWeekStatus(t.weekStart, t.weekEnd) === 'current').length },
                { id: 'UPCOMING', name: 'Upcoming', count: prayerTeams.filter(t => getWeekStatus(t.weekStart, t.weekEnd) === 'upcoming').length },
                { id: 'PAST', name: 'Past Teams', count: prayerTeams.filter(t => getWeekStatus(t.weekStart, t.weekEnd) === 'past').length },
                { id: 'ALL', name: 'All Teams', count: prayerTeams.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    filter === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
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
          <div className="space-y-4">
            {sortedTeams.map((team) => {
              const status = getWeekStatus(team.weekStart, team.weekEnd)
              const statusColors = {
                current: 'border-blue-500 bg-blue-50',
                upcoming: 'border-green-500 bg-green-50',
                past: 'border-gray-400 bg-gray-50'
              }
              const statusLabels = {
                current: 'Current Week',
                upcoming: 'Upcoming',
                past: 'Past'
              }
              const statusTextColors = {
                current: 'text-blue-800',
                upcoming: 'text-green-800',
                past: 'text-gray-800'
              }

              return (
                <div 
                  key={team.id} 
                  className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${statusColors[status]}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Prayer Team - {formatDateRange(team.weekStart, team.weekEnd)}
                      </h3>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      status === 'current' ? 'bg-blue-100 text-blue-800' :
                      status === 'upcoming' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {statusLabels[status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-900">{team.member1.fullName}</span>
                    </div>
                    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-900">{team.member2.fullName}</span>
                    </div>
                    {team.member3 && (
                      <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900">{team.member3.fullName}</span>
                      </div>
                    )}
                  </div>

                  {status === 'current' && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        <strong>This week:</strong> Take time to pray for your prayer partner(s) and reach out to encourage them in their faith journey.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No {filter.toLowerCase() === 'all' ? '' : filter.toLowerCase()} prayer teams yet
            </h3>
            <p className="text-gray-600">
              {filter === 'CURRENT' 
                ? 'No prayer teams are active for this week. Teams will appear here once generated by an administrator.'
                : filter === 'UPCOMING'
                ? 'No upcoming prayer teams scheduled yet.'
                : filter === 'PAST'
                ? 'No past prayer teams to display.'
                : 'Prayer teams will appear here once they are generated by an administrator.'
              }
            </p>
          </div>
        )}

        {/* About Prayer Teams */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 text-blue-600 mr-2" />
            About Prayer Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-800">
            <div>
              <h3 className="font-medium mb-2">How Prayer Teams Work</h3>
              <ul className="text-sm space-y-1">
                <li>• Teams are randomly generated each week</li>
                <li>• Each team has 2-3 community members</li>
                <li>• Teams change weekly for variety</li>
                <li>• All members participate equally</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Your Role</h3>
              <ul className="text-sm space-y-1">
                <li>• Pray for your team members daily</li>
                <li>• Reach out to encourage them</li>
                <li>• Share prayer requests if comfortable</li>
                <li>• Build meaningful connections</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 