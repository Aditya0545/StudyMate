import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { convertDriveFileToMetadata, DriveFileMetadata } from '@/app/lib/drive';

// Create a Google OAuth2 client
function getOAuth2Client() {
  const credentials = {
    client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
    client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
  };
  
  const oauth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uri
  );
  
  return oauth2Client;
}

// GET route for fetching drive files or a specific file
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  const accessToken = searchParams.get('accessToken');
  const query = searchParams.get('query') || '';
  const mimeType = searchParams.get('mimeType');
  
  // Check if we have an access token
  if (!accessToken) {
    return NextResponse.json({ error: 'Access token is required' }, { status: 401 });
  }
  
  try {
    // Set up the Drive API client with the access token
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
      params: {
        key: process.env.GOOGLE_DRIVE_CLIENT_SECRET
      }
    });
    
    // If fileId is provided, get a specific file
    if (fileId) {
      const response = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, description, iconLink, thumbnailLink, webViewLink, modifiedTime, size, owners'
      });
      
      const file = response.data;
      const metadata = convertDriveFileToMetadata(file);
      
      return NextResponse.json({ file: metadata });
    }
    
    // Otherwise, search for files based on query
    let searchQuery = '';
    if (query) {
      searchQuery = `name contains '${query}'`;
    }
    if (mimeType) {
      searchQuery += searchQuery ? ` and mimeType='${mimeType}'` : `mimeType='${mimeType}'`;
    }
    
    const response = await drive.files.list({
      q: searchQuery || "trashed=false",
      pageSize: 20,
      fields: 'files(id, name, mimeType, description, iconLink, thumbnailLink, webViewLink, modifiedTime, size, owners)'
    });
    
    const files = response.data.files?.map(file => convertDriveFileToMetadata(file)) || [];
    
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('Error fetching Drive files:', error);
    
    // Handle authentication errors
    if (error.code === 401 || (error.response && error.response.status === 401)) {
      return NextResponse.json({ error: 'Authentication failed. Please sign in again.' }, { status: 401 });
    }
    
    // Handle Drive API errors
    if (error.response && error.response.data && error.response.data.error) {
      return NextResponse.json({ 
        error: error.response.data.error.message || 'Drive API error' 
      }, { status: error.response.status || 500 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch drive files' }, { status: 500 });
  }
}

// POST route for adding a Drive file as a resource
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileId, accessToken } = body;
    
    if (!fileId || !accessToken) {
      return NextResponse.json({ error: 'File ID and access token are required' }, { status: 400 });
    }
    
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
      params: {
        key: process.env.GOOGLE_DRIVE_CLIENT_SECRET
      }
    });
    
    // Get file metadata
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, description, iconLink, thumbnailLink, webViewLink, modifiedTime, size, owners'
    });
    
    const file = response.data;
    const metadata = convertDriveFileToMetadata(file);
    
    return NextResponse.json({ file: metadata });
  } catch (error: any) {
    console.error('Error getting Drive file metadata:', error);
    
    // Handle authentication errors
    if (error.code === 401 || (error.response && error.response.status === 401)) {
      return NextResponse.json({ error: 'Authentication failed. Please sign in again.' }, { status: 401 });
    }
    
    // Handle Drive API errors
    if (error.response && error.response.data && error.response.data.error) {
      return NextResponse.json({ 
        error: error.response.data.error.message || 'Drive API error' 
      }, { status: error.response.status || 500 });
    }
    
    return NextResponse.json({ error: 'Failed to get file metadata' }, { status: 500 });
  }
} 