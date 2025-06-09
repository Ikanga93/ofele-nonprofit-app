'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Users, Heart, Newspaper, HandHeart, LogOut, Settings, ArrowLeft, Send } from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  role: string
}

interface PrayerRequest {
  id: string
  title: string
  content: string
  isAnonymous: boolean
  createdAt: string
  user?: {
    fullName: string
  }
}

interface DashboardData {
  mondayModerator: {
    name: string
    date: string
    time: string
  } | null
  saturdayModerator: {
    name: string
    date: string
    time: string
  } | null
  upcomingBirthdays: Array<{
    name: string
    date: string
  }>
  prayerSubjects: Array<{
    id: string
    title: string
    description: string | null
  }>
  news: Array<{
    id: string
    title: string
    content: string
    eventDate: string | null
    isEvent: boolean
    createdAt: string
  }>
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    name: '',
    isAnonymous: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchPrayerRequests()
    }
  }, [user])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrayerRequests = async () => {
    try {
      const response = await fetch('/api/prayer-requests')
      if (response.ok) {
        const data = await response.json()
        setPrayerRequests(data.requests)
      } else if (response.status === 401) {
        // User not authenticated, clear prayer requests
        setPrayerRequests([])
      }
    } catch (error) {
      console.error('Error fetching prayer requests:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setData(null)
      window.location.reload()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/prayer-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Prayer request submitted successfully!')
        setFormData({ title: '', content: '', name: '', isAnonymous: false })
        setShowForm(false)
        fetchPrayerRequests() // Refresh the list
      } else {
        setError(data.error || 'Failed to submit prayer request')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    const name = e.target.name
    
    setFormData({
      ...formData,
      [name]: value,
      // Clear name field if anonymous is selected
      ...(name === 'isAnonymous' && value ? { name: '' } : {})
    })
  }

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Non-authenticated users see only prayer requests
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header for non-authenticated users */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <HandHeart className="h-6 w-6 text-purple-600 mr-2" />
                  Stone Creek Intercession
                </h1>
                <p className="text-gray-600 mt-1">Community Prayer Requests</p>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Submit Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit a Prayer Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Your name (leave blank to submit anonymously)"
                    disabled={formData.isAnonymous}
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Brief title for your prayer request"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Prayer Request
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    rows={4}
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Please share your prayer request..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                    Submit anonymously (this will clear the name field)
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Prayer Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Prayer Requests List */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Welcome to Stone Creek Intercession!</strong> You can submit prayer requests here for our community to pray for. 
                To view prayer requests and access full community features including prayer teams, schedules, and news, please{' '}
                <a href="/login" className="underline font-medium">login</a> or{' '}
                <a href="/register" className="underline font-medium">register</a>.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <HandHeart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Prayer Requests</h3>
                <p className="text-gray-600 mb-4">
                  Prayer requests are private and can only be viewed by registered community members. 
                  Please login or register to view and pray for community requests.
                </p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
                  >
                    <HandHeart className="h-5 w-5 mr-2" />
                    Prayer Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Authenticated users see the full dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header for authenticated users */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stone Creek Intercession</h1>
              <p className="text-gray-600 mt-1">Community Prayer & Fellowship</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome, {user.fullName}</p>
                <p className="text-xs text-gray-600">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Member'}
                </p>
              </div>
              {user.role === 'ADMIN' && (
                <a
                  href="/admin"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </a>
              )}
              <button
                onClick={handleLogout}
                className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Moderators & Birthdays */}
          <div className="space-y-6">
            {/* Monday Moderator */}
            <Link href="/schedule" className="block">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-blue-200">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Monday Prayer Moderator</h2>
                </div>
                {data?.mondayModerator ? (
                  <div>
                    <p className="text-xl font-medium text-gray-900">{data.mondayModerator.name}</p>
                    <p className="text-gray-600">{data.mondayModerator.date}</p>
                    <p className="text-gray-600 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {data.mondayModerator.time}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No moderator scheduled</p>
                )}
                <p className="text-blue-600 text-sm mt-3 font-medium">Click to view full schedule →</p>
              </div>
            </Link>

            {/* Saturday Moderator */}
            <Link href="/schedule" className="block">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-green-200">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Saturday Prayer Moderator</h2>
                </div>
                {data?.saturdayModerator ? (
                  <div>
                    <p className="text-xl font-medium text-gray-900">{data.saturdayModerator.name}</p>
                    <p className="text-gray-600">{data.saturdayModerator.date}</p>
                    <p className="text-gray-600 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {data.saturdayModerator.time}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No moderator scheduled</p>
                )}
                <p className="text-green-600 text-sm mt-3 font-medium">Click to view full schedule →</p>
              </div>
            </Link>

            {/* Upcoming Birthdays */}
            <Link href="/birthdays" className="block">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-pink-200">
                <div className="flex items-center mb-4">
                  <Heart className="h-5 w-5 text-pink-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Birthdays</h2>
                </div>
                {data?.upcomingBirthdays && data.upcomingBirthdays.length > 0 ? (
                  <div className="space-y-2">
                    {data.upcomingBirthdays.slice(0, 3).map((birthday, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{birthday.name}</span>
                        <span className="text-gray-600 text-sm">{birthday.date}</span>
                      </div>
                    ))}
                    {data.upcomingBirthdays.length > 3 && (
                      <p className="text-gray-500 text-sm">+{data.upcomingBirthdays.length - 3} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No birthdays this month</p>
                )}
                <p className="text-pink-600 text-sm mt-3 font-medium">Click to view all birthdays →</p>
              </div>
            </Link>
          </div>

          {/* Middle Column - News & Events */}
          <Link href="/news" className="block">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-orange-200">
              <div className="flex items-center mb-6">
                <Newspaper className="h-5 w-5 text-orange-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">News & Events</h2>
              </div>
              {data?.news && data.news.length > 0 ? (
                <div className="space-y-4">
                  {data.news.slice(0, 3).map((item) => (
                    <div key={item.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {item.content.length > 80 ? `${item.content.substring(0, 80)}...` : item.content}
                          </p>
                          {item.eventDate && (
                            <p className="text-blue-600 text-sm mt-2 font-medium">
                              Event Date: {new Date(item.eventDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {item.isEvent && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                            Event
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {data.news.length > 3 && (
                    <p className="text-gray-500 text-sm">+{data.news.length - 3} more items</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No news or events</p>
              )}
              <p className="text-orange-600 text-sm mt-4 font-medium">Click to view all news & events →</p>
            </div>
          </Link>

          {/* Right Column - Prayer Subjects */}
          <Link href="/prayer-subjects" className="block">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-purple-200">
              <div className="flex items-center mb-6">
                <HandHeart className="h-5 w-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Prayer Subjects</h2>
              </div>
              {data?.prayerSubjects && data.prayerSubjects.length > 0 ? (
                <div className="space-y-4">
                  {data.prayerSubjects.slice(0, 3).map((subject) => (
                    <div key={subject.id} className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-medium text-gray-900">{subject.title}</h3>
                      {subject.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {subject.description.length > 60 ? `${subject.description.substring(0, 60)}...` : subject.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {data.prayerSubjects.length > 3 && (
                    <p className="text-gray-500 text-sm">+{data.prayerSubjects.length - 3} more subjects</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No prayer subjects</p>
              )}
              <p className="text-purple-600 text-sm mt-4 font-medium">Click to view all prayer subjects →</p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/prayer-requests"
              className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <HandHeart className="h-5 w-5 mr-2" />
              <span className="font-medium">Submit Prayer Request</span>
            </a>
            <a
              href="/prayer-teams"
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">View Prayer Teams</span>
            </a>
            <a
              href="/schedule"
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">View Schedule</span>
            </a>
          </div>
        </div>

        {/* Recent Prayer Requests for authenticated users */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <HandHeart className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Prayer Requests</h2>
            </div>
            <a
              href="/prayer-requests"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All →
            </a>
          </div>
          {prayerRequests.length > 0 ? (
            <div className="space-y-4">
              {prayerRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{request.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {request.content.length > 100 ? `${request.content.substring(0, 100)}...` : request.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {request.isAnonymous ? 'Anonymous' : `By ${request.user?.fullName || 'Unknown'}`}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Prayer Request
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HandHeart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No prayer requests yet</p>
              <a
                href="/prayer-requests"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2 inline-block"
              >
                Submit the first request →
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
