# MentorConnect

A web application for connecting students with mentors. Students can browse mentors, view their profiles and calendars, and book sessions without registration. Mentors can register, manage their profiles, and receive meeting bookings with Google Meet integration.

## Features

### For Students (No Registration Required)
- Browse list of mentors
- View mentor profiles with expertise and bio
- See mentor availability calendar
- Book mentoring sessions
- Receive meeting links via email

### For Mentors (Registration Required)
- Register and create mentor profile
- Login to dashboard
- View upcoming bookings
- Manage availability
- Get Google Meet links for scheduled sessions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT tokens
- **Database**: JSON file-based storage (easily upgradeable to PostgreSQL/MongoDB)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── bookings/     # Booking management
│   │   └── mentors/      # Mentor authentication & profile
│   ├── mentors/          # Mentor pages
│   │   ├── [id]/         # Mentor profile page
│   │   ├── dashboard/    # Mentor dashboard
│   │   ├── login/        # Mentor login
│   │   └── register/     # Mentor registration
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── BookingForm.tsx   # Session booking form
│   └── CalendarView.tsx  # Availability calendar
├── lib/                  # Utilities
│   ├── auth.ts          # Authentication helpers
│   ├── db.ts            # Database operations
│   └── google-meet.ts   # Google Meet integration
└── data/                 # JSON database files (auto-created)
```

## Google Calendar Integration

The application includes full Google Calendar integration! When mentors connect their Google Calendar:

1. **Automatic Calendar Events**: When a student books a session, a calendar event is automatically created in the mentor's Google Calendar
2. **Student Invitations**: The student receives a calendar invitation via email and can add it to their Google Calendar
3. **Google Meet Links**: Each event includes an automatic Google Meet link for video conferencing
4. **Reminders**: Calendar events include email and popup reminders

### Setting Up Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace)
   - Add your app name, support email, and developer contact
   - Add scopes: `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/calendar.events`
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback` (for development)
   - For production, add your production URL
7. Copy the **Client ID** and **Client Secret** to your `.env.local` file

### How It Works

1. Mentors can connect their Google Calendar from the dashboard
2. When a student books a session, the system:
   - Creates a calendar event in the mentor's Google Calendar
   - Adds the student as an attendee (they receive an email invitation)
   - Includes a Google Meet link in the event
   - Sets up reminders (1 day before and 15 minutes before)
3. Both parties receive calendar invitations and can add the event to their calendars

## Environment Variables

Create a `.env.local` file for production:

```env
JWT_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

**Note**: For production, update `GOOGLE_REDIRECT_URI` to your production URL.

## Database

Currently uses JSON file-based storage in the `data/` directory. This is suitable for development and can be easily upgraded to:
- PostgreSQL
- MongoDB
- SQLite
- Any other database system

## Features

✅ **Implemented:**
- Student browsing and booking (no registration required)
- Mentor registration and authentication
- Google Calendar integration with automatic event creation
- Google Meet links for video conferencing
- Calendar invitations sent to both mentor and student
- Mentor dashboard with booking management

## Future Enhancements

- Email notifications for bookings (calendar invites are sent automatically)
- Payment processing
- Rating and review system
- Search and filter mentors
- Recurring sessions
- Custom availability management
- Session cancellation and rescheduling

## License

MIT
