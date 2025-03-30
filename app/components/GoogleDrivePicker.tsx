'use client';

import { useState } from 'react';

// Define props for functional component
interface GoogleDrivePickerProps {
  onSelect: (fileMetadata: any) => void;
  onCancel?: () => void;
}

// Add interface for Google Picker API data
interface GooglePickerResponse {
  action: string;
  docs: Array<{
    id: string;
    name: string;
    mimeType: string;
    description?: string;
    iconUrl?: string;
    thumbnailUrl?: string;
    url?: string;
    embeddedUrl?: string;
    sizeBytes?: number;
    lastEditedUtc?: number;
  }>;
  viewToken?: string[];
}

export default function GoogleDrivePicker({ onSelect, onCancel }: GoogleDrivePickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const openPicker = () => {
    setIsLoading(true);
    
    // Check if the window object is available (client-side)
    if (typeof window === 'undefined') return;
    
    // Load the Google API client script
    const loadGoogleApi = () => {
      return new Promise<void>((resolve, reject) => {
        // First, load the Google API JavaScript client
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/platform.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          // After loading platform.js, load auth2 and picker API
          window.gapi.load('auth2:picker', () => {
            resolve();
          });
        };
        script.onerror = () => {
          setIsLoading(false);
          console.error('Failed to load Google API script');
          reject();
        };
        
        document.body.appendChild(script);
      });
    };
    
    // Initialize Google auth and show picker
    const initAuthAndShowPicker = async () => {
      try {
        // Initialize the auth library
        await window.gapi.auth2.init({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID
        });
        
        // Get auth instance
        const authInstance = window.gapi.auth2.getAuthInstance();
        
        // Check if user is already signed in
        if (!authInstance.isSignedIn.get()) {
          try {
            // Sign in the user
            await authInstance.signIn({
              scope: 'https://www.googleapis.com/auth/drive.readonly'
            });
          } catch (error) {
            console.error('Google authentication error:', error);
            setIsLoading(false);
            if (onCancel) onCancel();
            return;
          }
        }
        
        // Get the OAuth token
        const authResponse = authInstance.currentUser.get().getAuthResponse();
        const accessToken = authResponse.access_token;
        
        // Load the picker API
        window.gapi.load('picker', () => {
          // Create the picker views
          const view = new window.gapi.picker.View(window.gapi.picker.ViewId.DOCS);
          view.setMimeTypes('application/vnd.google-apps.document,application/vnd.google-apps.spreadsheet,application/vnd.google-apps.presentation,application/pdf,image/jpeg,image/png');
          
          // Create and render the picker
          const picker = new window.gapi.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(accessToken)
            .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY)
            .setCallback((data: GooglePickerResponse) => {
              if (data.action === 'picked') {
                const document = data.docs[0];
                const fileMetadata = {
                  fileId: document.id,
                  mimeType: document.mimeType,
                  name: document.name,
                  description: document.description || '',
                  iconLink: document.iconUrl,
                  thumbnailLink: document.iconUrl,
                  webViewLink: document.url,
                  embedLink: getEmbedUrl(document.id, document.mimeType),
                  lastModified: new Date().toISOString(),
                };
                
                setIsLoading(false);
                onSelect(fileMetadata);
              } else if (data.action === 'cancel') {
                setIsLoading(false);
                if (onCancel) onCancel();
              }
            })
            .setSize(800, 600)
            .build();
            
          picker.setVisible(true);
        });
      } catch (error) {
        console.error('Error in Google Drive picker:', error);
        setIsLoading(false);
        if (onCancel) onCancel();
      }
    };
    
    // Start the process
    loadGoogleApi().then(initAuthAndShowPicker);
  };
  
  // Helper function to get embed URL based on file type
  const getEmbedUrl = (fileId: string, mimeType: string): string => {
    switch (mimeType) {
      case 'application/vnd.google-apps.document':
        return `https://docs.google.com/document/d/${fileId}/preview`;
      case 'application/vnd.google-apps.spreadsheet':
        return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
      case 'application/vnd.google-apps.presentation':
        return `https://docs.google.com/presentation/d/${fileId}/embed`;
      case 'application/vnd.google-apps.form':
        return `https://docs.google.com/forms/d/${fileId}/viewform`;
      case 'application/pdf':
      default:
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  };

  return (
    <button
      type="button"
      onClick={openPicker}
      disabled={isLoading}
      className="flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span>
      ) : (
        <svg className="mr-2 h-5 w-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
          <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
          <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
          <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
          <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
          <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
        </svg>
      )}
      Select from Google Drive
    </button>
  );
}

// Declaring global types
declare global {
  interface Window {
    gapi: any;
  }
} 