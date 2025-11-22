import { notFound } from 'next/navigation'
import { getMentor, getBookings } from '@/lib/db'
import { User, Briefcase, Calendar, Clock, Mail } from 'lucide-react'
import CalendarView from '@/components/CalendarView'

export default async function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const mentor = getMentor(id)
  
  if (!mentor) {
    notFound()
  }

  const bookings = getBookings(id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="flex-shrink-0 mb-6 md:mb-0">
            {mentor.avatar ? (
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-primary-600" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{mentor.name}</h1>
            
            <div className="mb-4">
              <div className="flex items-center text-gray-700 mb-2">
                <Briefcase className="w-5 h-5 mr-2" />
                <span className="font-semibold">Expertise:</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {mentor.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{mentor.bio}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-2" />
                <span>Timezone: {mentor.timezone}</span>
              </div>
              {mentor.googleMeetEmail && (
                <div className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>Meetings: Google Meet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-primary-600" />
            Availability Calendar
          </h2>
          <p className="text-sm text-gray-600">Click on an available time slot to book a session</p>
        </div>
        <CalendarView mentor={mentor} bookings={bookings} />
      </div>
    </div>
  )
}

