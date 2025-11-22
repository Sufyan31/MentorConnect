import Link from 'next/link'
import { Calendar, Users, Clock, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to MentorConnect
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with experienced mentors and grow your skills
        </p>
        <Link
          href="/mentors"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Browse Mentors
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Users className="w-12 h-12 text-primary-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Expert Mentors</h3>
          <p className="text-gray-600">
            Connect with experienced professionals across various fields
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Calendar className="w-12 h-12 text-primary-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
          <p className="text-gray-600">
            View mentor availability and book sessions that work for you
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Clock className="w-12 h-12 text-primary-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Flexible Timing</h3>
          <p className="text-gray-600">
            Choose from available time slots that fit your schedule
          </p>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 font-bold text-xl">1</span>
            </div>
            <h3 className="font-semibold mb-2">Browse Mentors</h3>
            <p className="text-gray-600 text-sm">
              Explore our directory of mentors and their profiles
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 font-bold text-xl">2</span>
            </div>
            <h3 className="font-semibold mb-2">View Calendar</h3>
            <p className="text-gray-600 text-sm">
              Check mentor availability and find a time that works
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 font-bold text-xl">3</span>
            </div>
            <h3 className="font-semibold mb-2">Book Session</h3>
            <p className="text-gray-600 text-sm">
              Reserve your slot and get meeting details via email
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

