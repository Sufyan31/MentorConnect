'use client'

import { format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns'
import { Mentor, Booking } from '@/lib/db'
import { Clock, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'

interface CalendarViewProps {
  mentor: Mentor
  bookings: Booking[]
  onBookingSuccess?: () => void
}

export default function CalendarView({ mentor, bookings, onBookingSuccess }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; time: string } | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const today = new Date()
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthStartWeek = startOfWeek(monthStart, { weekStartsOn: 1 })
  const monthEndWeek = startOfWeek(monthEnd, { weekStartsOn: 1 })
  const endDate = addDays(monthEndWeek, 6)
  
  const days = eachDayOfInterval({ start: monthStartWeek, end: endDate })

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const monthName = format(currentMonth, 'MMMM yyyy')

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(null)
  }

  const isTimeSlotBooked = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return bookings.some(
      (booking) =>
        booking.date === dateStr &&
        booking.time === time &&
        booking.status !== 'cancelled'
    )
  }

  const getAvailableSlots = (dayOfWeek: string) => {
    return mentor.availability[dayOfWeek] || []
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return bookings.filter(
      (booking) =>
        booking.date === dateStr &&
        booking.status !== 'cancelled'
    )
  }

  const handleDateClick = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, currentMonth)
    const isPast = day < today && !isSameDay(day, today)
    if (isCurrentMonth && !isPast) {
      setSelectedDate(day)
      setSelectedTimeSlot(null)
      setShowBookingForm(false)
    }
  }

  const handleTimeSlotClick = (day: Date, time: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent date click
    const isCurrentMonth = isSameMonth(day, currentMonth)
    const isPast = day < today && !isSameDay(day, today)
    const isBooked = isTimeSlotBooked(day, time)
    
    if (isCurrentMonth && !isPast && !isBooked) {
      setSelectedTimeSlot({ date: day, time })
      setShowBookingForm(true)
    }
  }

  const selectedDateSlots = selectedDate ? getAvailableSlots(format(selectedDate, 'EEEE').toLowerCase()) : []
  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900 min-w-[180px] text-center">{monthName}</h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map((dayName) => (
          <div key={dayName} className="text-center text-xs font-medium text-gray-500 py-2 uppercase tracking-wide">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden">
        {days.map((day, idx) => {
          const dayOfWeek = format(day, 'EEEE').toLowerCase()
          const slots = getAvailableSlots(dayOfWeek)
          const isToday = isSameDay(day, today)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isPast = day < today && !isSameDay(day, today)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const dateBookings = getBookingsForDate(day)
          const availableCount = slots.filter((time) => !isTimeSlotBooked(day, time)).length

          return (
            <div
              key={idx}
              onClick={() => handleDateClick(day)}
              className={`min-h-[100px] border-r border-b border-gray-200 p-2 cursor-pointer transition-colors ${
                !isCurrentMonth
                  ? 'bg-gray-50 text-gray-400'
                  : isSelected
                  ? 'bg-blue-50 border-blue-300'
                  : isToday
                  ? 'bg-blue-50 border-blue-200'
                  : isPast
                  ? 'bg-gray-50 text-gray-400'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    isToday && isCurrentMonth
                      ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                      : isSelected
                      ? 'text-blue-700'
                      : isCurrentMonth && !isPast
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {isCurrentMonth && !isPast && availableCount > 0 && (
                  <span className="text-xs text-green-600 font-medium">{availableCount}</span>
                )}
              </div>

              {/* Time Slots as Visual Blocks */}
              {isCurrentMonth && !isPast && slots.length > 0 && (
                <div className="space-y-1 mt-2">
                  {slots.slice(0, 3).map((time) => {
                    const isBooked = isTimeSlotBooked(day, time)
                    return (
                      <div
                        key={time}
                        onClick={(e) => handleTimeSlotClick(day, time, e)}
                        className={`text-xs px-1.5 py-0.5 rounded truncate ${
                          isBooked
                            ? 'bg-red-100 text-red-700 border border-red-200 cursor-not-allowed'
                            : 'bg-green-100 text-green-700 border border-green-200 cursor-pointer hover:bg-green-200 transition-colors'
                        }`}
                        title={isBooked ? `Booked` : `Click to book: ${time}`}
                      >
                        {time}
                      </div>
                    )
                  })}
                  {slots.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-0.5">
                      +{slots.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs pt-2">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded mr-2"></div>
          <span className="text-gray-600">Today</span>
        </div>
      </div>

      {/* Date Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Available Time Slots
                </h4>
                {selectedDateSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDateSlots.map((time) => {
                      const isBooked = isTimeSlotBooked(selectedDate, time)
                      return (
                        <button
                          key={time}
                          disabled={isBooked}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isBooked && selectedDate) {
                              setSelectedTimeSlot({ date: selectedDate, time })
                              setShowBookingForm(true)
                              setSelectedDate(null)
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isBooked
                              ? 'bg-red-50 text-red-700 border border-red-200 cursor-not-allowed'
                              : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 cursor-pointer'
                          }`}
                          title={isBooked ? `Booked` : `Click to book: ${time}`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No available slots for this day</p>
                )}
              </div>

              {selectedDateBookings.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Booked Time Slots</h4>
                  <div className="space-y-2">
                    {selectedDateBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.time}</p>
                            <p className="text-xs text-gray-600 mt-1">Session booked</p>
                          </div>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Booked
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedTimeSlot && (
        <BookingModal
          mentorId={mentor.id}
          date={selectedTimeSlot.date}
          time={selectedTimeSlot.time}
          onClose={() => {
            setShowBookingForm(false)
            setSelectedTimeSlot(null)
          }}
          onSuccess={() => {
            setShowBookingForm(false)
            setSelectedTimeSlot(null)
            if (onBookingSuccess) {
              onBookingSuccess()
            } else {
              // Refresh the page to show updated bookings
              window.location.reload()
            }
          }}
        />
      )}
    </div>
  )
}

// Booking Modal Component
interface BookingModalProps {
  mentorId: string
  date: Date
  time: string
  onClose: () => void
  onSuccess: () => void
}

function BookingModal({ mentorId, date, time, onClose, onSuccess }: BookingModalProps) {
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!studentName || !studentEmail) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorId,
          studentName,
          studentEmail,
          date: format(date, 'yyyy-MM-dd'),
          time,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book session')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Book a Session</h3>
            <p className="text-sm text-gray-600 mt-1">
              {format(date, 'EEEE, MMMM d, yyyy')} at {time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email *
              </label>
              <input
                type="email"
                id="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Any specific topics you'd like to discuss?"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
