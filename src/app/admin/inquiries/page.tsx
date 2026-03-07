'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { INQUIRY_TYPE_LABELS, InquiryType } from '@/lib/types';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  type: InquiryType;
  artwork?: string;
  message: string;
  createdAt?: { seconds: number };
}

export default function InquiriesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/admin');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadInquiries();
  }, [user]);

  async function loadInquiries() {
    setFetching(true);
    try {
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));
      setInquiries(data);
    } catch {
      // Firestore may not have the collection yet
    } finally {
      setFetching(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(seconds?: number) {
    if (!seconds) return '-';
    return new Date(seconds * 1000).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
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
            &larr; 대시보드
          </Link>
          <h1 className="font-serif text-lg">문의 관리</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {fetching ? (
          <p className="text-muted text-center py-20">문의를 불러오는 중...</p>
        ) : inquiries.length === 0 ? (
          <p className="text-muted text-center py-20">접수된 문의가 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="border border-border p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-sm">{inquiry.name}</span>
                      <span className="text-xs px-2 py-0.5 border border-border text-muted">
                        {INQUIRY_TYPE_LABELS[inquiry.type] || inquiry.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {inquiry.email} &middot; {formatDate(inquiry.createdAt?.seconds)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(inquiry.id)}
                    disabled={deleting === inquiry.id}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {deleting === inquiry.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
                {inquiry.artwork && (
                  <p className="text-xs text-muted">
                    관련 작품: <span className="text-text">{inquiry.artwork}</span>
                  </p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted mt-8 text-center">
          총 {inquiries.length}건의 문의
        </p>
      </main>
    </div>
  );
}
