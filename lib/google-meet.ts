// Google Meet integration utility
// Uses Google Calendar API to create events with Meet links in both calendars

import { createCalendarEvent } from './google-calendar'
import { getMentor } from './db'

export interface MeetDetails {
  link: string
  meetingId: string
  eventId?: string
}

/**
 * Create a Google Meet link and calendar event for a scheduled session
 * This creates events in both the mentor's and student's Google calendars
 */
export async function createMeetLink(
  mentorId: string,
  studentName: string,
  studentEmail: string,
  date: string,
  time: string
): Promise<MeetDetails> {
  const mentor = getMentor(mentorId)
  
  if (!mentor) {
    throw new Error('Mentor not found')
  }

  // Check if mentor has Google Calendar connected
  if (!mentor.googleCalendarConnected || !mentor.googleAccessToken) {
    // Fallback: Generate placeholder link if Google Calendar is not connected
    // In production, you might want to require Google Calendar connection
    console.warn(`Mentor ${mentorId} has not connected Google Calendar. Using placeholder link.`)
    
    const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const meetLink = `https://meet.google.com/${meetingId}`
    
    return {
      link: meetLink,
      meetingId,
    }
  }

  try {
    // Create calendar event with Google Meet
    const result = await createCalendarEvent(
      mentorId,
      studentName,
      studentEmail,
      date,
      time,
      mentor.timezone,
      60 // 60 minutes default duration
    )

    return {
      link: result.meetLink,
      meetingId: result.eventId,
      eventId: result.eventId,
    }
  } catch (error: any) {
    console.error('Error creating calendar event:', error)
    
    // Fallback to placeholder if calendar creation fails
    const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const meetLink = `https://meet.google.com/${meetingId}`
    
    return {
      link: meetLink,
      meetingId,
    }
  }
}

