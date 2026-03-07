'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchArtwork, updateArtwork, uploadImage } from '@/lib/artworks-db';
import { Artwork } from '@/lib/types';
import Link from 'next/link';

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

export default function EditPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const artworkId = params.id as string;
  const fileRef = useRef<HTMLInputElement>(null);

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [fetching, setFetching] = useState(true);
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [year, setYear] = useState('');
  const [medium, setMedium] = useState('');
  const [category, setCategory] = useState<Artwork['category']>('abstract');
  const [status, setStatus] = useState<Artwork['status']>('inquiry');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);
  const [featured, setFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && artworkId) {
      loadArtwork();
    }
  }, [user, artworkId]);

  async function loadArtwork() {
    setFetching(true);
    try {
      const data = await fetchArtwork(artworkId);
      if (!data) {
        router.push('/admin/dashboard');
        return;
      }
      setArtwork(data);
      setTitle(data.title);
      setTitleEn(data.titleEn || '');
      setYear(data.year || '');
      setMedium(data.medium || '');
      setCategory(data.category);
      setStatus(data.status);
      setDescription(data.description || '');
      setOrder(data.order);
      setFeatured(data.featured || false);
      setPreview(data.image);
    } catch (err) {
      console.error('Failed to load artwork:', err);
    } finally {
      setFetching(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let imageUrl = artwork?.image || '';

      if (file) {
        const slug = artworkId;
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${slug}-${Date.now()}.${ext}`;
        imageUrl = await uploadImage(file, filename);
      }

      await updateArtwork(artworkId, {
        title,
        titleEn: titleEn || undefined,
        year: year || undefined,
        medium: medium || undefined,
        category,
        status,
        description: description || undefined,
        image: imageUrl,
        featured,
        order,
      });

      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Update failed:', err);
      setError('수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !user || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-muted hover:text-text transition-colors text-sm">
            ← 돌아가기
          </Link>
          <h1 className="font-serif text-lg">작품 수정</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image */}
          <div>
            <label className="block text-xs tracking-wider text-muted mb-2">작품 이미지</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-muted transition-colors cursor-pointer p-8 text-center"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="미리보기" className="max-h-80 mx-auto" />
              ) : (
                <p className="text-sm text-muted">클릭하여 새 이미지를 선택하세요</p>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {!file && <p className="text-xs text-muted mt-1">변경하지 않으면 기존 이미지가 유지됩니다.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">제목 (한글) *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text" />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">제목 (영문)</label>
              <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">제작년도</label>
              <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text" />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">재료</label>
              <input type="text" value={medium} onChange={(e) => setMedium(e.target.value)} className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">카테고리 *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Artwork['category'])} className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">상태 *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Artwork['status'])} className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-wider text-muted mb-1">작품 설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider text-muted mb-1">표시 순서</label>
              <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={1} className="w-full px-4 py-3 border border-border bg-white text-sm focus:outline-none focus:border-text" />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">홈 대표작으로 표시</span>
              </label>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full py-3 bg-text text-bg text-sm tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? '수정 중...' : '작품 수정'}
          </button>
        </form>
      </main>
    </div>
  );
}
