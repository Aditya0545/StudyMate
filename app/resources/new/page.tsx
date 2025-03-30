'use client';

import { useState } from 'react';
import Link from 'next/link';
import ResourceForm from '@/app/components/ResourceForm';
import PasswordProtection from '@/app/components/PasswordProtection';

// Declaring the environment variables for client-side use
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY?: string;
      NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID?: string;
    }
  }
}

export default function NewResourcePage() {
  const [driveMetadata, setDriveMetadata] = useState<any>(null);
  
  // Function to handle Google Drive file selection using a popup approach
  const handleGoogleDriveSelect = async () => {
    return new Promise((resolve) => {
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID) {
        console.error('Missing required environment variable: NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID');
        alert('Google Drive integration is not properly configured. Please set the NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID environment variable.');
        resolve(null);
        return;
      }
      
      // Create a popup window
      const width = 800;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(window.location.origin + '/drive-callback')}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent('https://www.googleapis.com/auth/drive.readonly.metadata')}`,
        'GoogleDriveAuth',
        `width=${width},height=${height},top=${top},left=${left}`
      );
      
      if (!popup) {
        alert('Popup was blocked. Please allow popups for this site to use Google Drive integration.');
        resolve(null);
        return;
      }
      
      // Set up message listener to receive the callback from the popup
      const messageListener = (event: MessageEvent) => {
        // Make sure the message is from our drive-callback page
        if (event.origin !== window.location.origin || !event.data || event.data.type !== 'DRIVE_FILE_SELECTED') {
          return;
        }
        
        // Remove the event listener
        window.removeEventListener('message', messageListener);
        
        // Close the popup
        if (popup && !popup.closed) {
          popup.close();
        }
        
        // Process the file data
        const fileData = event.data.fileData;
        if (fileData) {
          setDriveMetadata(fileData);
          resolve(fileData);
        } else {
          resolve(null);
        }
      };
      
      // Add the event listener for the message from the popup
      window.addEventListener('message', messageListener);
      
      // Also handle the case where the user closes the popup manually
      const checkClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          resolve(null);
        }
      }, 500);
    });
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
    <PasswordProtection>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link
            href="/resources"
            className="flex items-center text-blue-600 hover:underline dark:text-blue-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back to Resources
          </Link>
          <h1 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">Add New Resource</h1>
        </div>

        {/* Resource Form */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <ResourceForm onGoogleDriveSelect={handleGoogleDriveSelect} />
        </div>
      </div>
    </PasswordProtection>
  );
} 