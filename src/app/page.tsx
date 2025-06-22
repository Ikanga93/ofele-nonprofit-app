'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Users, Heart, Newspaper, HandHeart, LogOut, Settings, ArrowLeft, Send, Menu, X, Plus } from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  department: string
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

interface FamilyBoardPost {
  id: string
  title: string
  content: string
  imageUrl?: string
  views: number
  createdAt: string
  user: {
    fullName: string
    role: string
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
  const [familyBoardPosts, setFamilyBoardPosts] = useState<FamilyBoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showFamilyForm, setShowFamilyForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    name: '',
    isAnonymous: false
  })
  const [familyFormData, setFamilyFormData] = useState({
    title: '',
    content: '',
    imageUrl: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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
    // Always fetch family board posts (public content for homepage)
    fetchFamilyBoardPosts()
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

  const fetchFamilyBoardPosts = async () => {
    try {
      const response = await fetch('/api/family-board')
      if (response.ok) {
        const data = await response.json()
        setFamilyBoardPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching family board posts:', error)
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

  const handleFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      let imageUrl = ''
      
      // Upload image if one is selected
      if (selectedFile) {
        const uploadedImageUrl = await uploadImage()
        if (!uploadedImageUrl) {
          // Error already set in uploadImage function
          setSubmitting(false)
          return
        }
        imageUrl = uploadedImageUrl
      }

      const response = await fetch('/api/family-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...familyFormData,
          imageUrl: imageUrl || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Family board post created successfully!')
        resetForm()
        setShowFamilyForm(false)
        fetchFamilyBoardPosts() // Refresh the list
      } else {
        setError(data.error || 'Failed to create family board post')
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

  const handleFamilyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFamilyFormData({
      ...familyFormData,
      [name]: value
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPG, PNG, WebP, or GIF images only.')
        return
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('File too large. Please upload images smaller than 5MB.')
        return
      }

      setSelectedFile(file)
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        return data.imageUrl
      } else {
        setError(data.error || 'Failed to upload image')
        return null
      }
    } catch (error) {
      setError('Failed to upload image')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const resetForm = () => {
    setFamilyFormData({ title: '', content: '', imageUrl: '' })
    setSelectedFile(null)
    setImagePreview(null)
  }

  // Helper function to truncate content
  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    
    // Find the last space before the max length to avoid cutting words
    const truncated = content.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    // If there's a space, cut at the space; otherwise, cut at maxLength
    const cutPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength
    
    return content.substring(0, cutPoint) + '...'
  }

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Non-authenticated users see the blog and can submit prayer requests
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header for non-authenticated users */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                  <HandHeart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2 flex-shrink-0" />
                  <span className="truncate">Stone Creek Departments</span>
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Community Blog & Prayer Requests</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 ml-4">
                <a
                  href="/login"
                  className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="border border-blue-600 text-blue-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm sm:text-base">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Submit Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm sm:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm sm:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm sm:text-base"
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

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {submitting ? 'Submitting...' : 'Submit Prayer Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-full sm:w-auto border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Prayer Requests Section */}
          <div className="space-y-6 mb-6 sm:mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Welcome to Stone Creek Departments!</strong> You can submit prayer requests here for our community to pray for. 
                To view prayer requests and access full community features including prayer teams, schedules, and news, please{' '}
                <a href="/login" className="underline font-medium">login</a> or{' '}
                <a href="/register" className="underline font-medium">register</a>.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="text-center py-8 sm:py-12">
                <HandHeart className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Prayer Requests</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">
                  Prayer requests are private and can only be viewed by registered community members. 
                  Please login or register to view and pray for community requests.
                </p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto text-sm sm:text-base"
                  >
                    <HandHeart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Prayer Request
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Family Blog - Visible to everyone on public homepage */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                Community Blog
              </h2>
            </div>

            {/* Family Blog Posts */}
            {familyBoardPosts.length > 0 ? (
              <div className="space-y-4">
                {familyBoardPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <Link 
                          href={`/blog/${post.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors break-words"
                        >
                          {post.title}
                        </Link>
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {post.imageUrl && (
                        <div className="w-full">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title}
                            className="w-full h-48 object-cover rounded-md"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                          {truncateContent(post.content)}
                        </p>
                        {post.content.length > 200 && (
                          <Link 
                            href={`/blog/${post.id}`}
                            className="text-xs text-blue-600 font-medium hover:text-blue-800 inline-block"
                          >
                            Read full post →
                          </Link>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="break-words">By {post.user.fullName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                            post.user.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {post.user.role}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="whitespace-nowrap">{post.views} view{post.views !== 1 ? 's' : ''}</span>
                        </div>
                        <span className="text-xs text-blue-600 whitespace-nowrap">Public on Homepage</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No blog posts yet. Stay tuned for community updates!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Family Department Homepage
  if (user.department === 'FAMILY') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header for Family department users */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Family Department</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Community Blog & Family Ministry</p>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Welcome, {user.fullName}</p>
                  <p className="text-xs text-gray-600">
                      Family Department • {user.role === 'ADMIN' ? 'Administrator' : 'Member'}
                  </p>
                </div>
                
                {/* Family Department Navigation */}
                <a
                  href="/family/events"
                  className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center text-sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </a>
                
                <a
                  href="/family/members"
                  className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center text-sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </a>
                
                {user.role === 'ADMIN' && (
                  <a
                    href="/family/admin"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Family Admin
                  </a>
                )}
                
                <button
                  onClick={handleLogout}
                  className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center text-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Welcome, {user.fullName}</p>
                    <p className="text-xs text-gray-600">
                        Family Department • {user.role === 'ADMIN' ? 'Administrator' : 'Member'}
                      </p>
                  </div>
                  
                  {/* Family Department Mobile Navigation */}
                  <a
                    href="/family/events"
                    className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center text-sm w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                  </a>
                  
                  <a
                    href="/family/members"
                    className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center text-sm w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Members
                  </a>
                  
                  {user.role === 'ADMIN' && (
                    <a
                      href="/family/admin"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm w-full justify-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Family Admin
                    </a>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center text-sm w-full justify-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Family Blog Management - Full featured for Family department */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  Family Blog Management
                </h2>
                {!showFamilyForm && (
                  <button
                    onClick={() => setShowFamilyForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm mt-2 sm:mt-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Blog Post
                  </button>
                )}
              </div>

              {/* Family Board Form */}
              {showFamilyForm && (
                <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-blue-900">Create Blog Post</h3>
                    <button
                      onClick={() => {
                        setShowFamilyForm(false)
                        resetForm()
                        setError('')
                      }}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleFamilySubmit} className="space-y-4">
                    <div>
                      <label htmlFor="familyTitle" className="block text-sm font-medium text-blue-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="familyTitle"
                        name="title"
                        required
                        value={familyFormData.title}
                        onChange={handleFamilyChange}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                        placeholder="Blog post title"
                      />
                    </div>

                    <div>
                      <label htmlFor="familyImage" className="block text-sm font-medium text-blue-700 mb-1">
                        Image (Optional)
                      </label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          id="familyImage"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-blue-600">
                          Upload JPG, PNG, WebP, or GIF images (max 5MB)
                        </p>
                        
                        {imagePreview && (
                          <div className="relative">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-48 object-cover rounded-md border border-blue-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null)
                                setImagePreview(null)
                                // Reset file input
                                const fileInput = document.getElementById('familyImage') as HTMLInputElement
                                if (fileInput) fileInput.value = ''
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="familyContent" className="block text-sm font-medium text-blue-700 mb-1">
                        Content
                      </label>
                      <textarea
                        id="familyContent"
                        name="content"
                        required
                        rows={6}
                        value={familyFormData.content}
                        onChange={handleFamilyChange}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                        placeholder="Share updates, events, or messages for the community..."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <button
                        type="submit"
                        disabled={submitting || uploadingImage}
                        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {uploadingImage ? 'Uploading Image...' : submitting ? 'Publishing...' : 'Publish Post'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowFamilyForm(false)
                          resetForm()
                          setError('')
                        }}
                        className="w-full sm:w-auto border border-blue-300 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Family Board Posts */}
              {familyBoardPosts.length > 0 ? (
                <div className="space-y-4">
                  {familyBoardPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <Link 
                            href={`/blog/${post.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors break-words"
                          >
                            {post.title}
                          </Link>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {post.imageUrl && (
                          <div className="w-full">
                            <img 
                              src={post.imageUrl} 
                              alt={post.title}
                              className="w-full h-48 object-cover rounded-md"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                            {truncateContent(post.content)}
                          </p>
                          {post.content.length > 200 && (
                            <Link 
                              href={`/blog/${post.id}`}
                              className="text-xs text-blue-600 font-medium hover:text-blue-800 inline-block"
                            >
                              Read full post →
                            </Link>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="break-words">By {post.user.fullName}</span>
                            <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                              post.user.role === 'ADMIN' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {post.user.role}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="whitespace-nowrap">{post.views} view{post.views !== 1 ? 's' : ''}</span>
                          </div>
                          <span className="text-xs text-blue-600 whitespace-nowrap">Public on Homepage</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts Yet</h3>
                  <p className="text-gray-500 text-sm mb-4">Create your first blog post to share with the community!</p>
                  {!showFamilyForm && (
                    <button
                      onClick={() => setShowFamilyForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Intercession Department Homepage (existing dashboard without blog)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header for Intercession department users */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Intercession Department</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Prayer Ministry & Spiritual Warfare</p>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome, {user.fullName}</p>
                <p className="text-xs text-gray-600">
                  Intercession Department • {user.role === 'ADMIN' ? 'Administrator' : 'Member'}
                </p>
              </div>
              {user.role === 'ADMIN' && (
                <a
                  href="/admin"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </a>
              )}
              <button
                onClick={handleLogout}
                className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center text-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Welcome, {user.fullName}</p>
                  <p className="text-xs text-gray-600">
                    Intercession Department • {user.role === 'ADMIN' ? 'Administrator' : 'Member'}
                  </p>
                </div>
                {user.role === 'ADMIN' && (
                  <a
                    href="/admin"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm w-full justify-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center text-sm w-full justify-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Moderators & Birthdays */}
          <div className="space-y-6">
            {/* Prayer Moderators */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                Prayer Moderators
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900">Monday Prayer</h3>
                  {data?.mondayModerator ? (
                    <div>
                      <p className="text-sm text-gray-600">{data.mondayModerator.name}</p>
                      <p className="text-xs text-gray-500">
                        {data.mondayModerator.date} at {data.mondayModerator.time}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No moderator scheduled</p>
                  )}
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">Saturday Prayer</h3>
                  {data?.saturdayModerator ? (
                    <div>
                      <p className="text-sm text-gray-600">{data.saturdayModerator.name}</p>
                      <p className="text-xs text-gray-500">
                        {data.saturdayModerator.date} at {data.saturdayModerator.time}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No moderator scheduled</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <a
                  href="/schedule"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Full Schedule →
                </a>
              </div>
            </div>

            {/* Upcoming Birthdays */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                Upcoming Birthdays
              </h2>
              {data?.upcomingBirthdays && data.upcomingBirthdays.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingBirthdays.slice(0, 5).map((birthday, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{birthday.name}</span>
                      <span className="text-xs text-gray-500">{birthday.date}</span>
                    </div>
                  ))}
                  {data.upcomingBirthdays.length > 5 && (
                    <div className="mt-3">
                      <Link
                        href="/birthdays"
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        View All Birthdays →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming birthdays</p>
              )}
              <div className="mt-4">
                <Link
                  href="/birthdays"
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  View All Birthdays →
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Intercession Links</h2>
              <div className="space-y-2">
                <a
                  href="/prayer-teams"
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Prayer Teams
                </a>
                <a
                  href="/prayer-subjects"
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Prayer Subjects
                </a>
                <a
                  href="/news"
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  News & Events
                </a>
                <a
                  href="/"
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Public Homepage
                </a>
              </div>
            </div>
          </div>

          {/* Middle Column - Prayer Requests (NO FAMILY BOARD) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Prayer Request Button */}
            {!showForm && (
              <div className="text-center">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto text-sm sm:text-base"
                >
                  <HandHeart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Submit Prayer Request
                </button>
              </div>
            )}

            {/* Submit Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Submit a Prayer Request</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm sm:text-base"
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

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {submitting ? 'Submitting...' : 'Submit Prayer Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="w-full sm:w-auto border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Prayer Requests List */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HandHeart className="h-5 w-5 text-purple-600 mr-2" />
                Community Prayer Requests
              </h2>
              {prayerRequests.length > 0 ? (
                <div className="space-y-4">
                  {prayerRequests.map((request) => (
                    <div key={request.id} className="border-l-4 border-purple-500 pl-4 py-3">
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <h3 className="font-medium text-gray-900 break-words">{request.title}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                          {truncateContent(request.content)}
                        </p>
                        <p className="text-xs text-gray-500 break-words">
                          {request.isAnonymous ? 'Anonymous' : `By ${request.user?.fullName || 'Unknown'}`}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4">
                    <Link
                      href="/prayer-requests"
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      View All Prayer Requests →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <HandHeart className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No prayer requests yet. Be the first to share!</p>
                </div>
              )}
            </div>

            {/* Prayer Subjects - Only for authenticated users */}
            {data?.prayerSubjects && data.prayerSubjects.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 text-red-600 mr-2" />
                  Current Prayer Subjects
                </h2>
                <div className="space-y-3">
                  {data.prayerSubjects.slice(0, 3).map((subject) => (
                    <div key={subject.id} className="border-l-4 border-red-500 pl-4 py-2">
                      <h3 className="font-medium text-gray-900 break-words">{subject.title}</h3>
                      {subject.description && (
                        <p className="text-sm text-gray-600 mt-1 break-words whitespace-pre-wrap">
                          {truncateContent(subject.description)}
                        </p>
                      )}
                    </div>
                  ))}
                  {data.prayerSubjects.length > 3 && (
                    <div className="mt-3">
                      <Link
                        href="/prayer-subjects"
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        View All Prayer Subjects →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* News & Events - Only for authenticated users */}
            {data?.news && data.news.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Newspaper className="h-5 w-5 text-green-600 mr-2" />
                  Latest News & Events
                </h2>
                <div className="space-y-4">
                  {data.news.slice(0, 3).map((item) => (
                    <div key={item.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <h3 className="font-medium text-gray-900 break-words">{item.title}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {item.isEvent && item.eventDate 
                              ? new Date(item.eventDate).toLocaleDateString()
                              : new Date(item.createdAt).toLocaleDateString()
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">
                          {truncateContent(item.content)}
                        </p>
                        {item.isEvent && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
                            Event
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {data.news.length > 3 && (
                    <div className="mt-4">
                      <Link
                        href="/news"
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        View All News & Events →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
