import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const mentorsFile = path.join(dataDir, 'mentors.json')
const bookingsFile = path.join(dataDir, 'bookings.json')
const usersFile = path.join(dataDir, 'users.json')

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize files if they don't exist
function initFile(filePath: string, defaultValue: any) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2))
  }
}

initFile(mentorsFile, [])
initFile(bookingsFile, [])
initFile(usersFile, [])

export interface Mentor {
  id: string
  name: string
  email: string
  bio: string
  expertise: string[]
  avatar?: string
  timezone: string
  availability: {
    [key: string]: string[] // day of week -> array of time slots
  }
  googleMeetEmail?: string
  googleCalendarConnected?: boolean
  googleAccessToken?: string
  googleRefreshToken?: string
  createdAt: string
}

export interface Booking {
  id: string
  mentorId: string
  studentName: string
  studentEmail: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  meetLink?: string
  googleEventId?: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  password: string // hashed
  role: 'mentor'
  mentorId?: string
  createdAt: string
}

// Read functions
export function getMentors(): Mentor[] {
  const data = fs.readFileSync(mentorsFile, 'utf-8')
  return JSON.parse(data)
}

export function getMentor(id: string): Mentor | null {
  const mentors = getMentors()
  return mentors.find(m => m.id === id) || null
}

export function getBookings(mentorId?: string): Booking[] {
  const data = fs.readFileSync(bookingsFile, 'utf-8')
  const bookings: Booking[] = JSON.parse(data)
  if (mentorId) {
    return bookings.filter(b => b.mentorId === mentorId)
  }
  return bookings
}

export function getBooking(id: string): Booking | null {
  const bookings = getBookings()
  return bookings.find(b => b.id === id) || null
}

export function getUserByEmail(email: string): User | null {
  const data = fs.readFileSync(usersFile, 'utf-8')
  const users: User[] = JSON.parse(data)
  return users.find(u => u.email === email) || null
}

export function getUserById(id: string): User | null {
  const data = fs.readFileSync(usersFile, 'utf-8')
  const users: User[] = JSON.parse(data)
  return users.find(u => u.id === id) || null
}

// Write functions
export function saveMentor(mentor: Mentor): void {
  const mentors = getMentors()
  const index = mentors.findIndex(m => m.id === mentor.id)
  if (index >= 0) {
    mentors[index] = mentor
  } else {
    mentors.push(mentor)
  }
  fs.writeFileSync(mentorsFile, JSON.stringify(mentors, null, 2))
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookings()
  const index = bookings.findIndex(b => b.id === booking.id)
  if (index >= 0) {
    bookings[index] = booking
  } else {
    bookings.push(booking)
  }
  fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2))
}

export function saveUser(user: User): void {
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'))
  const index = users.findIndex((u: User) => u.id === user.id)
  if (index >= 0) {
    users[index] = user
  } else {
    users.push(user)
  }
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

// Utility functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

