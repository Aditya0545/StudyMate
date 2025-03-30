@echo off

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