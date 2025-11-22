'use client'

import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'

interface BookingFormProps {
  mentorId: string
}

export default function BookingForm({ mentorId }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const today = new Date()
  // Show dates for one month (approximately 30 days from today)
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(today, i))
  
  // Group dates by month for better display
  const datesByMonth = availableDates.reduce((acc, date) => {
    const monthKey = format(date, 'MMMM yyyy')
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(date)
    return acc
  }, {} as Record<string, Date[]>)

  // Mock available times - in production, fetch from mentor's availability
  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!selectedDate || !selectedTime || !studentName || !studentEmail) {
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
          date: selectedDate,
          time: selectedTime,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book session')
      }

      setSuccess(true)
      setStudentName('')
      setStudentEmail('')
      setSelectedDate('')
      setSelectedTime('')
      setMessage('')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 font-semibold text-lg mb-2">Booking Successful!</div>
        <p className="text-green-700">
          Your session has been booked. You'll receive a confirmation email with meeting details.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-primary-600 hover:text-primary-700 underline"
        >
          Book Another Session
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Select Date
        </label>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(datesByMonth).map(([monthKey, dates]) => (
            <div key={monthKey}>
              <div className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-white py-1">
                {monthKey}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {dates.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const isSelected = selectedDate === dateStr
                  const isPast = date < today
                  const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => !isPast && setSelectedDate(dateStr)}
                      disabled={isPast}
                      className={`p-2 rounded border text-sm ${
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-600'
                          : isPast
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : isToday
                          ? 'bg-primary-50 border-primary-300 text-primary-700 font-semibold'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                      }`}
                      title={format(date, 'EEEE, MMMM d, yyyy')}
                    >
                      <div className="text-xs">{format(date, 'EEE')}</div>
                      <div>{format(date, 'd')}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Select Time
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`p-2 rounded border text-sm ${
                  selectedTime === time
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Your Name *
        </label>
        <input
          type="text"
          id="name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedDate || !selectedTime}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Booking...' : 'Book Session'}
      </button>
    </form>
  )
}

