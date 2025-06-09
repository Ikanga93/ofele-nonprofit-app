'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  HandHeart, 
  Newspaper, 
  Plus,
  Settings,
  Clock,
  Send,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  role: string
}

interface Schedule {
  id: string
  date: string
  dayType: 'MONDAY' | 'SATURDAY'
  startTime: string
  endTime: string
  user: {
    id: string
    fullName: string
  }
}

interface AllUsers {
  id: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  // Form states
  const [prayerSubjectForm, setPrayerSubjectForm] = useState({ title: '', description: '' })
  const [newsForm, setNewsForm] = useState({ title: '', content: '', eventDate: '', isEvent: false })
  const [submitting, setSubmitting] = useState(false)

  // Schedule management states
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [allUsers, setAllUsers] = useState<AllUsers[]>([])
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    userId: '',
    date: '',
    dayType: 'MONDAY' as 'MONDAY' | 'SATURDAY',
    startTime: '',
    endTime: ''
  })
  const [showNewScheduleForm, setShowNewScheduleForm] = useState(false)
  const [newScheduleForm, setNewScheduleForm] = useState({
    userId: '',
    date: '',
    dayType: 'MONDAY' as 'MONDAY' | 'SATURDAY',
    startTime: '18:00',
    endTime: '19:00'
  })

  useEffect(() => {
    checkAdminAuth()
    if (activeTab === 'schedules' || activeTab === 'users') {
      fetchSchedules()
      fetchAllUsers()
    }
  }, [activeTab])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        if (userData.user.role !== 'ADMIN') {
          router.push('/')
          return
        }
        setUser(userData.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/moderator-schedule')
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/auth/users')
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const startEditingSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule.id)
    setEditForm({
      userId: schedule.user.id,
      date: schedule.date.split('T')[0],
      dayType: schedule.dayType,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    })
  }

  const cancelEditing = () => {
    setEditingSchedule(null)
    setEditForm({
      userId: '',
      date: '',
      dayType: 'MONDAY',
      startTime: '',
      endTime: ''
    })
  }

  const saveScheduleEdit = async (scheduleId: string) => {
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/moderator-schedule/${scheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Schedule updated successfully!')
        setEditingSchedule(null)
        fetchSchedules()
      } else {
        setError(data.error || 'Failed to update schedule')
      }
    } catch (error) {
      setError('An error occurred while updating schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/moderator-schedule/${scheduleId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Schedule deleted successfully!')
        fetchSchedules()
      } else {
        setError(data.error || 'Failed to delete schedule')
      }
    } catch (error) {
      setError('An error occurred while deleting schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const createNewSchedule = async () => {
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/moderator-schedule/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScheduleForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Schedule created successfully!')
        setShowNewScheduleForm(false)
        setNewScheduleForm({
          userId: '',
          date: '',
          dayType: 'MONDAY',
          startTime: '18:00',
          endTime: '19:00'
        })
        fetchSchedules()
      } else {
        setError(data.error || 'Failed to create schedule')
      }
    } catch (error) {
      setError('An error occurred while creating schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const ScheduleManagement = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Schedules</h3>
        <button
          onClick={() => setShowNewScheduleForm(!showNewScheduleForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </button>
      </div>

      {/* New Schedule Form */}
      {showNewScheduleForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Create New Schedule</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={newScheduleForm.userId}
                onChange={(e) => setNewScheduleForm({...newScheduleForm, userId: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Moderator</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>
              <input
                type="date"
                value={newScheduleForm.date}
                onChange={(e) => setNewScheduleForm({...newScheduleForm, date: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={newScheduleForm.dayType}
                onChange={(e) => setNewScheduleForm({...newScheduleForm, dayType: e.target.value as 'MONDAY' | 'SATURDAY'})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MONDAY">Monday</option>
                <option value="SATURDAY">Saturday</option>
              </select>
              <div className="flex space-x-2">
                <input
                  type="time"
                  value={newScheduleForm.startTime}
                  onChange={(e) => setNewScheduleForm({...newScheduleForm, startTime: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="time"
                  value={newScheduleForm.endTime}
                  onChange={(e) => setNewScheduleForm({...newScheduleForm, endTime: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={createNewSchedule}
                disabled={submitting || !newScheduleForm.userId || !newScheduleForm.date}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center text-sm"
              >
                <Save className="h-4 w-4 mr-1" />
                Create Schedule
              </button>
              <button
                onClick={() => {
                  setShowNewScheduleForm(false)
                  setNewScheduleForm({
                    userId: '',
                    date: '',
                    dayType: 'MONDAY',
                    startTime: '18:00',
                    endTime: '19:00'
                  })
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center text-sm"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {schedules.length > 0 ? (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className={`p-4 border rounded-lg ${
              schedule.dayType === 'MONDAY' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'
            }`}>
              {editingSchedule === schedule.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                      value={editForm.userId}
                      onChange={(e) => setEditForm({...editForm, userId: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Moderator</option>
                      {allUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.fullName}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      value={editForm.dayType}
                      onChange={(e) => setEditForm({...editForm, dayType: e.target.value as 'MONDAY' | 'SATURDAY'})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MONDAY">Monday</option>
                      <option value="SATURDAY">Saturday</option>
                    </select>
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        value={editForm.startTime}
                        onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="time"
                        value={editForm.endTime}
                        onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => saveScheduleEdit(schedule.id)}
                      disabled={submitting}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center text-sm"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 flex items-center text-sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{schedule.user.fullName}</h4>
                    <p className="text-gray-600 text-sm">{formatDate(schedule.date)}</p>
                    <p className="text-gray-600 text-sm">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} ({schedule.dayType})
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditingSchedule(schedule)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit schedule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No schedules found. Generate some schedules to get started.</p>
      )}
    </div>
  )

  const generatePrayerTeams = async () => {
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/prayer-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Successfully created ${data.count} prayer teams for this week!`)
      } else {
        setError(data.error || 'Failed to generate prayer teams')
      }
    } catch (error) {
      setError('An error occurred while generating prayer teams')
    } finally {
      setSubmitting(false)
    }
  }

  const generateModeratorSchedule = async () => {
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/moderator-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeksToGenerate: 4 })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Successfully created ${data.count} moderator schedules for the next 4 weeks!`)
      } else {
        setError(data.error || 'Failed to generate moderator schedule')
      }
    } catch (error) {
      setError('An error occurred while generating moderator schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const cleanupDuplicateSchedules = async () => {
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/moderator-schedule/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Successfully cleaned up ${data.deletedCount} duplicate schedules!`)
      } else {
        setError(data.error || 'Failed to cleanup duplicate schedules')
      }
    } catch (error) {
      setError('An error occurred while cleaning up duplicate schedules')
    } finally {
      setSubmitting(false)
    }
  }

  const createPrayerSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/prayer-subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prayerSubjectForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Prayer subject created successfully!')
        setPrayerSubjectForm({ title: '', description: '' })
      } else {
        setError(data.error || 'Failed to create prayer subject')
      }
    } catch (error) {
      setError('An error occurred while creating prayer subject')
    } finally {
      setSubmitting(false)
    }
  }

  const createNews = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`${newsForm.isEvent ? 'Event' : 'News'} created successfully!`)
        setNewsForm({ title: '', content: '', eventDate: '', isEvent: false })
      } else {
        setError(data.error || 'Failed to create news/event')
      }
    } catch (error) {
      setError('An error occurred while creating news/event')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-6 w-6 text-green-600 mr-2" />
                  Admin Panel
                </h1>
                <p className="text-gray-600 mt-1">Manage Stone Creek Intercession</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Welcome, {user?.fullName}</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Settings },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'schedules', name: 'Schedules', icon: Calendar },
              { id: 'prayer-subjects', name: 'Prayer Subjects', icon: HandHeart },
              { id: 'news', name: 'News & Events', icon: Newspaper }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Admin Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Prayer Teams</p>
                      <p className="text-2xl font-bold text-blue-900">Weekly</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Schedules</p>
                      <p className="text-2xl font-bold text-green-900">Mon/Sat</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <HandHeart className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Prayer Subjects</p>
                      <p className="text-2xl font-bold text-purple-900">Active</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Newspaper className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">News & Events</p>
                      <p className="text-2xl font-bold text-orange-900">Latest</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={generatePrayerTeams}
                    disabled={submitting}
                    className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Generate Prayer Teams
                  </button>
                  <button
                    onClick={generateModeratorSchedule}
                    disabled={submitting}
                    className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Generate Schedules
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prayer Teams Tab */}
          {activeTab === 'prayer-teams' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Prayer Teams Management</h2>
                <button
                  onClick={generatePrayerTeams}
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Teams
                </button>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">About Prayer Teams</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Prayer teams are automatically generated weekly, pairing community members to pray for each other. 
                  Each week, new random pairs are created to ensure everyone gets to pray with different people.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Teams change every week</p>
                  <p>• All members (including admins) are included</p>
                  <p>• Random pairing ensures variety</p>
                  <p>• If odd number of users, one team will have 3 members</p>
                </div>
              </div>
            </div>
          )}

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Moderator Schedules</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={cleanupDuplicateSchedules}
                    disabled={submitting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Clean Duplicates
                  </button>
                  <button
                    onClick={generateModeratorSchedule}
                    disabled={submitting}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Schedules
                  </button>
                </div>
              </div>
              
              {/* Schedule Management Section */}
              <ScheduleManagement />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="font-medium text-blue-900">Monday Prayer Sessions</h3>
                  </div>
                  <p className="text-blue-800 text-sm mb-2">Time: 6:00 PM - 7:00 PM</p>
                  <p className="text-blue-700 text-sm">
                    Weekly prayer sessions moderated by rotating community members
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="font-medium text-green-900">Saturday Prayer Sessions</h3>
                  </div>
                  <p className="text-green-800 text-sm mb-2">Time: 4:30 PM - 6:00 PM</p>
                  <p className="text-green-700 text-sm">
                    Weekend prayer sessions with extended time for fellowship
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Prayer Subjects Tab */}
          {activeTab === 'prayer-subjects' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Prayer Subjects Management</h2>
              <form onSubmit={createPrayerSubject} className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-900">Create New Prayer Subject</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={prayerSubjectForm.title}
                    onChange={(e) => setPrayerSubjectForm({...prayerSubjectForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    placeholder="Prayer subject title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={prayerSubjectForm.description}
                    onChange={(e) => setPrayerSubjectForm({...prayerSubjectForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    placeholder="Additional details about this prayer subject"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Prayer Subject'}
                </button>
              </form>
            </div>
          )}

          {/* News & Events Tab */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">News & Events Management</h2>
              <form onSubmit={createNews} className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-900">Create News or Event</h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newsForm.isEvent}
                      onChange={(e) => setNewsForm({...newsForm, isEvent: e.target.checked})}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">This is an event</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder={newsForm.isEvent ? "Event title" : "News title"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    rows={4}
                    required
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder={newsForm.isEvent ? "Event description and details" : "News content"}
                  />
                </div>
                {newsForm.isEvent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                    <input
                      type="date"
                      value={newsForm.eventDate}
                      onChange={(e) => setNewsForm({...newsForm, eventDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Publishing...' : `Publish ${newsForm.isEvent ? 'Event' : 'News'}`}
                </button>
              </form>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Users</h3>
                {allUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allUsers.map((user: any) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.fullName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'ADMIN' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No users found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 