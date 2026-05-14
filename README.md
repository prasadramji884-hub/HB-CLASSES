# HB CLASSES - Online English Coaching Platform

A production-ready, full-stack Next.js 14 application for online English coaching with video courses, live classes, and progress tracking.

![HB CLASSES](https://img.shields.io/badge/HB%20CLASSES-v2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## ✨ Features

### Authentication & Security
- 🔐 **Email OTP Authentication** - Single page login/register with Nodemailer + Gmail SMTP
- 🖥️ **Device Fingerprint Lock** - One account per device for students
- 🛡️ **YouTube Video Protection** - Encrypted URLs, rotating watermarks, dev tools detection
- 🔑 **Admin PIN Protection** - Secure admin access
- 👤 **Student Approval System** - Admin approval required for new students

### User Roles
- **Superadmin** - Full platform control, student management, settings
- **Teacher** - Course management, live classes, announcements
- **Student** - Course enrollment, video watching, progress tracking

### Core Features
- 📚 **Course Management** - Create, publish, and manage courses
- 🎬 **Protected Video Player** - Anti-piracy measures with token-based access
- 📡 **Live Classes** - YouTube Live integration with real-time chat
- 📊 **Progress Tracking** - Watch time and completion status
- 🔔 **Notifications** - Push notifications for announcements and updates
- 🔍 **Search** - Debounced search for courses and videos
- 🌙 **Dark/Light Theme** - Toggle between themes
- 📱 **PWA Support** - Installable web app with offline support

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth/OTP | Nodemailer + Gmail SMTP |
| Animations | Framer Motion |
| Icons | Lucide React |
| Encryption | CryptoJS |
| JWT | jose |

## 📁 Project Structure

```
hb-classes/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/         # OTP APIs
│   │   │   ├── video/        # Video token API
│   │   │   ├── admin/        # Admin APIs
│   │   │   └── notifications/# Notification APIs
│   │   ├── auth/login/       # Single login page
│   │   ├── student/          # Student pages
│   │   ├── teacher/          # Teacher pages
│   │   ├── admin/            # Admin pages
│   │   ├── maintenance/      # Maintenance page
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── auth/            # Auth components
│   │   ├── video/           # Video player components
│   │   ├── student/         # Student components
│   │   ├── teacher/         # Teacher components
│   │   ├── admin/           # Admin components
│   │   └── layout/          # Layout components
│   ├── lib/                 # Utilities
│   │   ├── supabase.ts     # Supabase clients
│   │   ├── encryption.ts   # Crypto utilities
│   │   ├── email.ts        # Email service
│   │   ├── jwt.ts          # JWT utilities
│   │   ├── device.ts       # Device fingerprinting
│   │   └── utils.ts        # Helper functions
│   ├── types/              # TypeScript types
│   └── middleware.ts       # Route protection
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── package.json
```

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hb-classes.git
cd hb-classes
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gmail SMTP (For OTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Encryption Keys (Generate strong random strings)
ENCRYPTION_KEY=your-32-char-encryption-key-here!!
JWT_SECRET=your-jwt-secret-key-here-min-32-chars!!

# App Config
NEXT_PUBLIC_APP_NAME=HB CLASSES
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** For Gmail App Password:
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate a new app password for "Mail"

### 4. Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Run the migration file:
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or copy the SQL from supabase/migrations/001_initial_schema.sql
   # and run it in the Supabase SQL Editor
   ```

3. Enable Realtime for tables:
   - Go to Supabase Dashboard → Database → Replication
   - Enable realtime for: `chat_messages`, `live_sessions`, `notifications`

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create First Admin

The migration automatically creates a default admin:
- Email: `admin@hbclasses.com`
- Login with OTP, then set admin PIN in settings

## 📱 PWA Configuration

The app includes PWA support with:
- Service Worker for offline functionality
- Web App Manifest for installability
- Optimized icons and splash screens

To customize PWA settings, edit `public/manifest.json`.

## 🔒 Security Features

1. **YouTube URL Encryption** - All video URLs are encrypted in the database
2. **Token-Based Access** - Short-lived tokens for video playback
3. **Device Fingerprinting** - Browser fingerprint hashing for device lock
4. **Dev Tools Detection** - Pauses video when developer tools are opened
5. **Right-Click Disable** - Prevents context menu on video player
6. **Keyboard Shortcuts Block** - Blocks inspect element shortcuts
7. **Rotating Watermark** - Student name/email rotates on video overlay
8. **Row Level Security** - Supabase RLS enabled on all tables

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Make sure to update these for production:
- `NEXT_PUBLIC_APP_URL` - Your production domain
- `ENCRYPTION_KEY` - Generate a new secure key
- `JWT_SECRET` - Generate a new secure secret

## 📊 Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | All users (students, teachers, admin) |
| `courses` | Course information |
| `videos` | Video metadata with encrypted URLs |
| `enrollments` | Student-course enrollments |
| `live_sessions` | Live class sessions |
| `video_progress` | Student watch progress |
| `chat_messages` | Live chat messages |
| `notifications` | Platform notifications |
| `video_tokens` | Temporary video access tokens |
| `app_settings` | Platform configuration |

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/resend-otp` - Resend OTP with cooldown

### Video
- `GET /api/video/token?videoId=` - Get video access token

### Admin
- `GET /api/admin/settings` - Get app settings
- `POST /api/admin/settings` - Update app settings

### Notifications
- `POST /api/notifications/send` - Send notification

## 📝 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## 🤝 Support

For support, email support@hbclasses.com or contact the development team.

---

**HB CLASSES** - Empowering English Learning Online
