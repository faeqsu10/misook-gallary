'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminShell from '@/components/AdminShell';

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  approved: boolean;
  createdAt?: { seconds: number };
}

export default function AdminGuestbookPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadEntries();
  }, [user]);

  async function loadEntries() {
    setFetching(true);
    try {
      const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as GuestbookEntry));
      setEntries(data);
    } catch {
      // collection may not exist yet
    } finally {
      setFetching(false);
    }
  }

  async function handleApprove(id: string) {
    setActing(id);
    try {
      await updateDoc(doc(db, 'guestbook', id), { approved: true });
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, approved: true } : e)));
    } catch {
      alert('승인 처리에 실패했습니다.');
    } finally {
      setActing(null);
    }
  }

  async function handleReject(id: string) {
    setActing(id);
    try {
      await updateDoc(doc(db, 'guestbook', id), { approved: false });
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, approved: false } : e)));
    } catch {
      alert('처리에 실패했습니다.');
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 방명록을 삭제하시겠습니까?')) return;
    setActing(id);
    try {
      await deleteDoc(doc(db, 'guestbook', id));
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert('삭제에 실패했습니다.');
    } finally {
      setActing(null);
    }
  }

  function formatDate(seconds?: number) {
    if (!seconds) return '-';
    return new Date(seconds * 1000).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const pending = entries.filter((e) => !e.approved);
  const approved = entries.filter((e) => e.approved);

  return (
    <AdminShell title="방명록 관리">
      <main className="max-w-4xl mx-auto px-6 py-10">
        {fetching ? (
          <p className="text-muted text-center py-20">방명록을 불러오는 중...</p>
        ) : entries.length === 0 ? (
          <p className="text-muted text-center py-20">등록된 방명록이 없습니다.</p>
        ) : (
          <>
            {/* Pending section */}
            {pending.length > 0 && (
              <div className="mb-12">
                <h2 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
                  승인 대기 ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map((entry) => (
                    <div key={entry.id} className="border border-yellow-300 bg-yellow-50/30 p-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-sm font-medium">{entry.name}</span>
                          <span className="text-xs text-muted ml-2">
                            {formatDate(entry.createdAt?.seconds)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApprove(entry.id)}
                            disabled={acting === entry.id}
                            className="text-xs px-3 py-1 bg-text text-bg hover:opacity-80 transition-opacity disabled:opacity-50"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={acting === entry.id}
                            className="text-xs px-3 py-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved section */}
            <div>
              <h2 className="text-sm font-medium mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                공개 중 ({approved.length})
              </h2>
              {approved.length === 0 ? (
                <p className="text-xs text-muted py-8 text-center">승인된 방명록이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {approved.map((entry) => (
                    <div key={entry.id} className="border border-border p-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-sm font-medium">{entry.name}</span>
                          <span className="text-xs text-muted ml-2">
                            {formatDate(entry.createdAt?.seconds)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleReject(entry.id)}
                            disabled={acting === entry.id}
                            className="text-xs text-muted hover:text-text transition-colors disabled:opacity-50"
                          >
                            숨기기
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={acting === entry.id}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <p className="text-xs text-muted mt-8 text-center">
          총 {entries.length}건 (대기 {pending.length} / 공개 {approved.length})
        </p>
      </main>
    </AdminShell>
  );
}
