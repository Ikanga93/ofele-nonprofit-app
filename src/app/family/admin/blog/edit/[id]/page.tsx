'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'

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
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    role: string
  }
}

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, setUser] = useState<User | null>(null)
  const [post, setPost] = useState<FamilyBoardPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [postId, setPostId] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    checkAuthStatus()
    // Get the post ID from params
    params.then(({ id }) => setPostId(id))
  }, [])

  useEffect(() => {
    if (user && postId) {
      fetchPost()
    }
  }, [user, postId])

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

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/family-board/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        setFormData({
          title: data.post.title,
          content: data.post.content,
          imageUrl: data.post.imageUrl || ''
        })
        if (data.post.imageUrl) {
          setImagePreview(data.post.imageUrl)
        }
      } else {
        setError('Failed to fetch blog post')
      }
    } catch (error) {
      setError('An error occurred while fetching the blog post')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      setError('')
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return formData.imageUrl || null

    setUploadingImage(true)
    const uploadFormData = new FormData()
    uploadFormData.append('file', selectedFile)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to upload image')
        return null
      }
    } catch (error) {
      setError('Error uploading image')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Upload image if a new one was selected
      let imageUrl = formData.imageUrl
      if (selectedFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          setSubmitting(false)
          return // Error already set by uploadImage
        }
      }

      const response = await fetch(`/api/family-board/${postId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          imageUrl
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Blog post updated successfully!')
        // Redirect to blog management after a short delay
        setTimeout(() => {
          window.location.href = '/family/admin/blog'
        }, 2000)
      } else {
        setError(data.error || 'Failed to update blog post')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }))
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're trying to edit could not be found.</p>
          <Link 
            href="/family/admin/blog"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blog Management
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center mb-2">
            <Link
              href="/family/admin/blog"
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Blog Post</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Update your blog post content and settings
          </p>
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

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter blog post title"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={12}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Write your blog post content here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              
              {imagePreview ? (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-w-md h-48 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click the X to remove the image</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">No image selected</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select an image file (max 5MB). Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {submitting ? 'Updating...' : uploadingImage ? 'Uploading Image...' : 'Update Post'}
              </button>
              <Link
                href="/family/admin/blog"
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 