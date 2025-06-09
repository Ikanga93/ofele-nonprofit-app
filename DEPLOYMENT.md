# Deploying Stone Creek Intercession to Vercel

This guide will help you deploy the Stone Creek Intercession app to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A cloud database (we recommend Neon PostgreSQL - free tier available)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Set up a Cloud Database

Since Vercel is serverless, we can't use SQLite. We need a cloud database.

### Option A: Neon PostgreSQL (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://username:password@host/database?sslmode=require`)

### Option B: PlanetScale MySQL

1. Go to [planetscale.com](https://planetscale.com) and sign up
2. Create a new database
3. Copy the connection string

### Option C: Supabase PostgreSQL

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings > Database and copy the connection string

## Step 2: Update Prisma Schema for Production

You'll need to update the `prisma/schema.prisma` file to use PostgreSQL instead of SQLite:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Step 3: Environment Variables

You'll need these environment variables in Vercel:

- `DATABASE_URL` - Your cloud database connection string
- `JWT_SECRET` - A random secret for JWT tokens (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your Vercel app URL (e.g., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET` - Another random secret for NextAuth (generate with: `openssl rand -base64 32`)

## Step 4: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   cd stone-creek-intercession
   vercel
   ```

4. Follow the prompts:
   - Link to existing project? **N**
   - What's your project's name? **stone-creek-intercession**
   - In which directory is your code located? **./**

5. Set environment variables:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: **stone-creek-intercession**
6. Add environment variables in the Environment Variables section
7. Click "Deploy"

## Step 5: Initialize Database

After deployment, you need to set up your database:

1. Run database migrations:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

2. (Optional) Seed with initial data:
   ```bash
   npx prisma db seed
   ```

## Step 6: Create Admin User

Since you need an admin user to manage the app:

1. Go to your deployed app
2. Register a new account
3. Connect to your database and manually update the user's role to 'ADMIN'

Or create a seed script to automatically create an admin user.

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Cloud database connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret for JWT token signing | `your-jwt-secret-here` |
| `NEXTAUTH_URL` | Your app's URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | `your-nextauth-secret-here` |

## Troubleshooting

### Build Errors
- Make sure all environment variables are set
- Check that Prisma schema is updated for PostgreSQL
- Ensure `postinstall` script runs `prisma generate`

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database allows connections from Vercel IPs
- Ensure SSL is enabled in connection string

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Ensure JWT_SECRET is set

## Post-Deployment

1. Test all functionality:
   - User registration/login
   - Admin panel access
   - Prayer request submission
   - Birthday display
   - Schedule management

2. Set up monitoring (optional):
   - Vercel Analytics
   - Error tracking (Sentry)
   - Uptime monitoring

## Updating the App

To update your deployed app:

1. Push changes to your repository
2. Vercel will automatically redeploy
3. Or use: `vercel --prod` for manual deployment

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` environment variable to your custom domain 