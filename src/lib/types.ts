export type EnhanceTier = 'corrected' | 'artEnhanced';
export type DisplayVersion = 'original' | 'corrected' | 'artEnhanced';

export interface EnhancementRecord {
  imageUrl: string;
  createdAt: string;
}

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
  altText?: string;
  image: string;
  // Legacy fields (backward compat)
  enhancedImage?: string;
  useEnhanced?: boolean;
  enhancedAt?: string;
  // New 3-tier enhancement
  enhancements?: {
    corrected?: EnhancementRecord;
    artEnhanced?: EnhancementRecord;
  };
  displayVersion?: DisplayVersion;
  featured?: boolean;
  order: number;
}

/** Resolve which image URL to display based on displayVersion */
export function getDisplayImage(artwork: Artwork): string {
  // New model
  if (artwork.displayVersion && artwork.displayVersion !== 'original') {
    const enhancement = artwork.enhancements?.[artwork.displayVersion];
    if (enhancement?.imageUrl) return enhancement.imageUrl;
  }
  // Legacy compat
  if (artwork.useEnhanced && artwork.enhancedImage) {
    return artwork.enhancedImage;
  }
  return artwork.image;
}

/** Label for the current display version */
export function getDisplayLabel(artwork: Artwork): string | null {
  const version = artwork.displayVersion || (artwork.useEnhanced ? 'corrected' : 'original');
  if (version === 'corrected') return '촬영 보정 이미지';
  if (version === 'artEnhanced') return 'AI 감상 버전';
  return null;
}

export const DISPLAY_VERSION_LABELS: Record<DisplayVersion, string> = {
  original: '원본',
  corrected: '촬영 보정',
  artEnhanced: 'AI 감상',
};

export interface Artist {
  name: string;
  nameEn: string;
  bio: string;
  statement: string;
  history: { year: string; content: string }[];
}

export type CategoryFilter = 'all' | Artwork['category'];
export type StatusFilter = 'all' | Artwork['status'];

export const INQUIRY_TYPE_LABELS = {
  purchase: '작품 구매 문의',
  exhibit: '전시 문의',
  support: '응원 메시지',
} as const;

export type InquiryType = keyof typeof INQUIRY_TYPE_LABELS;
