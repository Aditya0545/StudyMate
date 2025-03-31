@echo off

echo 📋 Setting up environment variables...
REM Create a .env.production.local file from environment variables
echo # MongoDB Configuration > .env.production.local
echo MONGODB_URI=%MONGODB_URI% >> .env.production.local
echo. >> .env.production.local
echo # Firebase Configuration >> .env.production.local
echo FIREBASE_API_KEY=%FIREBASE_API_KEY% >> .env.production.local
echo FIREBASE_AUTH_DOMAIN=%FIREBASE_AUTH_DOMAIN% >> .env.production.local
echo FIREBASE_PROJECT_ID=%FIREBASE_PROJECT_ID% >> .env.production.local
echo FIREBASE_STORAGE_BUCKET=%FIREBASE_STORAGE_BUCKET% >> .env.production.local
echo FIREBASE_MESSAGING_SENDER_ID=%FIREBASE_MESSAGING_SENDER_ID% >> .env.production.local
echo FIREBASE_APP_ID=%FIREBASE_APP_ID% >> .env.production.local
echo. >> .env.production.local
echo # Google Drive API Configuration >> .env.production.local
echo GOOGLE_DRIVE_CLIENT_ID=%GOOGLE_DRIVE_CLIENT_ID% >> .env.production.local
echo GOOGLE_DRIVE_CLIENT_SECRET=%GOOGLE_DRIVE_CLIENT_SECRET% >> .env.production.local
echo # Client-side accessible variables >> .env.production.local
echo NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=%NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID% >> .env.production.local
echo NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=%NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY% >> .env.production.local
echo. >> .env.production.local
echo # YouTube API Configuration >> .env.production.local
echo YOUTUBE_API_KEY=%YOUTUBE_API_KEY% >> .env.production.local
echo. >> .env.production.local
echo # Resources Section Protection >> .env.production.local
echo RESOURCES_PASSWORD=%RESOURCES_PASSWORD% >> .env.production.local

echo 📦 Building StudyMate for production...
call npm run build

echo 🧪 Running tests...
REM Add your tests here if you have any
REM call npm test

echo 🚀 Deploying to Netlify...
call npx netlify deploy --prod

echo ✅ Deployment completed!
echo Visit your Netlify dashboard to verify the deployment.

pause 