import { NextRequest, NextResponse } from 'next/server'
import { saveBooking, getMentor, getBookings, generateId } from '@/lib/db'
import { createMeetLink } from '@/lib/google-meet'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mentorId, studentName, studentEmail, date, time, message } = body

    // Validate input
    if (!mentorId || !studentName || !studentEmail || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if mentor exists
    const mentor = getMentor(mentorId)
    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      )
    }

    // Check if time slot is already booked
    const existingBookings = getBookings(mentorId)
    const isAlreadyBooked = existingBookings.some(
      (booking) =>
        booking.date === date &&
        booking.time === time &&
        booking.status !== 'cancelled'
    )

    if (isAlreadyBooked) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      )
    }

    // Create Google Meet link and calendar event
    const meetDetails = await createMeetLink(
      mentorId,
      body.studentName || studentName,
      studentEmail,
      date,
      time
    )

    // Create booking
    const booking = {
      id: generateId(),
      mentorId,
      studentName,
      studentEmail,
      date,
      time,
      status: 'confirmed' as const,
      meetLink: meetDetails.link,
      googleEventId: meetDetails.eventId,
      createdAt: new Date().toISOString(),
    }

    saveBooking(booking)

    // In production, send confirmation email here
    // await sendBookingConfirmationEmail(studentEmail, mentor, booking)

    return NextResponse.json(
      {
        success: true,
        booking: {
          ...booking,
          meetLink: meetDetails.link,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mentorId = searchParams.get('mentorId')

    const bookings = getBookings(mentorId || undefined)
    return NextResponse.json({ bookings })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

