'use client';

import { useEffect, useState } from 'react';
import PasswordProtection from '@/app/components/PasswordProtection';

// Add type definitions for Google Picker API
declare global {
  interface Window {
    gapi: any;
    google: {
      picker: {
        View: any;
        ViewId: {
          DOCS: string;
        };
        PickerBuilder: any;
        Feature: {
          NAV_HIDDEN: string;
        };
        Action: {
          PICKED: string;
          CANCEL: string;
        };
      }
    }
  }
}

export default function DriveCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    try {
      // Extract access token from URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      
      if (!accessToken) {
        setStatus('error');
        setMessage('No access token received from Google. Authentication failed.');
        return;
      }
      
      // Function to get file metadata from Google Drive
      const pickDriveFile = async (token: string) => {
        // Load the Google Drive Picker API
        if (typeof window === 'undefined' || !window.gapi) {
          setStatus('error');
          setMessage('Google API client not loaded');
          return;
        }
        
        // Wait for the Google object to be available
        if (typeof window.google === 'undefined' || !window.google.picker) {
          setStatus('error');
          setMessage('Google Picker API not loaded');
          return;
        }

        // Create a picker
        try {
          const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
          const picker = new window.google.picker.PickerBuilder()
            .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
            .setOAuthToken(token)
            .addView(view)
            .setCallback((data: any) => {
              if (data.action === window.google.picker.Action.PICKED) {
                const document = data.docs[0];
                const fileId = document.id;
                
                // Get additional metadata
                fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,thumbnailLink,webViewLink`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                })
                  .then(response => response.json())
                  .then(metadata => {
                    // Create a complete file metadata object
                    const fileData = {
                      fileId: metadata.id,
                      name: metadata.name,
                      mimeType: metadata.mimeType,
                      thumbnailLink: metadata.thumbnailLink,
                      webViewLink: metadata.webViewLink,
                      embedLink: getEmbedUrl(metadata.id, metadata.mimeType)
                    };
                    
                    // Send message to parent window
                    if (window.opener) {
                      window.opener.postMessage({
                        type: 'DRIVE_FILE_SELECTED',
                        fileData
                      }, window.location.origin);
                    }
                    
                    setStatus('success');
                    setMessage('File selected successfully. You can close this window.');
                    
                    // Auto close window after a delay
                    setTimeout(() => {
                      window.close();
                    }, 2000);
                  })
                  .catch(error => {
                    console.error('Error fetching file metadata:', error);
                    setStatus('error');
                    setMessage('Error getting file metadata: ' + error.message);
                  });
              } else if (data.action === window.google.picker.Action.CANCEL) {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'DRIVE_FILE_SELECTED',
                    fileData: null
                  }, window.location.origin);
                }
                
                setStatus('success');
                setMessage('Selection cancelled. You can close this window.');
                
                // Auto close window after a delay
                setTimeout(() => {
                  window.close();
                }, 2000);
              }
            })
            .build();
            
          picker.setVisible(true);
        } catch (error) {
          console.error('Error creating picker:', error);
          setStatus('error');
          setMessage('Error creating Google Picker: ' + (error as Error).message);
        }
      };
      
      // Helper function to get embed URL
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
      
      // Load the Google Picker API
      const loadGooglePickerAPI = () => {
        if (typeof window === 'undefined' || !window.gapi) {
          setStatus('error');
          setMessage('Google API not available');
          return;
        }
        
        // Load the Google Picker API
        window.gapi.load('picker', () => {
          try {
            pickDriveFile(accessToken);
          } catch (error) {
            console.error('Error loading picker:', error);
            setStatus('error');
            setMessage('Error loading Google Picker: ' + (error as Error).message);
          }
        });
      };
      
      // Load the Google API Client
      if (typeof window !== 'undefined') {
        if (!window.gapi) {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => {
            window.gapi.load('client:auth', () => {
              // Load the picker after client auth is loaded
              loadGooglePickerAPI();
            });
          };
          script.onerror = () => {
            setStatus('error');
            setMessage('Failed to load Google API client');
          };
          document.body.appendChild(script);
        } else {
          loadGooglePickerAPI();
        }
      }
      
    } catch (error) {
      console.error('Error in callback handler:', error);
      setStatus('error');
      setMessage('An error occurred during authentication: ' + (error as Error).message);
    }
  }, []);

  return (
    <PasswordProtection>
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-gray-800">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Google Drive Integration
          </h1>
          
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
              <p className="text-center text-gray-600 dark:text-gray-300">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center">
              <svg 
                className="mx-auto h-12 w-12 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center">
              <svg 
                className="mx-auto h-12 w-12 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
              <p className="mt-4 text-red-600 dark:text-red-400">{message}</p>
              <button
                onClick={() => window.close()}
                className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </PasswordProtection>
  );
} 