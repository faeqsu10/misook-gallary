export interface Artwork {
  id: string;
  title: string;
  titleEn?: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  category: 'portrait' | 'abstract' | 'drawing';
  status: 'collection' | 'exhibit' | 'inquiry';
  description?: string;
  image: string;
  enhancedImage?: string;
  useEnhanced?: boolean;
  enhancedAt?: string;
  featured?: boolean;
  order: number;
}

export interface Artist {
  name: string;
  nameEn: string;
  bio: string;
  statement: string;
  history: { year: string; content: string }[];
}

export type CategoryFilter = 'all' | Artwork['category'];
export type StatusFilter = 'all' | Artwork['status'];

export const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: '전체',
  portrait: '인물',
  abstract: '추상',
  drawing: '드로잉',
};

export const STATUS_LABELS: Record<StatusFilter, string> = {
  all: '전체',
  collection: '소장용',
  exhibit: '전시 가능',
  inquiry: '문의 가능',
};

export const INQUIRY_TYPE_LABELS = {
  purchase: '작품 구매 문의',
  exhibit: '전시 문의',
  support: '응원 메시지',
} as const;

export type InquiryType = keyof typeof INQUIRY_TYPE_LABELS;
