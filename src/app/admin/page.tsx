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
  X,
  Heart
} from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  department: string
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
  department: string
  createdAt: string
}

interface PrayerTeam {
  id: string
  weekStart: string
  weekEnd: string
  member1: {
    id: string
    fullName: string
  }
  member2: {
    id: string
    fullName: string
  }
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

  // Overview data states
  const [overviewData, setOverviewData] = useState({
    totalUsers: 0,
    activeSchedules: 0,
    activePrayerSubjects: 0,
    totalNews: 0,
    currentWeekTeams: 0
  })

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

  // Prayer teams management states
  const [prayerTeams, setPrayerTeams] = useState<PrayerTeam[]>([])
  const [editingTeam, setEditingTeam] = useState<string | null>(null)
  const [teamEditForm, setTeamEditForm] = useState({
    member1Id: '',
    member2Id: '',
    weekStart: '',
    weekEnd: ''
  })
  const [showNewTeamForm, setShowNewTeamForm] = useState(false)
  const [newTeamForm, setNewTeamForm] = useState({
    member1Id: '',
    member2Id: '',
    weekStart: '',
    weekEnd: ''
  })

  // Prayer team generation states
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [generateForm, setGenerateForm] = useState({
    weekStart: '',
    weekEnd: '',
    replaceExisting: false
  })

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewData()
    }
    if (activeTab === 'schedules' || activeTab === 'users') {
      fetchSchedules()
      fetchAllUsers()
    }
    if (activeTab === 'prayer-teams') {
      fetchPrayerTeams()
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

  const fetchPrayerTeams = async () => {
    try {
      const response = await fetch('/api/prayer-teams?all=true')
      if (response.ok) {
        const data = await response.json()
        setPrayerTeams(data.teams)
      }
    } catch (error) {
      console.error('Error fetching prayer teams:', error)
    }
  }

  const fetchOverviewData = async () => {
    try {
      // Fetch users count
      const usersResponse = await fetch('/api/auth/users')
      const usersData = usersResponse.ok ? await usersResponse.json() : { users: [] }

      // Fetch schedules count
      const schedulesResponse = await fetch('/api/moderator-schedule')
      const schedulesData = schedulesResponse.ok ? await schedulesResponse.json() : { schedules: [] }

      // Fetch prayer subjects count
      const prayerSubjectsResponse = await fetch('/api/prayer-subjects')
      const prayerSubjectsData = prayerSubjectsResponse.ok ? await prayerSubjectsResponse.json() : { prayerSubjects: [] }

      // Fetch news count
      const newsResponse = await fetch('/api/news')
      const newsData = newsResponse.ok ? await newsResponse.json() : { news: [] }

      // Fetch current week prayer teams
      const teamsResponse = await fetch('/api/prayer-teams')
      const teamsData = teamsResponse.ok ? await teamsResponse.json() : { teams: [] }

      setOverviewData({
        totalUsers: usersData.users?.length || 0,
        activeSchedules: schedulesData.schedules?.length || 0,
        activePrayerSubjects: prayerSubjectsData.prayerSubjects?.filter((p: any) => p.isActive)?.length || 0,
        totalNews: newsData.news?.length || 0,
        currentWeekTeams: teamsData.teams?.length || 0
      })
    } catch (error) {
      console.error('Error fetching overview data:', error)
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
        await fetchSchedules()
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
        await fetchSchedules()
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
        await fetchSchedules()
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
    // For dates stored as UTC strings, we need to extract the original date parts
    // to avoid timezone conversion issues
    const parts = dateString.split('T')[0].split('-')
    const year = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1 // JavaScript months are 0-indexed
    const day = parseInt(parts[2])
    
    // Create a new local date with the extracted parts
    const localDate = new Date(year, month, day)
    
    return localDate.toLocaleDateString('en-US', {
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

  const formatWeekRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return `${start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`
  }

  const ScheduleManagement = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Current Schedules</h3>
        <button
          onClick={() => setShowNewScheduleForm(!showNewScheduleForm)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm justify-center"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Add Schedule
        </button>
      </div>

      {/* New Schedule Form */}
      {showNewScheduleForm && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Create New Schedule</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={newScheduleForm.userId}
                onChange={(e) => setNewScheduleForm({...newScheduleForm, userId: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <select
                value={newScheduleForm.dayType}
                onChange={(e) => setNewScheduleForm({...newScheduleForm, dayType: e.target.value as 'MONDAY' | 'SATURDAY'})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="MONDAY">Monday</option>
                <option value="SATURDAY">Saturday</option>
              </select>
              <div className="flex space-x-2">
                <input
                  type="time"
                  value={newScheduleForm.startTime}
                  onChange={(e) => setNewScheduleForm({...newScheduleForm, startTime: e.target.value})}
                  className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm flex-1"
                />
                <input
                  type="time"
                  value={newScheduleForm.endTime}
                  onChange={(e) => setNewScheduleForm({...newScheduleForm, endTime: e.target.value})}
                  className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm flex-1"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={createNewSchedule}
                disabled={submitting || !newScheduleForm.userId || !newScheduleForm.date}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center text-sm justify-center"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
                className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-700 flex items-center text-sm justify-center"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {schedules.length > 0 ? (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className={`p-3 sm:p-4 border rounded-lg ${
              schedule.dayType === 'MONDAY' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'
            }`}>
              {editingSchedule === schedule.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select
                      value={editForm.userId}
                      onChange={(e) => setEditForm({...editForm, userId: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <select
                      value={editForm.dayType}
                      onChange={(e) => setEditForm({...editForm, dayType: e.target.value as 'MONDAY' | 'SATURDAY'})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="MONDAY">Monday</option>
                      <option value="SATURDAY">Saturday</option>
                    </select>
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        value={editForm.startTime}
                        onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                        className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm flex-1"
                      />
                      <input
                        type="time"
                        value={editForm.endTime}
                        onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                        className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => saveScheduleEdit(schedule.id)}
                      disabled={submitting}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center text-sm justify-center"
                    >
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 flex items-center text-sm justify-center"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{schedule.user.fullName}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{formatDate(schedule.date)}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} ({schedule.dayType})
                    </p>
                  </div>
                  <div className="flex space-x-2 self-end sm:self-center">
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
        <p className="text-gray-500 text-center py-4 text-sm">No schedules found. Generate some schedules to get started.</p>
      )}
    </div>
  )

  const PrayerTeamManagement = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Current Prayer Teams</h3>
        <button
          onClick={() => setShowNewTeamForm(!showNewTeamForm)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm justify-center"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Add Team
        </button>
      </div>

      {/* New Team Form */}
      {showNewTeamForm && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Create New Prayer Team</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={newTeamForm.member1Id}
                onChange={(e) => setNewTeamForm({...newTeamForm, member1Id: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Member 1</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>
              <select
                value={newTeamForm.member2Id}
                onChange={(e) => setNewTeamForm({...newTeamForm, member2Id: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Member 2</option>
                {allUsers.filter(user => user.id !== newTeamForm.member1Id).map(user => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>
              <input
                type="date"
                value={newTeamForm.weekStart}
                onChange={(e) => setNewTeamForm({...newTeamForm, weekStart: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Week Start"
              />
              <input
                type="date"
                value={newTeamForm.weekEnd}
                onChange={(e) => setNewTeamForm({...newTeamForm, weekEnd: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Week End"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={createNewTeam}
                disabled={submitting || !newTeamForm.member1Id || !newTeamForm.member2Id || !newTeamForm.weekStart || !newTeamForm.weekEnd}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center text-sm justify-center"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Create Team
              </button>
              <button
                onClick={() => {
                  setShowNewTeamForm(false)
                  setNewTeamForm({
                    member1Id: '',
                    member2Id: '',
                    weekStart: '',
                    weekEnd: ''
                  })
                }}
                className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-700 flex items-center text-sm justify-center"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {prayerTeams.length > 0 ? (
        <div className="space-y-3">
          {prayerTeams.map((team) => (
            <div key={team.id} className="p-3 sm:p-4 border rounded-lg bg-blue-50 border-blue-200">
              {editingTeam === team.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select
                      value={teamEditForm.member1Id}
                      onChange={(e) => setTeamEditForm({...teamEditForm, member1Id: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Member 1</option>
                      {allUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.fullName}</option>
                      ))}
                    </select>
                    <select
                      value={teamEditForm.member2Id}
                      onChange={(e) => setTeamEditForm({...teamEditForm, member2Id: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Member 2</option>
                      {allUsers.filter(user => user.id !== teamEditForm.member1Id).map(user => (
                        <option key={user.id} value={user.id}>{user.fullName}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={teamEditForm.weekStart}
                      onChange={(e) => setTeamEditForm({...teamEditForm, weekStart: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="date"
                      value={teamEditForm.weekEnd}
                      onChange={(e) => setTeamEditForm({...teamEditForm, weekEnd: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => saveTeamEdit(team.id)}
                      disabled={submitting}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center text-sm justify-center"
                    >
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={cancelTeamEditing}
                      className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 flex items-center text-sm justify-center"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      {team.member1.fullName} & {team.member2.fullName}
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{formatWeekRange(team.weekStart, team.weekEnd)}</p>
                  </div>
                  <div className="flex space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => startEditingTeam(team)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit team"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete team"
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
        <p className="text-gray-500 text-center py-4 text-sm">No prayer teams found. Create some teams to get started.</p>
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replaceExisting: true })
      })

      const data = await response.json()

      if (response.ok) {
        const actionText = data.action === 'replaced' ? 'replaced' : 'created'
        setMessage(`Successfully ${actionText} ${data.count} prayer teams for this week!`)
        await fetchOverviewData()
        await fetchPrayerTeams()
      } else {
        setError(data.error || 'Failed to generate prayer teams')
      }
    } catch (error) {
      setError('An error occurred while generating prayer teams')
    } finally {
      setSubmitting(false)
    }
  }

  const generateCustomPrayerTeams = async () => {
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const requestBody: any = {
        replaceExisting: generateForm.replaceExisting
      }

      if (generateForm.weekStart && generateForm.weekEnd) {
        requestBody.weekStart = generateForm.weekStart
        requestBody.weekEnd = generateForm.weekEnd
      }

      const response = await fetch('/api/prayer-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok) {
        const weekText = generateForm.weekStart && generateForm.weekEnd 
          ? `for ${formatWeekRange(generateForm.weekStart, generateForm.weekEnd)}`
          : 'for this week'
        setMessage(`Successfully ${data.action} ${data.count} prayer teams ${weekText}!`)
        setShowGenerateForm(false)
        setGenerateForm({
          weekStart: '',
          weekEnd: '',
          replaceExisting: false
        })
        await fetchOverviewData()
        await fetchPrayerTeams()
      } else {
        setError(data.error || 'Failed to generate prayer teams')
      }
    } catch (error) {
      setError('An error occurred while generating prayer teams')
    } finally {
      setSubmitting(false)
    }
  }

  const clearPrayerTeams = async () => {
    const weekText = 'for this week'
    
    if (!confirm(`Are you sure you want to clear all prayer teams ${weekText}?`)) return

    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/prayer-teams/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Successfully cleared ${data.count} prayer teams ${weekText}!`)
        await fetchOverviewData()
        await fetchPrayerTeams()
      } else {
        setError(data.error || 'Failed to clear prayer teams')
      }
    } catch (error) {
      setError('An error occurred while clearing prayer teams')
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
        await fetchOverviewData()
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
        await fetchOverviewData()
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
        await fetchOverviewData()
      } else {
        setError(data.error || 'Failed to create news/event')
      }
    } catch (error) {
      setError('An error occurred while creating news/event')
    } finally {
      setSubmitting(false)
    }
  }

  // Prayer team management functions
  const startEditingTeam = (team: PrayerTeam) => {
    setEditingTeam(team.id)
    setTeamEditForm({
      member1Id: team.member1.id,
      member2Id: team.member2.id,
      weekStart: team.weekStart.split('T')[0],
      weekEnd: team.weekEnd.split('T')[0]
    })
  }

  const cancelTeamEditing = () => {
    setEditingTeam(null)
    setTeamEditForm({
      member1Id: '',
      member2Id: '',
      weekStart: '',
      weekEnd: ''
    })
  }

  const saveTeamEdit = async (teamId: string) => {
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/prayer-teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamEditForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Prayer team updated successfully!')
        setEditingTeam(null)
        await fetchPrayerTeams()
        await fetchOverviewData()
      } else {
        setError(data.error || 'Failed to update prayer team')
      }
    } catch (error) {
      setError('An error occurred while updating prayer team')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this prayer team?')) return

    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/prayer-teams/${teamId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Prayer team deleted successfully!')
        await fetchPrayerTeams()
        await fetchOverviewData()
      } else {
        setError(data.error || 'Failed to delete prayer team')
      }
    } catch (error) {
      setError('An error occurred while deleting prayer team')
    } finally {
      setSubmitting(false)
    }
  }

  const createNewTeam = async () => {
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/prayer-teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeamForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Prayer team created successfully!')
        setShowNewTeamForm(false)
        setNewTeamForm({
          member1Id: '',
          member2Id: '',
          weekStart: '',
          weekEnd: ''
        })
        await fetchPrayerTeams()
        await fetchOverviewData()
      } else {
        setError(data.error || 'Failed to create prayer team')
      }
    } catch (error) {
      setError('An error occurred while creating prayer team')
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <Link href="/" className="mr-3 sm:mr-4 text-gray-600 hover:text-gray-900 flex-shrink-0">
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2 flex-shrink-0" />
                  <span className="truncate">Admin Panel</span>
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage Stone Creek Departments</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Welcome, {user?.fullName}</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Messages */}
        {message && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-4 sm:mb-6">
          <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', icon: Settings },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'prayer-teams', name: 'Prayer Teams', icon: HandHeart },
              { id: 'schedules', name: 'Schedules', icon: Calendar },
              { id: 'prayer-subjects', name: 'Prayer Subjects', icon: Heart },
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
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Admin Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <button
                  onClick={() => setActiveTab('users')}
                  className="bg-blue-50 p-3 sm:p-6 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2 sm:mb-0" />
                    <div className="sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-blue-600">Total Users</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-900">{overviewData.totalUsers}</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('schedules')}
                  className="bg-green-50 p-3 sm:p-6 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-2 sm:mb-0" />
                    <div className="sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-green-600">Active Schedules</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-900">{overviewData.activeSchedules}</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('prayer-subjects')}
                  className="bg-purple-50 p-3 sm:p-6 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2 sm:mb-0" />
                    <div className="sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-purple-600">Active Prayer Subjects</p>
                      <p className="text-lg sm:text-2xl font-bold text-purple-900">{overviewData.activePrayerSubjects}</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('news')}
                  className="bg-orange-50 p-3 sm:p-6 rounded-lg hover:bg-orange-100 transition-colors text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <Newspaper className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mb-2 sm:mb-0" />
                    <div className="sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-orange-600">Total News & Events</p>
                      <p className="text-lg sm:text-2xl font-bold text-orange-900">{overviewData.totalNews}</p>
                    </div>
                  </div>
                </button>
              </div>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setActiveTab('prayer-teams')}
                    className="flex items-center justify-center p-3 sm:p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    <HandHeart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Manage Prayer Teams
                  </button>
                  <button
                    onClick={generateModeratorSchedule}
                    disabled={submitting}
                    className="flex items-center justify-center p-3 sm:p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Generate Schedules
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prayer Teams Tab */}
          {activeTab === 'prayer-teams' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Prayer Teams Management</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => clearPrayerTeams()}
                    disabled={submitting}
                    className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center text-sm"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Clear This Week
                  </button>
                  <button
                    onClick={() => setShowGenerateForm(!showGenerateForm)}
                    className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Advanced Generate
                  </button>
                  <button
                    onClick={generatePrayerTeams}
                    disabled={submitting}
                    className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Generate Teams
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Total Teams</p>
                      <p className="text-lg font-bold text-blue-700">{prayerTeams.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Current Week</p>
                      <p className="text-lg font-bold text-green-700">{overviewData.currentWeekTeams}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Total Users</p>
                      <p className="text-lg font-bold text-purple-700">{overviewData.totalUsers}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Generate Form */}
              {showGenerateForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                  <h3 className="font-medium text-green-900 mb-4 text-sm sm:text-base">Advanced Prayer Team Generation</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Week Start (Optional)</label>
                        <input
                          type="date"
                          value={generateForm.weekStart}
                          onChange={(e) => setGenerateForm({...generateForm, weekStart: e.target.value})}
                          className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                        <p className="text-xs text-green-600 mt-1">Leave empty for current week</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Week End (Optional)</label>
                        <input
                          type="date"
                          value={generateForm.weekEnd}
                          onChange={(e) => setGenerateForm({...generateForm, weekEnd: e.target.value})}
                          className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                        <p className="text-xs text-green-600 mt-1">Leave empty for current week</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="replaceExisting"
                        checked={generateForm.replaceExisting}
                        onChange={(e) => setGenerateForm({...generateForm, replaceExisting: e.target.checked})}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
                      />
                      <label htmlFor="replaceExisting" className="ml-2 text-sm text-green-700">
                        Replace existing teams for this week
                      </label>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={generateCustomPrayerTeams}
                        disabled={submitting}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center text-sm"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        {submitting ? 'Generating...' : 'Generate Teams'}
                      </button>
                      <button
                        onClick={() => {
                          setShowGenerateForm(false)
                          setGenerateForm({
                            weekStart: '',
                            weekEnd: '',
                            replaceExisting: false
                          })
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center text-sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Prayer Team Management Section */}
              <PrayerTeamManagement />
              
              {/* Help Section */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">Prayer Team Management Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Plus className="h-4 mr-1 text-blue-600" />
                      Generate Teams
                    </h4>
                    <p>• Automatically replaces existing teams</p>
                    <p>• Generates for current week</p>
                    <p>• Random pairing of all users</p>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Settings className="h-4 mr-1 text-green-600" />
                      Advanced Generate
                    </h4>
                    <p>• Choose specific week dates</p>
                    <p>• Control replace behavior</p>
                    <p>• Generate for future weeks</p>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Edit className="h-4 mr-1 text-purple-600" />
                      Manual Management
                    </h4>
                    <p>• Create custom teams individually</p>
                    <p>• Edit existing team assignments</p>
                    <p>• Delete specific teams</p>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Trash2 className="h-4 mr-1 text-red-600" />
                      Clear Teams
                    </h4>
                    <p>• Remove all teams for current week</p>
                    <p>• Confirmation required</p>
                    <p>• Useful before regenerating</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Moderator Schedules</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={cleanupDuplicateSchedules}
                    disabled={submitting}
                    className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center text-sm"
                  >
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Clean Duplicates
                  </button>
                  <button
                    onClick={generateModeratorSchedule}
                    disabled={submitting}
                    className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Generate Schedules
                  </button>
                </div>
              </div>
              
              {/* Schedule Management Section */}
              <ScheduleManagement />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                    <h3 className="font-medium text-blue-900 text-sm sm:text-base">Monday Prayer Sessions</h3>
                  </div>
                  <p className="text-blue-800 text-xs sm:text-sm mb-2">Time: 6:00 PM - 7:00 PM</p>
                  <p className="text-blue-700 text-xs sm:text-sm">
                    Weekly prayer sessions moderated by rotating community members
                  </p>
                </div>
                <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                    <h3 className="font-medium text-green-900 text-sm sm:text-base">Saturday Prayer Sessions</h3>
                  </div>
                  <p className="text-green-800 text-xs sm:text-sm mb-2">Time: 4:30 PM - 6:00 PM</p>
                  <p className="text-green-700 text-xs sm:text-sm">
                    Weekend prayer sessions with extended time for fellowship
                  </p>
                </div>
              </div>

              {/* Prayer Teams Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                    <h3 className="text-base sm:text-lg font-medium text-blue-900">Current Week Prayer Teams</h3>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {overviewData.currentWeekTeams} Teams
                  </span>
                </div>
                <p className="text-blue-700 text-sm">
                  Prayer teams are automatically generated weekly, pairing community members to pray for each other.
                  {overviewData.currentWeekTeams === 0 && " Generate new teams to get started."}
                </p>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setActiveTab('prayer-teams')}
                    className="flex items-center justify-center p-3 sm:p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    <HandHeart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Manage Prayer Teams
                  </button>
                  <button
                    onClick={generateModeratorSchedule}
                    disabled={submitting}
                    className="flex items-center justify-center p-3 sm:p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Generate Schedules
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prayer Subjects Tab */}
          {activeTab === 'prayer-subjects' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Prayer Subjects Management</h2>
              <form onSubmit={createPrayerSubject} className="bg-gray-50 p-4 sm:p-6 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Create New Prayer Subject</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={prayerSubjectForm.title}
                    onChange={(e) => setPrayerSubjectForm({...prayerSubjectForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
                    placeholder="Prayer subject title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={prayerSubjectForm.description}
                    onChange={(e) => setPrayerSubjectForm({...prayerSubjectForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
                    placeholder="Additional details about this prayer subject"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Creating...' : 'Create Prayer Subject'}
                </button>
              </form>
            </div>
          )}

          {/* News & Events Tab */}
          {activeTab === 'news' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">News & Events Management</h2>
              <form onSubmit={createNews} className="bg-gray-50 p-4 sm:p-6 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Create News or Event</h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center text-sm"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  {submitting ? 'Publishing...' : `Publish ${newsForm.isEvent ? 'Event' : 'News'}`}
                </button>
              </form>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Management</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">All Users</h3>
                {allUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Email
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Department
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allUsers.map((user: any) => (
                          <tr key={user.id}>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user.fullName}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {user.email}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                              {user.email}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'ADMIN' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {user.department}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">No users found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 