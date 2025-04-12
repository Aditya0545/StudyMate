# ⚠️ WARNING: This code is protected by copyright.

No permission is granted to use, copy, fork, modify, or distribute this code for any purpose without written permission from the author.
Unauthorized use may result in legal action.

# StudyMate - Your Personal Study Companion 🚀

## 🎯 Why You'll Love StudyMate

### Your Digital Study Buddy
- **One-Stop Study Hub**: All your study materials in one place - notes, videos, links, and more
- **Smart Organization**: Never lose track of your study materials again
- **Study Anywhere**: Access your resources from any device, anytime
- **Personalized Learning**: Organize materials your way with custom categories and tags
- **Study Groups**: Share resources with your study buddies

### Key Benefits
- 📚 **Organized Learning**: Keep all your study materials neatly organized
- ⚡ **Quick Access**: Find what you need in seconds with smart search
- 🔒 **Secure Storage**: Keep your private notes safe with password protection
- 📱 **Mobile Friendly**: Study on the go with our responsive design
- 🌙 **Eye-Friendly**: Dark mode support for late-night study sessions

## 💡 Features You'll Love

### 1. Smart Resource Management
- **Multiple Resource Types**
  - 📝 Notes with rich formatting
  - 🎥 YouTube video integration
  - 🔗 Web links with preview
  - 📄 Document storage
  - 💻 Code snippets and commands

- **Intelligent Organization**
  - 🏷️ Custom tags and categories
  - 🔍 Advanced search capabilities
  - 📂 Folder-like organization
  - ⭐ Favorite resources

### 2. Two Ways to Study

#### 🌍 Public Resources
- **Global Study Hub**
  - Browse resources shared by other students
  - Discover new study materials
  - Find resources by subject or topic
  - See what's trending in your field
  - Access resources without login

- **Author Resources**
  - Share your study materials with the world
  - Get feedback from other students
  - Build your study community
  - Help others learn
  - Track your resource popularity

#### 🔒 Private Study Space (My Assets)
- **Personal Lockers**
  - Create password-protected study spaces
  - Keep your private notes secure
  - Organize sensitive materials
  - Access from any device
  - Share with select study partners

- **Locker Features**
  - 🔐 Set your own password
  - 👥 Share with study buddies
  - 📱 Access anywhere, anytime
  - 🔄 Automatic sync
  - 📊 Track your progress

### 3. Modern Study Experience
- **Beautiful Interface**
  - 🎨 Clean, modern design
  - 🌙 Dark/Light mode
  - 📱 Mobile responsive
  - ⚡ Fast performance

- **Smart Features**
  - 🔍 Quick search
  - 📊 Study analytics
  - 📅 Study planning
  - 👥 Study group features

## 🚀 Technology That Works for You

### Frontend Excellence
- **Next.js 14**: Blazing fast performance
- **TypeScript**: Reliable code
- **Tailwind CSS**: Beautiful, responsive design
- **React Query**: Smooth data handling
- **Framer Motion**: Engaging animations

### Backend Power
- **MongoDB**: Secure data storage
- **Node.js**: High-performance backend
- **JWT Security**: Your data is safe
- **Real-time Updates**: Always in sync

## 💰 Value for Students

- **Save Time**: Find materials instantly
- **Stay Organized**: Never lose study resources
- **Study Smarter**: Better organization leads to better learning
- **Collaborate**: Share and learn with friends
- **Access Anywhere**: Study on any device

## 📈 Student Success Stories

### What Students Say
- "StudyMate transformed how I organize my study materials!"
- "Finally, a tool that makes sense of my study chaos!"
- "The best study companion I've ever used!"
- "Helped me ace my exams with better organization"
- "Made group study sessions so much easier"

## 🎓 Getting Started

### Quick Start Guide
1. Sign up for a free account
2. Start adding your study materials
3. Organize with categories and tags
4. Access from any device
5. Share with study groups

## 📞 Need Help?

We're here for you!

- **Visit here**: https://adityakumar.store

go in contact page and drop your query 

## 🔒 Your Privacy Matters

- **Your Data, Your Control**
- **End-to-End Encryption**
- **Regular Backups**
- **Privacy First**
- **No Ads, No Tracking**

## 👥 About Us

StudyMate is created by <b>Aditya Kumar </b>, for students. I understand your study needs because I've been there too.

- **Founder**: Aditya Kumar
- **Website**: [adityakumar.store](https://adityakumar.store)
- **GitHub**: [Aditya0545](https://github.com/Aditya0545)

## 🔧 How It Works

### 1. Frontend Architecture
- **Component-Based Structure**
  - Modular components
  - Reusable UI elements
  - State management
- **Routing System**
  - Dynamic routes
  - Protected routes
  - API routes

### 2. Backend Architecture
- **API Endpoints**
  - RESTful API design
  - CRUD operations
  - Error handling
- **Database Structure**
  - Resource schema
  - User schema
  - Locker schema

### 3. Data Flow
1. User interacts with UI
2. Frontend makes API requests
3. Backend processes requests
4. Database operations performed
5. Response sent to frontend
6. UI updates accordingly

## 💾 Storage Optimization

### 1. MongoDB Storage Strategy
- **URL-Based Storage**
  - Store only URLs and metadata instead of full content
  - Reduces database size and improves performance
  - Enables real-time content updates from source

### 2. Resource Types Optimization
- **Notes**
  - Store only text content
  - Use markdown for formatting
  - No redundant HTML storage

- **Videos**
  - Store only YouTube video IDs
  - Extract and store essential metadata
  - Thumbnails stored as URLs
  - No video content storage

- **Links**
  - Store URL and essential metadata
  - Extract title and description on save
  - No full webpage content storage

- **Documents**
  - Store document URLs
  - Extract and store metadata
  - No document content storage

### 3. Metadata Management
- **Efficient Schema Design**
  - Only essential fields stored
  - Indexed fields for quick search
  - Optimized data types

- **Caching Strategy**
  - Implemented caching for frequently accessed data
  - Reduced database load
  - Improved response times

### 4. Performance Benefits
- **Reduced Storage Requirements**
  - Smaller database size
  - Faster backups
  - Lower hosting costs

- **Improved Performance**
  - Faster queries
  - Reduced memory usage
  - Better scalability

- **Real-time Updates**
  - Content always up-to-date
  - No need for content synchronization
  - Automatic metadata updates

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Lockers
- `GET /api/lockers` - Get all lockers
- `POST /api/lockers` - Create new locker
- `PUT /api/lockers/:id` - Update locker
- `DELETE /api/lockers/:id` - Delete 

## Notes

- The application can run without a YouTube API key, but will use fallback metadata extraction
- For full functionality, configure all the required environment variables

## 🚀 Deployment Guide

### Deploying to Cloudflare Pages

1. **Prerequisites**
   - Cloudflare account
   - GitHub repository with your code
   - MongoDB Atlas account
   - (Optional) YouTube Data API key

2. **Setup MongoDB**
   - Create a new cluster in MongoDB Atlas
   - Set up database access (username/password)
   - Configure network access (allow Cloudflare IPs)
   - Get your connection string

3. **Prepare Environment Variables**
   Create a `.env` file with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. **Create Cloudflare Configuration**
   Create a `wrangler.toml` file in your project root:
   ```toml
   name = "studymate"
   compatibility_date = "2024-04-12"
   main = "src/index.ts"
   ```

5. **Configure Build Settings**
   Create a `cloudflare.json` file in your project root:
   ```json
   {
     "build": {
       "command": "npm run build",
       "publish": ".next",
       "nodeVersion": "18"
     }
   }
   ```

6. **Deploy to Cloudflare Pages**
   - Go to Cloudflare Dashboard
   - Select "Pages" from the sidebar
   - Click "Create a project"
   - Connect your GitHub repository
   - Configure build settings:
     - Framework preset: Next.js
     - Build command: `npm run build`
     - Build output directory: `.next`
     - Node version: 18 (or higher)
   - Add environment variables from your `.env` file
   - Click "Save and Deploy"

7. **Configure Custom Domain** (Optional)
   - In your Cloudflare Pages project
   - Go to "Custom domains"
   - Add your domain
   - Follow the DNS configuration steps

8. **Post-Deployment**
   - Verify your site is working
   - Check MongoDB connection
   - Test all features
   - Monitor performance

### Troubleshooting Common Issues

1. **Build Output Error**
   - Ensure `.next` directory is included in build output
   - Check `next.config.js` for correct output settings
   - Verify build command in Cloudflare Pages settings

2. **Environment Variables**
   - Double-check all environment variables are set
   - Ensure MongoDB connection string is correct
   - Verify YouTube API key if using video features

3. **Database Connection**
   - Check MongoDB Atlas IP whitelist
   - Verify database credentials
   - Ensure network access is properly configured

### Important Notes
- Cloudflare Pages provides free SSL certificates
- Automatic deployments on git push
- Global CDN for fast loading
- Built-in analytics and monitoring
- Free tier includes:
  - 500 builds/month
  - Unlimited sites
  - Unlimited requests
  - 100GB bandwidth
