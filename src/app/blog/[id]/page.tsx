'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, User, Eye } from 'lucide-react'

interface BlogPost {
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

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/family-board/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      } else {
        setError('Post not found')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Blog Post</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Homepage
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Community Blog</h1>
              <p className="text-gray-600 text-sm">Stone Creek Departments</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Post Header */}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 break-words">
              {post.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center flex-wrap gap-2">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{post.user.fullName}</span>
                <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                  post.user.role === 'ADMIN' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {post.user.role}
                </span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{post.views} view{post.views !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="w-full">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="p-6 sm:p-8">
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                {post.content}
              </div>
            </div>
          </div>

          {/* Post Footer */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                <span>Posted by Family Department</span>
              </div>
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
} 