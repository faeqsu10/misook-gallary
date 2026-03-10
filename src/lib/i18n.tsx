'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type Locale = 'ko' | 'en';

const translations = {
  ko: {
    // Header
    gallery: '갤러리',
    about: '작가 소개',
    contact: '문의',
    // Home
    heroTitle: '오래 품어온\n선과 형태를\n다시 세상에 놓습니다.',
    heroSub: '지금도 여전히, 그리고 다시, 그리는 사람.',
    heroSubSuffix: '의 작품 세계를 만나보세요.',
    viewWorks: '작품 보기',
    featuredWorks: '주요 작품',
    viewAll: '전체 보기',
    artistStatement: '작가 소개',
    // Gallery
    galleryTitle: 'Gallery',
    galleryCount: (n: number) => `${n}점의 작품을 감상하세요.`,
    galleryFiltered: (n: number) => `${n}점의 작품이 선택되었습니다.`,
    noResults: '해당 조건의 작품이 없습니다.',
    searchPlaceholder: '작품 제목, 재료로 검색',
    loadMore: (n: number) => `더 보기 (${n}점 남음)`,
    // Filters
    all: '전체',
    portrait: '인물',
    abstract: '추상',
    drawing: '드로잉',
    collection: '소장용',
    exhibit: '전시 가능',
    inquiry: '문의 가능',
    // Work detail
    year: '제작연도',
    medium: '재료',
    dimensions: '크기',
    category: '분류',
    status: '상태',
    contactInquiry: '문의하기',
    share: '공유',
    linkCopied: '링크가 복사되었습니다.',
    slideshow: '슬라이드쇼',
    compareView: '비교 보기',
    normalView: '일반 보기',
    originalLabel: '원본',
    enhancedLabel: '보정',
    backToGallery: '갤러리',
    artworkNotFound: '작품을 찾을 수 없습니다',
    // Contact
    contactTitle: '문의',
    contactDesc: '작품에 관심이 있으시거나, 전시 제안, 혹은 따뜻한 응원을 보내주시면 감사하겠습니다.',
    name: '이름',
    email: '이메일',
    inquiryType: '문의 유형',
    relatedWork: '관련 작품',
    message: '메시지',
    send: '문의 보내기',
    sending: '전송 중...',
    thankYou: '감사합니다',
    inquiryReceived: '문의가 접수되었습니다.',
    thankMessage: '소중한 관심에 감사드립니다.',
    newInquiry: '새 문의 작성',
    purchaseInquiry: '작품 구매 문의',
    exhibitInquiry: '전시 문의',
    supportMessage: '응원 메시지',
    // About
    aboutTitle: '작가 소개',
    workNote: '작업 노트',
    fromWorkNote: '작업 노트에서',
    timeline: '연보',
    aboutCta: '작품에 대해 궁금하신 점이 있으시면',
    aboutInquiry: '문의하기',
    homeQuote: '구조 안에서 자유를 찾고, 질서 위에 감정을 놓습니다.',
    aboutQuote: '다시 그리기로 했습니다.',
    // Contact page
    contactPageDesc: '작품이 마음에 닿았다면 조용히 문의를 남겨주세요.',
    contactPageDetail: '작품 구매, 전시, 혹은 따뜻한 응원 — 모든 메시지를 소중히 읽겠습니다.',
    // Filter labels
    filterCategory: '분류',
    filterStatus: '상태',
    // Error messages
    rateLimitError: (n: number) => `잠시 후 다시 시도해주세요. (약 ${n}분 후)`,
    nameTooLong: '이름은 100자 이하로 입력해주세요.',
    messageTooLong: '메시지는 5000자 이하로 입력해주세요.',
    submitError: '문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
    // Guestbook
    guestbookTitle: '방명록',
    guestbookDesc: '작품을 감상하신 소감을 남겨주세요.',
    guestbookName: '이름',
    guestbookMessage: '한마디',
    guestbookSubmit: '남기기',
    guestbookSubmitting: '전송 중...',
    guestbookThanks: '감사합니다. 관리자 승인 후 공개됩니다.',
    guestbookEmpty: '아직 남겨진 글이 없습니다. 첫 방명록을 남겨보세요.',
    guestbookError: '전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
    // Centralized label maps
    categoryLabels: { all: '전체', portrait: '인물', abstract: '추상', drawing: '드로잉' } as Record<string, string>,
    statusLabels: { all: '전체', collection: '소장용', exhibit: '전시 가능', inquiry: '문의 가능' } as Record<string, string>,
    // Footer
    footerRights: '모든 작품의 저작권은 작가에게 있습니다.',
  },
  en: {
    gallery: 'Gallery',
    about: 'About',
    contact: 'Contact',
    heroTitle: 'Lines and forms\nheld close for so long,\nnow placed back into the world.',
    heroSub: 'Still drawing, again and always.',
    heroSubSuffix: "'s world of art.",
    viewWorks: 'View Works',
    featuredWorks: 'Featured Works',
    viewAll: 'View All',
    artistStatement: 'About the Artist',
    galleryTitle: 'Gallery',
    galleryCount: (n: number) => `Explore ${n} artworks.`,
    galleryFiltered: (n: number) => `${n} artworks selected.`,
    noResults: 'No artworks match the filter.',
    searchPlaceholder: 'Search by title or medium',
    loadMore: (n: number) => `Load More (${n} remaining)`,
    all: 'All',
    portrait: 'Portrait',
    abstract: 'Abstract',
    drawing: 'Drawing',
    collection: 'Collection',
    exhibit: 'Available for Exhibition',
    inquiry: 'Inquiries Welcome',
    year: 'Year',
    medium: 'Medium',
    dimensions: 'Size',
    category: 'Category',
    status: 'Status',
    contactInquiry: 'Inquire',
    share: 'Share',
    linkCopied: 'Link copied.',
    slideshow: 'Slideshow',
    compareView: 'Compare',
    normalView: 'Normal View',
    originalLabel: 'Original',
    enhancedLabel: 'Enhanced',
    backToGallery: 'Gallery',
    artworkNotFound: 'Artwork not found',
    contactTitle: 'Contact',
    contactDesc: 'If you are interested in a work, have an exhibition proposal, or simply wish to send words of encouragement.',
    name: 'Name',
    email: 'Email',
    inquiryType: 'Inquiry Type',
    relatedWork: 'Related Work',
    message: 'Message',
    send: 'Send Inquiry',
    sending: 'Sending...',
    thankYou: 'Thank You',
    inquiryReceived: 'Your inquiry has been received.',
    thankMessage: 'We appreciate your interest.',
    newInquiry: 'New Inquiry',
    purchaseInquiry: 'Purchase Inquiry',
    exhibitInquiry: 'Exhibition Inquiry',
    supportMessage: 'Words of Support',
    aboutTitle: 'About the Artist',
    workNote: 'Artist Statement',
    fromWorkNote: 'from Artist Statement',
    timeline: 'Timeline',
    aboutCta: 'If you have questions about the works',
    aboutInquiry: 'Contact',
    homeQuote: 'Finding freedom within structure, placing emotion upon order.',
    aboutQuote: 'I decided to draw again.',
    contactPageDesc: 'If an artwork speaks to you, feel free to leave an inquiry.',
    contactPageDetail: 'Purchase, exhibition, or a warm message of support — every message is read with care.',
    filterCategory: 'Category',
    filterStatus: 'Status',
    rateLimitError: (n: number) => `Please try again later. (in about ${n} min)`,
    nameTooLong: 'Name must be 100 characters or less.',
    messageTooLong: 'Message must be 5000 characters or less.',
    submitError: 'Failed to send. Please try again later.',
    guestbookTitle: 'Guestbook',
    guestbookDesc: 'Share your thoughts after viewing the works.',
    guestbookName: 'Name',
    guestbookMessage: 'Message',
    guestbookSubmit: 'Submit',
    guestbookSubmitting: 'Sending...',
    guestbookThanks: 'Thank you. Your message will be displayed after approval.',
    guestbookEmpty: 'No messages yet. Be the first to leave one.',
    guestbookError: 'Failed to send. Please try again later.',
    categoryLabels: { all: 'All', portrait: 'Portrait', abstract: 'Abstract', drawing: 'Drawing' } as Record<string, string>,
    statusLabels: { all: 'All', collection: 'Collection', exhibit: 'Available for Exhibition', inquiry: 'Inquiries Welcome' } as Record<string, string>,
    footerRights: 'All artworks are copyrighted by the artist.',
  },
} as const;

type TranslationStrings = typeof translations.ko;
type Translations = {
  [K in keyof TranslationStrings]: TranslationStrings[K] extends (...args: infer A) => infer R
    ? (...args: A) => R
    : TranslationStrings[K] extends Record<string, string>
    ? Record<string, string>
    : string;
};

interface I18nContextType {
  locale: Locale;
  t: Translations;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'ko',
  t: translations.ko,
  toggleLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('locale') as Locale) || 'ko';
    }
    return 'ko';
  });

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      localStorage.setItem('locale', next);
      return next;
    });
  }, []);

  const t = translations[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
