# Google Beet - Video Meeting Platform

A clone of Google Meet built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- ✅ **Authentication**: User signup and login with Supabase Auth
- ✅ **Create Meetings**: Start new meetings with custom or auto-generated meeting codes
- ✅ **Join Meetings**: Join existing meetings using meeting codes
- ✅ **Video Chat**: Real-time video communication using WebRTC
- ✅ **Voice Chat**: Crystal clear audio communication
- ✅ **Screen Sharing**: Share your screen with other participants
- ✅ **Meeting Controls**: Toggle video, audio, and screen sharing on/off

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **WebRTC**: Simple-peer for peer-to-peer connections
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/semitha-uni-west/google-beet.git
cd google-beet
```

2. Install dependencies:
```bash
npm install
```

3. The Supabase credentials are already configured in `.env` file

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Open the `data.md` file in this repository
   - Copy the SQL schema and run it in the SQL Editor

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
google-beet/
├── app/
│   ├── auth/
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── dashboard/         # Dashboard to create/join meetings
│   ├── meeting/[code]/    # Meeting room page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── types/
│   └── index.ts           # TypeScript type definitions
├── data.md                # Database schema SQL
└── .env                   # Environment variables
```

## Usage

### Creating an Account

1. Navigate to the signup page
2. Enter your full name, email, and password (min 6 characters)
3. Click "Sign up"
4. You'll be redirected to the dashboard

### Creating a Meeting

1. Log in to your account
2. Go to the dashboard
3. Click "New Meeting"
4. Optionally enter a meeting title and custom code
5. Click "Create" to start the meeting
6. Share the meeting code with participants

### Joining a Meeting

1. Log in to your account
2. Go to the dashboard
3. Enter the meeting code in the "Join a meeting" section
4. Click "Join"

### In the Meeting

- **Toggle Video**: Click the camera icon to turn video on/off
- **Toggle Audio**: Click the microphone icon to mute/unmute
- **Share Screen**: Click the screen icon to start/stop screen sharing
- **Leave Meeting**: Click "Leave Meeting" to exit

## Database Schema

The application uses three main tables:

1. **profiles**: User profile information
2. **meetings**: Meeting metadata and codes
3. **meeting_participants**: Tracks meeting participation

See `data.md` for the complete SQL schema.

## Environment Variables

The following environment variables are configured in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Building for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Google Meet
- Built with Next.js and Supabase
- WebRTC powered by simple-peer
