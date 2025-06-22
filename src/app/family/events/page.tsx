'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Plus, MapPin, Clock, Users } from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  department: string
}

export default function FamilyEventsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
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

  // Check if user is Family department
  if (!user || user.department !== 'FAMILY') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to be a Family Department member to access this page.</p>
          <Link 
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Family Events</h1>
              <p className="text-gray-600 text-sm">Manage and view family department events</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
            {user.role === 'ADMIN' && (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </button>
            )}
          </div>
        </div>

        {/* Events will be implemented here */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Events Coming Soon</h3>
            <p className="text-gray-500 mb-6">
              Family events management is under development. This feature will allow you to create, 
              manage, and track family department events and activities.
            </p>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Planned Features:</h4>
                <ul className="text-blue-800 text-sm space-y-1 text-left max-w-md mx-auto">
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Event creation and scheduling
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location management
                  </li>
                  <li className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    RSVP tracking
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Reminder notifications
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 