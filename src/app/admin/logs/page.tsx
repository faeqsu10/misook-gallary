'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { collection, getDocs, deleteDoc, doc, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminShell from '@/components/AdminShell';
import type { LogLevel, LogSource } from '@/lib/logger';

interface LogDoc {
  id: string;
  level: LogLevel;
  message: string;
  action: string;
  source: LogSource;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
  error?: string;
  createdAt?: { seconds: number };
}

type FilterLevel = 'all' | LogLevel;

export default function LogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogDoc[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<FilterLevel>('all');

  useEffect(() => {
    if (user) loadLogs();
  }, [user]);

  async function loadLogs() {
    setFetching(true);
    try {
      const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(200));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LogDoc));
      setLogs(data);
    } catch {
      // Collection may not exist yet
    } finally {
      setFetching(false);
    }
  }

  async function handleClearOld() {
    if (!confirm('90일 이전 로그를 삭제하시겠습니까?')) return;
    const cutoff = Date.now() / 1000 - 90 * 24 * 60 * 60;
    const old = logs.filter((l) => l.createdAt && l.createdAt.seconds < cutoff);
    if (old.length === 0) { alert('삭제할 로그가 없습니다.'); return; }
    try {
      await Promise.all(old.map((l) => deleteDoc(doc(db, 'logs', l.id))));
      setLogs((prev) => prev.filter((l) => !old.find((o) => o.id === l.id)));
      alert(`${old.length}건의 로그를 삭제했습니다.`);
    } catch {
      alert('삭제에 실패했습니다.');
    }
  }

  function formatDate(seconds?: number) {
    if (!seconds) return '-';
    return new Date(seconds * 1000).toLocaleString('ko-KR', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.level === filter);

  const levelBadge = (level: LogLevel) => {
    const cls = level === 'error'
      ? 'bg-red-100 text-red-700'
      : level === 'warn'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-blue-100 text-blue-700';
    return <span className={`text-[10px] px-1.5 py-0.5 rounded ${cls}`}>{level.toUpperCase()}</span>;
  };

  return (
    <AdminShell title="로그 관리">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {(['all', 'error', 'info', 'warn'] as FilterLevel[]).map((lv) => (
              <button
                key={lv}
                onClick={() => setFilter(lv)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  filter === lv ? 'border-text text-text' : 'border-border text-muted hover:border-muted'
                }`}
              >
                {lv === 'all' ? '전체' : lv.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={handleClearOld}
            className="text-xs text-muted hover:text-red-500 transition-colors"
          >
            90일 이전 정리
          </button>
        </div>

        {fetching ? (
          <p className="text-muted text-center py-20">로그를 불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted text-center py-20">
            {filter === 'all' ? '기록된 로그가 없습니다.' : `${filter.toUpperCase()} 로그가 없습니다.`}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((log) => (
              <div key={log.id} className="border border-border p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {levelBadge(log.level)}
                    <span className="text-sm font-medium truncate">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-muted shrink-0">
                    {formatDate(log.createdAt?.seconds)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted">
                  <span className="px-1.5 py-0.5 border border-border">{log.action}</span>
                  <span>{log.source}</span>
                  {log.userEmail && <span>{log.userEmail}</span>}
                </div>
                {log.error && (
                  <p className="text-xs text-red-500 font-mono bg-red-50 px-2 py-1 rounded">
                    {log.error}
                  </p>
                )}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <p className="text-[11px] text-muted font-mono">
                    {JSON.stringify(log.metadata)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted mt-8 text-center">
          {filter === 'all' ? `총 ${logs.length}건` : `${filtered.length}건 / 전체 ${logs.length}건`}
        </p>
      </main>
    </AdminShell>
  );
}
