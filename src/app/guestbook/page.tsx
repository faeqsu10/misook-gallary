'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string | null;
}

export default function GuestbookPage() {
  const { t } = useI18n();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/guestbook');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), honeypot }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t.guestbookError);
        return;
      }

      setSubmitted(true);
      setName('');
      setMessage('');
    } catch {
      setError(t.guestbookError);
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12 fade-in-up">
        <h1 className="font-serif text-2xl md:text-3xl mb-4">{t.guestbookTitle}</h1>
        <p className="text-base text-muted leading-relaxed">{t.guestbookDesc}</p>
      </div>

      {/* Submit form */}
      <div className="border border-border p-6 mb-12 fade-in-up">
        {submitted ? (
          <p className="text-sm text-muted text-center py-4">{t.guestbookThanks}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="gb-name" className="block text-sm mb-1.5">
                {t.guestbookName}
              </label>
              <input
                id="gb-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-4 py-2.5 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors"
              />
            </div>

            <div>
              <label htmlFor="gb-message" className="block text-sm mb-1.5">
                {t.guestbookMessage}
              </label>
              <textarea
                id="gb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={200}
                rows={3}
                className="w-full px-4 py-2.5 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors resize-none"
              />
              <p className="text-xs text-muted mt-1 text-right">{message.length}/200</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-text text-bg text-sm tracking-wider hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {submitting ? t.guestbookSubmitting : t.guestbookSubmit}
            </button>
          </form>
        )}
      </div>

      {/* Entries list */}
      <div className="fade-in-up">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border p-5 animate-pulse">
                <div className="h-3 w-20 bg-border rounded mb-3" />
                <div className="h-3 w-full bg-border rounded" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted text-center py-12">{t.guestbookEmpty}</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-border p-5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-medium">{entry.name}</span>
                  <span className="text-xs text-muted">{formatDate(entry.createdAt)}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted whitespace-pre-wrap">
                  {entry.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
