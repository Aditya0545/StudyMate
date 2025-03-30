import { getDriveFileType } from './drive';

/**
 * Format a URL for display by removing protocol and trailing slashes
 */
export function formatUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * Get a display text for a URL based on its type
 */
export function getUrlDisplayText(url: string, urlMetadata?: any): string {
  if (!url) return '';
  
  // Handle Google Docs URLs
  if (url.includes('docs.google.com/document')) {
    return urlMetadata?.title || 'Google Document';
  }
  
  // Handle Google Sheets URLs
  if (url.includes('docs.google.com/spreadsheets')) {
    return urlMetadata?.title || 'Google Spreadsheet';
  }
  
  // Handle Google Slides URLs
  if (url.includes('docs.google.com/presentation')) {
    return urlMetadata?.title || 'Google Slides';
  }
  
  // Handle Google Drive URLs
  if (url.includes('drive.google.com')) {
    return urlMetadata?.title || 'Google Drive File';
  }
  
  // Handle YouTube URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return urlMetadata?.title || 'YouTube Video';
  }
  
  // Default: format the URL for display
  return formatUrl(url);
}

/**
 * Get a resource type label based on the URL
 */
export function getResourceTypeLabel(url: string, urlMetadata?: any): string {
  if (!url) return 'Link';
  
  // Check for specific Google service URLs
  if (url.includes('docs.google.com/document')) {
    return 'Google Doc';
  }
  
  if (url.includes('docs.google.com/spreadsheets')) {
    return 'Google Sheet';
  }
  
  if (url.includes('docs.google.com/presentation')) {
    return 'Google Slides';
  }
  
  if (url.includes('drive.google.com')) {
    if (urlMetadata?.mimeType) {
      return getDriveFileType(urlMetadata.mimeType);
    }
    return 'Google Drive';
  }
  
  // Check for YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YouTube';
  }
  
  // Default to Website
  return 'Website';
}

/**
 * Truncate text to a certain length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format a date string or timestamp
 */
export function formatDate(date: string | number | Date): string {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Generate a random color with good contrast for text
 */
export function generateRandomColor(seed?: string): string {
  if (seed) {
    // Generate a deterministic color based on the seed string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to a hex color
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }
  
  // Random color
  return '#' + Math.floor(Math.random()*16777215).toString(16);
} 