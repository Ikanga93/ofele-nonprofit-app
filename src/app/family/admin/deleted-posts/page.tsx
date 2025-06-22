'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, Trash2, Calendar, User } from 'lucide-react'

interface FamilyBoardPost {
  id: string
  title: string
  content: string
  imageUrl?: string
  views: number
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  user: {
    fullName: string
    role: string
  }
}

export default function DeletedPostsPage() {
  const [deletedPosts, setDeletedPosts] = useState<FamilyBoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchDeletedPosts()
  }, [])

  const fetchDeletedPosts = async () => {
    try {
      const response = await fetch('/api/family-board/deleted')
      if (response.ok) {
        const data = await response.json()
        setDeletedPosts(data.posts)
      } else if (response.status === 403) {
        setError('Access denied. Only Family department admins can view deleted posts.')
      } else {
        setError('Failed to fetch deleted posts')
      }
    } catch (error) {
      setError('An error occurred while fetching deleted posts')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (postId: string) => {
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
          action: 'restore'
        })
      })

      if (response.ok) {
        setSuccess('Post restored successfully!')
        fetchDeletedPosts() // Refresh the list
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to restore post')
      }
    } catch (error) {
      setError('An error occurred while restoring the post')
    } finally {
      setProcessingId(null)
    }
  }

  const handlePermanentDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      return
    }

    setProcessingId(postId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/family-board/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Post permanently deleted!')
        fetchDeletedPosts() // Refresh the list
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to permanently delete post')
      }
    } catch (error) {
      setError('An error occurred while deleting the post')
    } finally {
      setProcessingId(null)
    }
  }

  // Helper function to truncate content
  const truncateContent = (content: string, maxLength: number = 150) => {
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
          <p className="text-gray-600">Loading deleted posts...</p>
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Deleted Blog Posts</h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage deleted blog posts - restore or permanently delete them
              </p>
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

        {/* Deleted Posts */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {deletedPosts.length > 0 ? (
            <div className="space-y-6">
              {deletedPosts.map((post) => (
                <div key={post.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
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
                            Deleted: {post.deletedAt ? new Date(post.deletedAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {post.views} view{post.views !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <div className="w-full">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-md opacity-75"
                        />
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 break-words whitespace-pre-wrap opacity-75">
                        {truncateContent(post.content)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-red-200">
                      <button
                        onClick={() => handleRestore(post.id)}
                        disabled={processingId === post.id}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {processingId === post.id ? 'Restoring...' : 'Restore'}
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(post.id)}
                        disabled={processingId === post.id}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {processingId === post.id ? 'Deleting...' : 'Delete Permanently'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Deleted Posts</h3>
              <p className="text-gray-500 text-sm">
                No blog posts have been deleted yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 