'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HandHeart, ArrowLeft, Send } from 'lucide-react'

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

export default function PrayerRequests() {
  const [requests, setRequests] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isAnonymous: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/prayer-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      } else if (response.status === 401) {
        // User not authenticated, show empty state
        setRequests([])
      }
    } catch (error) {
      console.error('Error fetching prayer requests:', error)
    } finally {
      setLoading(false)
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
        setFormData({ title: '', content: '', isAnonymous: false })
        setShowForm(false)
        fetchRequests() // Refresh the list
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
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prayer requests...</p>
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
                  Prayer Requests
                </h1>
                <p className="text-gray-600 mt-1">Submit and view community prayer requests</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </button>
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
                  Submit anonymously
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
          <h2 className="text-xl font-semibold text-gray-900">Community Prayer Requests</h2>
          
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{request.content}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {request.isAnonymous ? 'Anonymous' : `By ${request.user?.fullName || 'Unknown'}`}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                      Prayer Request
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HandHeart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prayer requests yet</h3>
              <p className="text-gray-600 mb-4">
                Prayer requests submitted by the community will appear here. You must be logged in to view them.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Submit First Request
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 