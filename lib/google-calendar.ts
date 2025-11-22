import { google } from 'googleapis'
import { getMentor, saveMentor } from './db'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

// Create OAuth2 client
export function getOAuth2Client() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured')
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  )
}

// Get authorization URL for OAuth flow
export function getAuthUrl(mentorId: string): string {
  const oauth2Client = getOAuth2Client()
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: mentorId, // Pass mentor ID in state for callback
    prompt: 'consent', // Force consent to get refresh token
  })

  return url
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string, mentorId: string) {
  const oauth2Client = getOAuth2Client()
  
  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    // Save tokens to mentor profile
    const mentor = getMentor(mentorId)
    if (mentor) {
      mentor.googleAccessToken = tokens.access_token || undefined
      mentor.googleRefreshToken = tokens.refresh_token || undefined
      mentor.googleCalendarConnected = true
      saveMentor(mentor)
    }

    return tokens
  } catch (error) {
    console.error('Error getting tokens:', error)
    throw error
  }
}

// Get authenticated calendar client for a mentor
export async function getCalendarClient(mentorId: string) {
  const mentor = getMentor(mentorId)
  
  if (!mentor || !mentor.googleAccessToken) {
    throw new Error('Mentor has not connected Google Calendar')
  }

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: mentor.googleAccessToken,
    refresh_token: mentor.googleRefreshToken,
  })

  // Refresh token if needed
  try {
    await oauth2Client.getAccessToken()
  } catch (error) {
    // Token might be expired, try to refresh
    if (mentor.googleRefreshToken) {
      oauth2Client.setCredentials({
        refresh_token: mentor.googleRefreshToken,
      })
      const { credentials } = await oauth2Client.refreshAccessToken()
      
      // Update stored token
      mentor.googleAccessToken = credentials.access_token || undefined
      if (credentials.refresh_token) {
        mentor.googleRefreshToken = credentials.refresh_token
      }
      saveMentor(mentor)
    } else {
      throw new Error('Unable to refresh access token')
    }
  }

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

// Create calendar event with Google Meet
export async function createCalendarEvent(
  mentorId: string,
  studentName: string,
  studentEmail: string,
  date: string,
  time: string,
  timezone: string,
  durationMinutes: number = 60
): Promise<{ eventId: string; meetLink: string }> {
  const calendar = await getCalendarClient(mentorId)
  const mentor = getMentor(mentorId)

  if (!mentor) {
    throw new Error('Mentor not found')
  }

  // Parse date and time
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  
  const startDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes))
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000)

  // Format as ISO 8601
  const startTime = startDateTime.toISOString().replace(/\.\d{3}Z$/, '')
  const endTime = endDateTime.toISOString().replace(/\.\d{3}Z$/, '')

  // Create event with Google Meet
  const event = {
    summary: `Mentoring Session with ${studentName}`,
    description: `Mentoring session scheduled through MentorConnect.\n\nStudent: ${studentName} (${studentEmail})\nMentor: ${mentor.name}`,
    start: {
      dateTime: startTime,
      timeZone: timezone || 'UTC',
    },
    end: {
      dateTime: endTime,
      timeZone: timezone || 'UTC',
    },
    attendees: [
      { email: mentor.email, organizer: true },
      { email: studentEmail },
    ],
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 15 }, // 15 minutes before
      ],
    },
  }

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
      sendUpdates: 'all', // Send invitations to all attendees
    })

    const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri || ''
    const eventId = response.data.id || ''

    if (!meetLink) {
      throw new Error('Failed to create Google Meet link')
    }

    return {
      eventId: eventId,
      meetLink: meetLink,
    }
  } catch (error: any) {
    console.error('Error creating calendar event:', error)
    throw new Error(`Failed to create calendar event: ${error.message}`)
  }
}

// Delete calendar event
export async function deleteCalendarEvent(mentorId: string, eventId: string) {
  const calendar = await getCalendarClient(mentorId)
  
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
    })
  } catch (error: any) {
    console.error('Error deleting calendar event:', error)
    throw new Error(`Failed to delete calendar event: ${error.message}`)
  }
}

