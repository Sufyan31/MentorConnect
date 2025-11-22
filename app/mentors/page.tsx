import Link from 'next/link'
import { getMentors } from '@/lib/db'
import { User, Calendar, Briefcase } from 'lucide-react'

export default async function MentorsPage() {
  const mentors = getMentors()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Mentors</h1>
        <p className="text-gray-600">Browse our expert mentors and find the perfect match for you</p>
      </div>

      {mentors.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No mentors available yet.</p>
          <p className="text-gray-500 mt-2">Check back soon or become a mentor yourself!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <Link
              key={mentor.id}
              href={`/mentors/${mentor.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {mentor.avatar ? (
                    <img src={mentor.avatar} alt={mentor.name} className="w-16 h-16 rounded-full" />
                  ) : (
                    <User className="w-8 h-8 text-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{mentor.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span className="text-sm truncate">{mentor.expertise.join(', ')}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{mentor.bio}</p>
                  <div className="flex items-center text-primary-600 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>View Calendar</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

