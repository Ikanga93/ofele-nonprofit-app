'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Eye, Calendar, User, Plus, RotateCcw } from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  department: string
}

interface FamilyBoardPost {
  id: string
  title: string
  content: string
  imageUrl?: string
  views: number
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    role: string
  }
}

export default function BlogManagementPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<FamilyBoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

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

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/family-board')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      } else {
        setError('Failed to fetch blog posts')
      }
    } catch (error) {
      setError('An error occurred while fetching blog posts')
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? It will be moved to deleted posts where it can be restored.')) {
      return
    }

    setProcessingId(postId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/family-board', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId,
          action: 'delete'
        })
      })

      if (response.ok) {
        setSuccess('Post deleted successfully!')
        fetchPosts() // Refresh the list
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete post')
      }
    } catch (error) {
      setError('An error occurred while deleting the post')
    } finally {
      setProcessingId(null)
    }
  }

  // Helper function to truncate content
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    
    const truncated = content.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    const cutPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength
    
    return content.substring(0, cutPoint) + '...'
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

  // Check if user is Family department admin
  if (!user || user.department !== 'FAMILY' || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to be a Family Department administrator to access this page.</p>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Link
                  href="/family/admin"
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Blog Management</h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage family blog posts, view analytics, and moderate content
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/family/admin/deleted-posts"
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Deleted Posts
              </Link>
              <Link
                href="/"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Post
              </Link>
            </div>
          </div>
        </div>

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

        {/* Blog Posts */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-4">
                    {/* Post Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 break-words">{post.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {post.user.fullName}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            post.user.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {post.user.role}
                          </span>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views} view{post.views !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <div className="w-full">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                        {truncateContent(post.content)}
                      </p>
                      {post.content.length > 100 && (
                        <Link 
                          href={`/blog/${post.id}`}
                          className="text-xs text-blue-600 font-medium hover:text-blue-800 inline-block"
                        >
                          View full post →
                        </Link>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                      <Link
                        href={`/blog/${post.id}`}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Post
                      </Link>
                      <Link
                        href={`/family/admin/blog/edit/${post.id}`}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={processingId === post.id}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {processingId === post.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts</h3>
              <p className="text-gray-500 text-sm mb-4">
                No blog posts have been created yet. Create your first post to get started!
              </p>
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 