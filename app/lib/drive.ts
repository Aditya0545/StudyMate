// Google Drive integration utilities
// This file contains functions for interacting with Google Drive API
// while maintaining minimal database storage usage

/**
 * DriveFileMetadata interface - represents the minimal data we store in our database
 * The actual file content remains in Google Drive
 */
export interface DriveFileMetadata {
  fileId: string;           // Google Drive file ID
  name: string;             // File name
  mimeType: string;         // File MIME type from Drive
  description?: string;     // Optional description
  iconLink?: string;        // Icon URL for the file type
  thumbnailLink?: string;   // Thumbnail image URL (if available)
  webViewLink: string;      // URL to view the file in browser
  embedLink?: string;        // Embed URL for the file
  lastModified: string;     // When the file was last modified in Drive
  size?: string;            // File size in bytes (if available)
  ownerName?: string;        // Owner name
  ownerEmail?: string;       // Owner email
}

// Map of Google MIME types to human-readable labels
const mimeTypeToLabel: Record<string, string> = {
  'application/vnd.google-apps.document': 'Google Doc',
  'application/vnd.google-apps.spreadsheet': 'Google Sheet',
  'application/vnd.google-apps.presentation': 'Google Slides',
  'application/vnd.google-apps.folder': 'Google Folder',
  'application/vnd.google-apps.form': 'Google Form',
  'application/vnd.google-apps.drawing': 'Google Drawing',
  'application/vnd.google-apps.map': 'Google Map',
  'application/vnd.google-apps.site': 'Google Site',
  'application/vnd.google-apps.script': 'Google Apps Script',
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
  'text/plain': 'Text File',
};

/**
 * Convert a Google Drive API file resource to our minimal metadata format
 * This ensures we only store necessary references, not content
 */
export function convertDriveFileToMetadata(file: any): DriveFileMetadata {
  return {
    fileId: file.id,
    name: file.name,
    mimeType: file.mimeType,
    description: file.description || '',
    iconLink: file.iconLink,
    thumbnailLink: file.thumbnailLink,
    webViewLink: file.webViewLink,
    embedLink: getEmbedUrl(file.id, file.mimeType),
    lastModified: file.modifiedTime,
    size: file.size,
    ownerName: file.owners?.[0]?.displayName,
    ownerEmail: file.owners?.[0]?.emailAddress,
  };
}

/**
 * Determine the file type category based on MIME type
 * This helps with categorizing resources by type
 */
export function getDriveFileType(mimeType: string): string {
  return mimeTypeToLabel[mimeType] || 'File';
}

/**
 * Generate an embedded viewer URL for Google Drive files
 * This allows viewing files directly in StudyMate without downloading
 */
export function getEmbedUrl(fileId: string, mimeType: string): string {
  switch (mimeType) {
    case 'application/vnd.google-apps.document':
      return `https://docs.google.com/document/d/${fileId}/preview`;
    case 'application/vnd.google-apps.spreadsheet':
      return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
    case 'application/vnd.google-apps.presentation':
      return `https://docs.google.com/presentation/d/${fileId}/embed`;
    case 'application/vnd.google-apps.form':
      return `https://docs.google.com/forms/d/${fileId}/viewform`;
    case 'application/vnd.google-apps.drawing':
      return `https://docs.google.com/drawings/d/${fileId}/view`;
    case 'application/vnd.google-apps.folder':
      return `https://drive.google.com/drive/folders/${fileId}`;
    case 'application/pdf':
      return `https://drive.google.com/file/d/${fileId}/preview`;
    default:
      return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}

/**
 * Generate a direct download URL for Google Drive files
 * Use sparingly as this can count against Drive quota
 */
export function getDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Create a Google Drive link object for storing in the database
 * This uses minimal storage while maintaining all necessary reference info
 */
export function createDriveResourceLink(metadata: DriveFileMetadata): string {
  return `drive:${metadata.fileId}`;
}

/**
 * Check if a file is a Google Drive native document (Doc, Sheet, Slide, etc.)
 */
export function isGoogleNativeFile(mimeType: string): boolean {
  return mimeType.startsWith('application/vnd.google-apps.');
}

/**
 * Get the appropriate icon for a Google Drive file based on its MIME type
 */
export function getDriveFileIcon(mimeType: string): string {
  switch (mimeType) {
    case 'application/vnd.google-apps.document':
      return '/icons/google-docs.svg';
    case 'application/vnd.google-apps.spreadsheet':
      return '/icons/google-sheets.svg';
    case 'application/vnd.google-apps.presentation':
      return '/icons/google-slides.svg';
    case 'application/vnd.google-apps.form':
      return '/icons/google-forms.svg';
    case 'application/vnd.google-apps.drawing':
      return '/icons/google-drawings.svg';
    case 'application/pdf':
      return '/icons/pdf.svg';
    default:
      return '/icons/file.svg';
  }
} 