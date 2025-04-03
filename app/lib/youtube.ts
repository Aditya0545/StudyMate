interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

// Functions to work with YouTube videos

// Extract YouTube video ID from URL
export function extractVideoId(url: string): string | null {
  if (!url) return null;
  
  // Check for various YouTube URL formats
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube\.com\/user\/[^\/]+\/[^\/]+\/|youtube\.com\/[^\/]+\/[^\/]+\/|youtube\.com\/verify_age\?next_url=\/watch%3Fv%3D|youtube\.com\/get_video_info\?.*video_id=)([^#\&\?\n\/]+)/,
    /(?:youtube\.com\/shorts\/)([^#\&\?\n\/]+)/
  ];
  
  for (const pattern of regexPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Fetch video metadata using our API route
export async function getVideoMetadata(url: string): Promise<YoutubeVideo | null> {
  if (!url) return null;

  try {
    const response = await fetch(`/api/youtube?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching video metadata:', error);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return null;
  }
}

// Utility function to create an embedded player URL
export function createEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
} 