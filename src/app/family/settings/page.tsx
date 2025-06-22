'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings, Bell, Shield, Palette, Database, Globe } from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  department: string
}

export default function FamilySettingsPage() {
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Family Settings</h1>
              <p className="text-gray-600 text-sm">Configure family department preferences and settings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Department Settings</h2>
          <p className="text-gray-600 mt-2">Manage your Family Department configuration</p>
        </div>

        {/* Settings will be implemented here */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
            <p className="text-gray-500 mb-6">
              Family department settings are under development. This feature will allow you to 
              customize your department experience and manage various preferences.
            </p>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Planned Settings:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Notification preferences
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy settings
                    </div>
                    <div className="flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      Theme customization
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      Data management
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Content visibility
                    </div>
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      General preferences
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Settings Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-green-900 mb-2">Current Configuration:</h4>
                <div className="text-green-800 text-sm space-y-1">
                  <p><strong>Department:</strong> Family Department</p>
                  <p><strong>Your Role:</strong> {user.role}</p>
                  <p><strong>Access Level:</strong> {user.role === 'ADMIN' ? 'Full Administrative Access' : 'Member Access'}</p>
                  <p><strong>Blog Permissions:</strong> {user.role === 'ADMIN' ? 'Create, Edit, Delete' : 'View Only'}</p>
                </div>
              </div>

              {user.role === 'ADMIN' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Admin Features:</h4>
                  <div className="text-yellow-800 text-sm space-y-1">
                    <p>• Manage blog posts and content</p>
                    <p>• Access deleted posts recovery</p>
                    <p>• View analytics and metrics</p>
                    <p>• Configure department settings (when available)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 