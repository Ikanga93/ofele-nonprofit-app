'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Mail, Calendar, Shield, User } from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  department: string
}

export default function FamilyMembersPage() {
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Family Members</h1>
              <p className="text-gray-600 text-sm">View and manage family department members</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Department Members</h2>
          <p className="text-gray-600 mt-2">Current members of the Family Department</p>
        </div>

        {/* Members will be implemented here */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Member Management Coming Soon</h3>
            <p className="text-gray-500 mb-6">
              Family member management is under development. This feature will allow you to view 
              and manage all Family Department members and their roles.
            </p>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Planned Features:</h4>
                <ul className="text-blue-800 text-sm space-y-1 text-left max-w-md mx-auto">
                  <li className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Member directory and profiles
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact information management
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Role and permission management
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Birthday and anniversary tracking
                  </li>
                </ul>
              </div>

              {/* Current User Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-green-900 mb-2">Your Information:</h4>
                <div className="text-green-800 text-sm space-y-1">
                  <p><strong>Name:</strong> {user.fullName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Department:</strong> {user.department}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 