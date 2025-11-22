'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, Mail, Video, LogOut } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface Booking {
  id: string
  studentName: string
  studentEmail: string
  date: string
  time: string
  status: string
  meetLink?: string
}

interface Mentor {
  id: string
  name: string
  email: string
  bio: string
  expertise: string[]
  googleCalendarConnected?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connectingGoogle, setConnectingGoogle] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('mentorToken')
    if (!token) {
      router.push('/mentors/login')
      return
    }

    fetchMentorData(token)
  }, [router])

  const fetchMentorData = async (token: string) => {
    try {
      const response = await fetch('/api/mentors/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch mentor data')
      }

      const data = await response.json()
      setMentor(data.mentor)
      setBookings(data.bookings || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('mentorToken')
    router.push('/mentors/login')
  }

  const handleConnectGoogle = async () => {
    if (!mentor) return
    
    setConnectingGoogle(true)
    try {
      const token = localStorage.getItem('mentorToken')
      const response = await fetch(`/api/auth/google?mentorId=${mentor.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('Failed to get Google auth URL')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect Google Calendar')
      setConnectingGoogle(false)
    }
  }

  useEffect(() => {
    // Check for Google connection success/error in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const googleConnected = urlParams.get('google_connected')
    const errorParam = urlParams.get('error')
    
    if (googleConnected === 'true') {
      // Refresh mentor data to get updated connection status
      const token = localStorage.getItem('mentorToken')
      if (token) {
        fetchMentorData(token)
      }
      // Clean URL
      window.history.replaceState({}, '', '/mentors/dashboard')
    }
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      window.history.replaceState({}, '', '/mentors/dashboard')
    }
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Failed to load mentor data'}
        </div>
      </div>
    )
  }

  const upcomingBookings = bookings
    .filter((b) => b.status === 'confirmed')
    .sort((a, b) => {
      const dateA = parseISO(`${a.date}T${a.time}`)
      const dateB = parseISO(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {mentor.name}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg border border-gray-300 hover:border-red-300"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Upcoming Sessions</p>
              <p className="text-3xl font-bold text-gray-900">
                {upcomingBookings.length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Profile Views</p>
              <p className="text-3xl font-bold text-gray-900">-</p>
            </div>
            <User className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>
          {!mentor.googleCalendarConnected && (
            <button
              onClick={handleConnectGoogle}
              disabled={connectingGoogle}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              <Calendar className="w-4 h-4" />
              <span>{connectingGoogle ? 'Connecting...' : 'Connect Google Calendar'}</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{mentor.name}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Email:</span>
            <span className="ml-2 text-gray-900">{mentor.email}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Expertise:</span>
            <span className="ml-2 text-gray-900">{mentor.expertise.join(', ')}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Bio:</span>
            <p className="mt-1 text-gray-900">{mentor.bio}</p>
          </div>
          <div className="pt-2 border-t">
            <span className="text-sm font-medium text-gray-700">Google Calendar: </span>
            {mentor.googleCalendarConnected ? (
              <span className="ml-2 text-green-600 font-semibold">✓ Connected</span>
            ) : (
              <span className="ml-2 text-gray-500">Not connected</span>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {mentor.googleCalendarConnected
                ? 'Meetings will be automatically added to your Google Calendar'
                : 'Connect to automatically create calendar events and send invites'}
            </p>
          </div>
        </div>
        <a
          href={`/mentors/${mentor.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-primary-600 hover:text-primary-700"
        >
          View Public Profile →
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-600">No upcoming sessions scheduled.</p>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">{booking.studentName}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(parseISO(booking.date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {booking.time}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {booking.studentEmail}
                      </div>
                    </div>
                  </div>
                  {booking.meetLink && (
                    <a
                      href={booking.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Meet</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

