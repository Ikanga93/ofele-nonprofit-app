'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, HandHeart, Clock, CheckCircle } from 'lucide-react'

interface PrayerSubject {
  id: string
  title: string
  description?: string
  isActive: boolean
  createdAt: string
}

export default function PrayerSubjectsPage() {
  const [prayerSubjects, setPrayerSubjects] = useState<PrayerSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE')

  useEffect(() => {
    fetchPrayerSubjects()
  }, [])

  const fetchPrayerSubjects = async () => {
    try {
      const response = await fetch('/api/prayer-subjects')
      if (response.ok) {
        const data = await response.json()
        setPrayerSubjects(data.prayerSubjects)
      }
    } catch (error) {
      console.error('Error fetching prayer subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredSubjects = prayerSubjects.filter(subject => {
    if (filter === 'ALL') return true
    if (filter === 'ACTIVE') return subject.isActive
    if (filter === 'INACTIVE') return !subject.isActive
    return true
  })

  const sortedSubjects = filteredSubjects.sort((a, b) => {
    // Active subjects first, then by creation date (newest first)
    if (a.isActive && !b.isActive) return -1
    if (!a.isActive && b.isActive) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prayer subjects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <HandHeart className="h-6 w-6 text-purple-600 mr-2" />
                  Prayer Subjects
                </h1>
                <p className="text-gray-600 mt-1">Focus areas for our community prayers</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'ACTIVE', name: 'Active Subjects', count: prayerSubjects.filter(s => s.isActive).length },
                { id: 'ALL', name: 'All Subjects', count: prayerSubjects.length },
                { id: 'INACTIVE', name: 'Inactive', count: prayerSubjects.filter(s => !s.isActive).length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    filter === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    filter === tab.id
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Prayer Subjects */}
        {sortedSubjects.length > 0 ? (
          <div className="space-y-4">
            {sortedSubjects.map((subject) => (
              <div 
                key={subject.id} 
                className={`bg-white rounded-lg shadow-sm border-l-4 ${
                  subject.isActive ? 'border-purple-500' : 'border-gray-400'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      <div className={`p-2 rounded-full mr-4 ${
                        subject.isActive ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        {subject.isActive ? (
                          <HandHeart className="h-5 w-5 text-purple-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900">{subject.title}</h2>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            subject.isActive
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {subject.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {subject.description && (
                          <p className="text-gray-700 leading-relaxed mb-4">{subject.description}</p>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Added {formatDate(subject.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <HandHeart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No {filter.toLowerCase() === 'all' ? '' : filter.toLowerCase()} prayer subjects yet
            </h3>
            <p className="text-gray-600">
              {filter === 'ACTIVE' 
                ? 'Active prayer subjects will appear here as they are created by administrators.'
                : filter === 'INACTIVE'
                ? 'Inactive prayer subjects will appear here when they are deactivated.'
                : 'Prayer subjects will appear here as they are created by administrators.'
              }
            </p>
          </div>
        )}

        {/* Prayer Focus Section */}
        {sortedSubjects.filter(s => s.isActive).length > 0 && (
          <div className="mt-12 bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <HandHeart className="h-5 w-5 text-purple-600 mr-2" />
              Current Prayer Focus
            </h2>
            <p className="text-purple-800 mb-4">
              These are the active prayer subjects our community is focusing on during prayer sessions and personal prayer time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedSubjects
                .filter(subject => subject.isActive)
                .slice(0, 4)
                .map((subject) => (
                  <div key={subject.id} className="bg-white p-4 rounded-lg border border-purple-200">
                    <h3 className="font-medium text-gray-900 mb-1">{subject.title}</h3>
                    {subject.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{subject.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 