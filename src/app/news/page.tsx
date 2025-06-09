'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Newspaper, Calendar, Clock } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  content: string
  eventDate?: string
  isEvent: boolean
  createdAt: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'NEWS' | 'EVENTS'>('ALL')

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news')
      if (response.ok) {
        const data = await response.json()
        setNews(data.news)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isUpcomingEvent = (eventDate: string) => {
    const today = new Date()
    const event = new Date(eventDate)
    return event >= today
  }

  const filteredNews = news.filter(item => {
    if (filter === 'ALL') return true
    if (filter === 'NEWS') return !item.isEvent
    if (filter === 'EVENTS') return item.isEvent
    return true
  })

  const sortedNews = filteredNews.sort((a, b) => {
    // For events, sort by event date if available, otherwise by creation date
    if (a.isEvent && b.isEvent) {
      const dateA = a.eventDate ? new Date(a.eventDate) : new Date(a.createdAt)
      const dateB = b.eventDate ? new Date(b.eventDate) : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    }
    // For mixed or news items, sort by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <Link href="/" className="mr-3 sm:mr-4 text-gray-600 hover:text-gray-900 flex-shrink-0">
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                  <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2 flex-shrink-0" />
                  <span className="truncate">News & Events</span>
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Stay updated with Stone Creek community</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {[
                { id: 'ALL', name: 'All Updates', icon: Newspaper },
                { id: 'NEWS', name: 'News', icon: Newspaper },
                { id: 'EVENTS', name: 'Events', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                      filter === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* News Items */}
        {sortedNews.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {sortedNews.map((item) => (
              <article 
                key={item.id} 
                className={`bg-white rounded-lg shadow-sm border-l-4 ${
                  item.isEvent 
                    ? isUpcomingEvent(item.eventDate || item.createdAt)
                      ? 'border-green-500'
                      : 'border-gray-400'
                    : 'border-orange-500'
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex items-start mb-3 sm:mb-0">
                      {item.isEvent ? (
                        <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                          isUpcomingEvent(item.eventDate || item.createdAt)
                            ? 'bg-green-100'
                            : 'bg-gray-100'
                        }`}>
                          <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            isUpcomingEvent(item.eventDate || item.createdAt)
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`} />
                        </div>
                      ) : (
                        <div className="bg-orange-100 p-2 rounded-full mr-3 flex-shrink-0">
                          <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 sm:mb-0 ${
                            item.isEvent
                              ? isUpcomingEvent(item.eventDate || item.createdAt)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.isEvent 
                              ? isUpcomingEvent(item.eventDate || item.createdAt)
                                ? 'Upcoming Event'
                                : 'Past Event'
                              : 'News'
                            }
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{item.title}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-gray max-w-none mb-4">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{item.content}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 space-y-2 sm:space-y-0">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {item.isEvent && item.eventDate 
                          ? `Event: ${formatEventDate(item.eventDate)}`
                          : `Posted: ${formatDate(item.createdAt)}`
                        }
                      </span>
                    </div>
                    {item.isEvent && item.eventDate && (
                      <div className="text-xs">
                        Posted: {formatDate(item.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
            <Newspaper className="h-10 w-10 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              No {filter.toLowerCase() === 'all' ? '' : filter.toLowerCase()} updates yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base px-4">
              {filter === 'NEWS' 
                ? 'News updates will appear here as they are published by administrators.'
                : filter === 'EVENTS'
                ? 'Upcoming events will appear here as they are scheduled by administrators.'
                : 'News and events will appear here as they are published by administrators.'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  )
} 