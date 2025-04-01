export const VALID_RESOURCE_TYPES = ['note', 'link', 'video', 'document', 'command'] as const;
export type ResourceType = typeof VALID_RESOURCE_TYPES[number];

export const VALID_CATEGORIES = [
  'Machine Learning',
  'Web Development',
  'Java',
  'Software Engineering',
  'GDG',
  'Computer Networks',
  'Compiler Design',
  'Other'
] as const;
export type Category = typeof VALID_CATEGORIES[number];

export function isValidResourceType(type: string): type is ResourceType {
  return VALID_RESOURCE_TYPES.includes(type as ResourceType);
}

export function isValidCategory(category: string): category is Category {
  return VALID_CATEGORIES.includes(category as Category);
}

export function validateResource(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate type
  if (!data.type || !isValidResourceType(data.type)) {
    errors.push(`Invalid resource type. Must be one of: ${VALID_RESOURCE_TYPES.join(', ')}`);
  }

  // Validate category
  if (!data.category || !isValidCategory(data.category)) {
    errors.push(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate required fields based on type
  if (data.type === 'link' || data.type === 'video') {
    if (!data.url) {
      errors.push('URL is required for links and videos');
    }
  }

  if (data.type === 'note' || data.type === 'command') {
    if (!data.content) {
      errors.push('Content is required for notes and commands');
    }
  }

  // Validate title
  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 