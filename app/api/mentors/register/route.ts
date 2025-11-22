import { NextRequest, NextResponse } from 'next/server'
import { createUser, generateToken } from '@/lib/auth'
import { saveMentor, generateId } from '@/lib/db'
import { Mentor } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, bio, expertise, timezone, googleMeetEmail } = body

    // Validate input
    if (!name || !email || !password || !bio || !expertise) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create user account
    const mentorId = generateId()
    const user = await createUser(email, password, mentorId)

    // Create mentor profile
    const mentor: Mentor = {
      id: mentorId,
      name,
      email,
      bio,
      expertise: expertise.split(',').map((e: string) => e.trim()),
      timezone: timezone || 'UTC',
      googleMeetEmail: googleMeetEmail || undefined,
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      createdAt: new Date().toISOString(),
    }

    saveMentor(mentor)

    // Generate token
    const token = generateToken(user.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        token,
        mentor,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

