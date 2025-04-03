import { NextResponse } from 'next/server';

// Helper function to get first sentence or line
function getFirstSentenceOrLine(text: string): string {
  if (!text) return '';
  
  // Try to get first sentence (ending with . ! or ?)
  const sentenceMatch = text.match(/^[^.!?]+[.!?]/);
  if (sentenceMatch) {
    return sentenceMatch[0].trim();
  }
  
  // If no sentence found, get first line
  const firstLine = text.split('\n')[0];
  
  // Limit to reasonable length if it's too long
  if (firstLine.length > 150) {
    return firstLine.substring(0, 147) + '...';
  }
  
  return firstLine.trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');
  
  if (!videoUrl) {
    return NextResponse.json(
      { error: 'Video URL is required' },
      { status: 400 }
    );
  }

  // Extract video ID from URL
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return NextResponse.json(
      { error: 'Invalid YouTube URL' },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YouTube API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const videoData = data.items[0].snippet;
    return NextResponse.json({
      id: videoId,
      title: videoData.title,
      description: getFirstSentenceOrLine(videoData.description),
      thumbnail: videoData.thumbnails.high?.url || videoData.thumbnails.default?.url,
      channelTitle: videoData.channelTitle,
      publishedAt: videoData.publishedAt,
    });
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video data' },
      { status: 500 }
    );
  }
}

// Helper function to extract video ID
function extractVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube\.com\/user\/[^\/]+\/[^\/]+\/|youtube\.com\/[^\/]+\/[^\/]+\/|youtube\.com\/verify_age\?next_url=\/watch%3Fv%3D|youtube\.com\/get_video_info\?.*video_id=)([^#\&\?\n\/]+)/,
    /(?:youtube\.com\/shorts\/)([^#\&\?\n\/]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
} 