'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InquiryType } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { logger } from '@/lib/logger';

export default function ContactForm() {
  const { t } = useI18n();

  const inquiryTypeLabels: Record<InquiryType, string> = {
    purchase: t.purchaseInquiry,
    exhibit: t.exhibitInquiry,
    support: t.supportMessage,
  };
  const searchParams = useSearchParams();
  const artworkTitle = searchParams.get('artwork') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: (artworkTitle ? 'purchase' : 'support') as InquiryType,
    artwork: artworkTitle,
    message: '',
    honeypot: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.honeypot) { setLoading(false); setSubmitted(true); return; }

    // Rate limiting: 5분에 1회
    const RATE_LIMIT_KEY = 'contact_last_submit';
    const RATE_LIMIT_MS = 5 * 60 * 1000;
    const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmit && Date.now() - Number(lastSubmit) < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - (Date.now() - Number(lastSubmit))) / 60000);
      setError(t.rateLimitError(remaining));
      setLoading(false);
      return;
    }

    if (formData.name.length > 100) {
      setError(t.nameTooLong);
      setLoading(false);
      return;
    }
    if (formData.message.length > 5000) {
      setError(t.messageTooLong);
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'inquiries'), {
        name: formData.name,
        email: formData.email,
        type: formData.type,
        artwork: formData.artwork,
        message: formData.message,
        createdAt: serverTimestamp(),
      });
      localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      setSubmitted(true);
    } catch (err) {
      logger.error('문의 전송 실패', { action: 'inquiry.submit', source: 'client', error: err });
      setError(t.submitError);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 fade-in">
        <p className="font-serif text-xl mb-4">{t.thankYou}</p>
        <p className="text-sm text-muted leading-relaxed">
          {t.inquiryReceived}<br />
          {t.thankMessage}
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', type: 'support', artwork: '', message: '', honeypot: '' });
          }}
          className="mt-8 text-sm text-muted underline underline-offset-4 hover:text-text"
        >
          {t.newInquiry}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm mb-2">
          {t.name}
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm mb-2">
          {t.email}
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm mb-2">
          {t.inquiryType}
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as InquiryType })
          }
          className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors"
          disabled={loading}
        >
          {(Object.keys(inquiryTypeLabels) as InquiryType[]).map((key) => (
            <option key={key} value={key}>
              {inquiryTypeLabels[key]}
            </option>
          ))}
        </select>
      </div>

      {formData.artwork && (
        <div>
          <label htmlFor="artwork" className="block text-sm mb-2">
            {t.relatedWork}
          </label>
          <input
            id="artwork"
            type="text"
            value={formData.artwork}
            onChange={(e) =>
              setFormData({ ...formData, artwork: e.target.value })
            }
            className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors"
            disabled={loading}
          />
        </div>
      )}

      <div>
        <label htmlFor="message" className="block text-sm mb-2">
          {t.message}
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors resize-none"
          disabled={loading}
        />
      </div>

      <input
        type="text"
        name="website"
        value={formData.honeypot}
        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute -left-[9999px]"
        autoComplete="off"
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-8 py-3 border border-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t.sending : t.send}
      </button>
    </form>
  );
}
