# StudyMate

StudyMate is a web application for organizing and managing your study materials, including notes, videos, links, and documents.

## Features

- Organize study materials with categories and tags
- Support for multiple resource types (notes, links, videos, documents, Google Drive files)
- Password-protected resources section for sensitive content
- Responsive design for all devices
- Dark mode support

## Deployment on Netlify

### Prerequisites

- A GitHub account
- A Netlify account
- A MongoDB Atlas account (for database)
- Google Drive API credentials (for Google Drive integration)
- YouTube API key (for video metadata)

### Step 1: Prepare Environment Variables

In your Netlify dashboard, go to **Site settings > Build & deploy > Environment variables** and add the following variables:

```
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studymate?retryWrites=true&w=majority

# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_STORAGE_BUCKET=your-firebase-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-firebase-app-id

# Google Drive API Configuration
GOOGLE_DRIVE_CLIENT_ID=your-google-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=your-google-api-key

# YouTube API Configuration
YOUTUBE_API_KEY=your-youtube-api-key

# Resources Section Protection
RESOURCES_PASSWORD=your-secure-password
```

### Step 2: Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Deploy the site

### Step 3: Configure Netlify Functions

Netlify Functions are used to handle API routes. The configuration is already set in the `netlify.toml` file.

### Step 4: Add MongoDB Add-on (Optional)

1. Go to **Site settings > Add-ons**
2. Search for and add the MongoDB Atlas add-on if you prefer a managed MongoDB solution

## Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm run start
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# See .env.production for all required variables
```

## Troubleshooting

### API Routes Not Working

- Check that the Netlify functions are deployed correctly
- Verify that MongoDB connection string is correct
- Check Netlify function logs for errors

### Authentication Issues

- Make sure Firebase configuration is correct
- Check that Google Drive API credentials are set up correctly

## License

MIT 