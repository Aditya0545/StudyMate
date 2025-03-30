#!/bin/bash

# StudyMate Netlify Deployment Script

echo "📦 Building StudyMate for production..."
npm run build

echo "🧪 Running tests..."
# Add your tests here if you have any
# npm test

echo "🚀 Deploying to Netlify..."
npx netlify deploy --prod

echo "✅ Deployment completed!"
echo "Visit your Netlify dashboard to verify the deployment." 