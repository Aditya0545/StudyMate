export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'note' | 'link' | 'video' | 'document' | 'command';
  url?: string;
  content?: string;
  tags: string[];
  categories: string[];
  videoMetadata?: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
  };
  createdAt: string;
  updatedAt: string;
} 