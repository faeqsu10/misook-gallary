'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage, createArtwork } from '@/lib/artworks-db';
import { Artwork } from '@/lib/types';
import AdminShell from '@/components/AdminShell';

const CATEGORIES = [
  { value: 'portrait', label: '인물' },
  { value: 'abstract', label: '추상' },
  { value: 'drawing', label: '드로잉' },
] as const;

const STATUSES = [
  { value: 'inquiry', label: '문의 가능' },
  { value: 'exhibit', label: '전시 가능' },
  { value: 'collection', label: '소장용' },
] as const;

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [year, setYear] = useState('');
  const [medium, setMedium] = useState('');
  const [category, setCategory] = useState<Artwork['category']>('abstract');
  const [status, setStatus] = useState<Artwork['status']>('inquiry');
  const [description, setDescription] = useState('');
  const [altText, setAltText] = useState('');
  const [order, setOrder] = useState(1);
  const [featured, setFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function validateFile(f: File): string | null {
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(f.type)) {
      return '허용되지 않는 파일 형식입니다. (JPG, PNG, WebP만 가능)';
    }
    if (f.size > MAX_SIZE) {
      return '파일 크기가 10MB를 초과합니다.';
    }
    return null;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('이미지를 선택해주세요.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const slug = title
        .replace(/[^가-힣a-zA-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase() || `artwork-${Date.now()}`;

      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${slug}.${ext}`;
      const imageUrl = await uploadImage(file, filename);

      await createArtwork({
        id: slug,
        title,
        titleEn: titleEn || undefined,
        year: year || undefined,
        medium: medium || undefined,
        category,
        status,
        description: description || undefined,
        altText: altText || undefined,
        image: imageUrl,
        featured,
        order,
      });

      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell title="새 작품 등록">
      <main className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-xs tracking-wider text-muted mb-2">작품 이미지 *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-muted transition-colors cursor-pointer p-8 text-center"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="미리보기" className="max-h-80 mx-auto" />
              ) : (
                <div className="text-muted">
                  <p className="text-sm">클릭하여 이미지를 선택하세요</p>
                  <p className="text-xs mt-1">JPG, PNG 지원</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">제목 (한글) *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="예: 마녀"
                className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">제목 (영문)</label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="예: Witch"
                className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text"
              />
            </div>
          </div>

          {/* Year & Medium */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">제작년도</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="예: 2026"
                className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">재료</label>
              <input
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="예: 마커, 색연필"
                className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">카테고리 *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Artwork['category'])}
                className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">상태 *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Artwork['status'])}
                className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs tracking-wider text-muted mb-1">작품 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="작품에 대한 간단한 설명"
              className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text resize-none"
            />
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-xs tracking-wider text-muted mb-1">대체 텍스트 (접근성)</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="시각 장애인을 위한 작품 설명 (미입력 시 제목 사용)"
              className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text"
            />
          </div>

          {/* Order & Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">표시 순서</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text"
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">홈 대표작으로 표시</span>
              </label>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-text text-bg text-sm tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '작품 등록'}
          </button>
        </form>
      </main>
    </AdminShell>
  );
}
