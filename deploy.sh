#!/bin/bash

echo "🚀 Stone Creek Intercession - Vercel Deployment Script"
echo "=================================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Vercel CLI found"

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your cloud database (Neon, PlanetScale, or Supabase)"
echo "2. Add environment variables in Vercel dashboard:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - NEXTAUTH_URL"
echo "   - NEXTAUTH_SECRET"
echo "3. Run 'npx prisma db push' to set up your database schema"
echo "4. Create your first admin user"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 