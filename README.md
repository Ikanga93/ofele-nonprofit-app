# Stone Creek Intercession Web App

A comprehensive prayer and fellowship management system built with Next.js, TypeScript, and Prisma.

## Features

### 🙏 Prayer Management
- **Weekly Prayer Teams**: Automatically generates rotating prayer partner pairs each week
- **Prayer Requests**: Community members can submit prayer requests (anonymously or with their name)
- **Prayer Subjects**: Admin-controlled prayer topics for the community

### 📅 Scheduling System
- **Monday Prayer Moderators**: Automatic scheduling for Monday prayer sessions (6:00 PM - 7:00 PM)
- **Saturday Prayer Moderators**: Automatic scheduling for Saturday prayer sessions (4:30 PM - 6:00 PM)
- **Rotating Schedule**: Fair rotation system among all members including admins

### 👥 User Management
- **Role-based Access**: Up to 3 admins, unlimited members
- **User Registration**: Full name, email, birthday, password, and role selection
- **Authentication**: Secure JWT-based authentication system

### 📰 News & Events
- **Community News**: Admins can post announcements and news
- **Event Management**: Create and manage community events with dates
- **Chronological Display**: Events and news sorted by date

### 🎂 Birthday Tracking
- **Monthly Birthdays**: Displays upcoming birthdays for the current month
- **Community Celebration**: Helps the community stay connected

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd stone-creek-intercession
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### For New Users
1. Visit the homepage
2. Click "Register" to create an account
3. Fill in your details (full name, email, birthday, password)
4. Choose your role (Member or Admin - note: only 3 admins allowed)
5. After registration, log in with your credentials

### For Members
- **View Dashboard**: See current moderators, upcoming birthdays, news, and prayer subjects
- **Submit Prayer Requests**: Use the prayer requests page to submit requests (anonymously or with your name)
- **View Prayer Teams**: See current prayer partner assignments
- **View Schedule**: Check upcoming prayer session moderators

### For Admins
All member features plus:
- **Generate Prayer Teams**: Create weekly prayer partner pairs
- **Create Moderator Schedules**: Generate rotating schedules for prayer sessions
- **Manage Prayer Subjects**: Add and edit community prayer topics
- **Post News & Events**: Create announcements and event listings
- **Admin Panel**: Access administrative functions

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Prayer Management
- `GET /api/prayer-teams` - Get current prayer teams
- `POST /api/prayer-teams` - Generate new prayer teams (Admin only)
- `GET /api/prayer-requests` - Get all prayer requests
- `POST /api/prayer-requests` - Submit a prayer request

### Scheduling
- `GET /api/moderator-schedule` - Get moderator schedules
- `POST /api/moderator-schedule` - Generate schedules (Admin only)

### Content Management
- `GET /api/prayer-subjects` - Get active prayer subjects
- `POST /api/prayer-subjects` - Create prayer subject (Admin only)
- `GET /api/news` - Get news and events
- `POST /api/news` - Create news/event (Admin only)

### Dashboard
- `GET /api/dashboard` - Get all dashboard data

## Database Schema

The app uses SQLite with Prisma ORM. Key models include:
- **User**: User accounts with roles and personal information
- **PrayerTeam**: Weekly prayer partner assignments
- **ModeratorSchedule**: Prayer session moderator assignments
- **PrayerSubject**: Community prayer topics
- **News**: Announcements and events
- **PrayerRequest**: Community prayer requests

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

## Environment Variables

Create a `.env` file with:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

## Deployment

For production deployment:
1. Update environment variables for production
2. Use a production database (PostgreSQL recommended)
3. Set `NODE_ENV=production`
4. Build the application: `npm run build`
5. Start the production server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions about the Stone Creek Intercession app, please contact the development team.
# ofele-nonprofit-app
