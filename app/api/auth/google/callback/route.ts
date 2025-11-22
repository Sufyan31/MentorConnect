import { NextRequest, NextResponse } from 'next/server'
import { getTokensFromCode } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // mentorId
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/mentors/dashboard?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/mentors/dashboard?error=missing_code_or_state', request.url)
      )
    }

    await getTokensFromCode(code, state)

    return NextResponse.redirect(
      new URL('/mentors/dashboard?google_connected=true', request.url)
    )
  } catch (error: any) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(
      new URL(`/mentors/dashboard?error=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}

