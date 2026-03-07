'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { artworks as staticArtworks } from '@/data/artworks';
import Link from 'next/link';

export default function SeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'checking' | 'seeding' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [existing, setExisting] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push('/admin');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) checkExisting();
  }, [user]);

  async function checkExisting() {
    setStatus('checking');
    try {
      const snapshot = await getDocs(collection(db, 'artworks'));
      setExisting(snapshot.size);
      setStatus('idle');
    } catch {
      setMessage('Firestore 연결 실패. Firestore가 활성화되어 있는지 확인해주세요.');
      setStatus('error');
    }
  }

  async function handleSeed() {
    setStatus('seeding');
    setMessage('');
    try {
      // Fetch existing artwork IDs to prevent duplicates
      const snapshot = await getDocs(collection(db, 'artworks'));
      const existingIds = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id) existingIds.add(data.id);
      });

      let added = 0;
      let skipped = 0;
      for (const artwork of staticArtworks) {
        if (existingIds.has(artwork.id)) {
          skipped++;
          continue;
        }
        await addDoc(collection(db, 'artworks'), { ...artwork });
        added++;
        setMessage(`${added + skipped}/${staticArtworks.length} 처리 중...`);
      }
      setMessage(
        skipped > 0
          ? `${added}개 등록, ${skipped}개 중복 건너뜀`
          : `${added}개 작품을 Firestore에 등록했습니다.`
      );
      setStatus('done');
    } catch (err) {
      console.error('Seed failed:', err);
      setMessage('시드 실패. Firestore 권한을 확인해주세요.');
      setStatus('error');
    }
  }

  if (loading || !user) {
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
          <h1 className="font-serif text-lg">초기 데이터 등록</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="border border-border p-8 text-center space-y-6">
          <div>
            <p className="font-serif text-xl mb-2">Firestore 초기 데이터</p>
            <p className="text-sm text-muted">
              정적 데이터({staticArtworks.length}개 작품)를 Firestore에 등록합니다.
            </p>
          </div>

          {status === 'checking' ? (
            <p className="text-sm text-muted">Firestore 확인 중...</p>
          ) : (
            <p className="text-sm">
              현재 Firestore: <strong>{existing}개</strong> 작품
            </p>
          )}

          {existing > 0 && status === 'idle' && (
            <p className="text-xs text-muted">
              이미 {existing}개의 작품이 있습니다. 중복 항목은 자동으로 건너뜁니다.
            </p>
          )}

          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-muted'}`}>
              {message}
            </p>
          )}

          <div className="flex gap-4 justify-center">
            {status !== 'done' && (
              <button
                onClick={handleSeed}
                disabled={status === 'seeding' || status === 'checking'}
                className="px-8 py-3 bg-text text-bg text-sm tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === 'seeding' ? '등록 중...' : '데이터 등록'}
              </button>
            )}
            {status === 'done' && (
              <Link
                href="/admin/dashboard"
                className="px-8 py-3 bg-text text-bg text-sm tracking-wider hover:opacity-90 transition-opacity"
              >
                대시보드로 이동
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
