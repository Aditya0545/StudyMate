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

// Fetch video metadata from YouTube API if API key is available
// Otherwise extract basic information from video ID
export async function getVideoMetadata(url: string) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    console.warn('Invalid YouTube URL provided');
    return null;
  }
  
  // Check if YouTube API key is configured
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.warn('YouTube API key is not configured, using fallback method');
    // Return basic metadata without API call
    return {
      id: videoId,
      title: `YouTube Video (${videoId})`,
      description: 'Video description not available (API key not configured)',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      channelTitle: 'Unknown Channel',
      publishedAt: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn('No video found with the provided ID');
      return null;
    }
    
    const videoData = data.items[0].snippet;
    
    return {
      id: videoId,
      title: videoData.title,
      description: videoData.description,
      thumbnail: videoData.thumbnails.high?.url || videoData.thumbnails.default?.url,
      channelTitle: videoData.channelTitle,
      publishedAt: videoData.publishedAt,
    };
  } catch (error) {
    console.error('Error fetching YouTube video metadata:', error);
    // Return basic metadata as fallback on error
    return {
      id: videoId,
      title: `YouTube Video (${videoId})`,
      description: 'Video description not available (API error)',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      channelTitle: 'Unknown Channel',
      publishedAt: new Date().toISOString(),
    };
  }
}

// Utility function to create an embedded player URL
export function createEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
} 