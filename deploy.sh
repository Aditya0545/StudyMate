#!/bin/bash

# StudyMate Netlify Deployment Script

echo "📋 Setting up environment variables..."
# This will create a .env.production.local file from the environment variables
# which will be used in production but not committed to git
cat > .env.production.local << EOL
# MongoDB Configuration
MONGODB_URI=${MONGODB_URI}

# Firebase Configuration
FIREBASE_API_KEY=${FIREBASE_API_KEY}
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
FIREBASE_APP_ID=${FIREBASE_APP_ID}

# Google Drive API Configuration
GOOGLE_DRIVE_CLIENT_ID=${GOOGLE_DRIVE_CLIENT_ID}
GOOGLE_DRIVE_CLIENT_SECRET=${GOOGLE_DRIVE_CLIENT_SECRET}
# Client-side accessible variables
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID}
NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=${NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY}

# YouTube API Configuration
YOUTUBE_API_KEY=${YOUTUBE_API_KEY}

# Resources Section Protection
RESOURCES_PASSWORD=${RESOURCES_PASSWORD}
EOL

echo "📦 Building StudyMate for production..."
npm run build

echo "🧪 Running tests..."
# Add your tests here if you have any
# npm test

echo "🚀 Deploying to Netlify..."
npx netlify deploy --prod

echo "✅ Deployment completed!"
echo "Visit your Netlify dashboard to verify the deployment." 