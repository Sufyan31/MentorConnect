import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google-calendar'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mentorId = searchParams.get('mentorId')
    
    // If mentorId is provided, use it directly
    // Otherwise, try to get from auth token
    let finalMentorId = mentorId

    if (!finalMentorId) {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      
      if (token) {
        const user = getCurrentUser(token)
        if (user?.mentorId) {
          finalMentorId = user.mentorId
        }
      }
    }

    if (!finalMentorId) {
      return NextResponse.json(
        { error: 'Mentor ID required' },
        { status: 400 }
      )
    }

    const authUrl = getAuthUrl(finalMentorId)
    
    return NextResponse.json({ authUrl })
  } catch (error: any) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}

