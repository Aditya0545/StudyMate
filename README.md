# StudyMate

StudyMate is a comprehensive study resource management application built with Next.js, MongoDB, and Tailwind CSS. It allows users to organize study materials, add different types of resources, and manage a collection of study content.

## Features

- Resource management (notes, links, YouTube videos, documents)
- Light/dark mode support
- Tag-based organization
- YouTube video integration
- Google Docs/Drive integration
- Responsive design

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Firebase (planned/optional)
- **Deployment**: Vercel

## Deployment to Vercel

### Prerequisites

Before deploying StudyMate to Vercel, you need:

1. A Vercel account
2. A MongoDB Atlas database
3. (Optional) A YouTube API key for enhanced video metadata

### Deployment Steps

1. **Push your code to GitHub**:
   Ensure your code is in a GitHub repository.

2. **Import your project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Log in and click "New Project"
   - Import your GitHub repository
   - Configure project settings

3. **Set up environment variables**:
   Add the following environment variables in the Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `YOUTUBE_API_KEY`: (Optional) Your YouTube API key

4. **Deploy**:
   Click "Deploy" and Vercel will build and deploy your application.

5. **Configure MongoDB Network Access**:
   Ensure your MongoDB Atlas cluster allows connections from Vercel by adding 0.0.0.0/0 to your IP access list in MongoDB Atlas (or use a more restricted range if you prefer).

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   YOUTUBE_API_KEY=your_youtube_api_key (optional)
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Notes

- The application can run without a YouTube API key, but will use fallback metadata extraction
- For full functionality, configure all the required environment variables

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- MongoDB Atlas account
- Firebase project
- YouTube Data API key

### Environment Setup

1. Clone the repository
2. Copy `.env.local.example` to `.env.local`
3. Fill in the required environment variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# YouTube API Configuration
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
```

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

## API Integrations

### Firebase Authentication

This application uses Firebase for user authentication. To set up Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add a web app to your project
3. Enable Authentication and set up the providers you want (Email/Password, Google, etc.)
4. Copy the Firebase configuration to your `.env.local` file

### MongoDB

StudyMate uses MongoDB to store resource data. To set up MongoDB:

1. Create a MongoDB Atlas account and cluster
2. Create a database named `studymate`
3. Add a collection called `resources`
4. Get your connection string and add it to the `.env.local` file

### YouTube API

To enable YouTube video embedding and metadata fetching:

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the YouTube Data API v3
3. Create an API key
4. Add the API key to your `.env.local` file

## Project Structure

```
studymate/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── lib/              # Utility functions
│   └── pages/            # Page components
├── public/               # Static files
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 