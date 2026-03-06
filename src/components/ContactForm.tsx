'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { INQUIRY_TYPE_LABELS, InquiryType } from '@/lib/types';

export default function ContactForm() {
  const searchParams = useSearchParams();
  const artworkTitle = searchParams.get('artwork') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'support' as InquiryType,
    artwork: artworkTitle,
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For MVP, just show success message
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-16 fade-in">
        <p className="font-serif text-xl mb-4">감사합니다</p>
        <p className="text-sm text-muted leading-relaxed">
          문의가 접수되었습니다.<br />
          소중한 관심에 감사드립니다.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', type: 'support', artwork: '', message: '' });
          }}
          className="mt-8 text-sm text-muted underline underline-offset-4 hover:text-text"
        >
          새 문의 작성
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm mb-2">
          이름
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm mb-2">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm mb-2">
          문의 유형
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as InquiryType })
          }
          className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors"
        >
          {(Object.keys(INQUIRY_TYPE_LABELS) as InquiryType[]).map((key) => (
            <option key={key} value={key}>
              {INQUIRY_TYPE_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {formData.artwork && (
        <div>
          <label htmlFor="artwork" className="block text-sm mb-2">
            관련 작품
          </label>
          <input
            id="artwork"
            type="text"
            value={formData.artwork}
            onChange={(e) =>
              setFormData({ ...formData, artwork: e.target.value })
            }
            className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-text transition-colors"
          />
        </div>
      )}

      <div>
        <label htmlFor="message" className="block text-sm mb-2">
          메시지
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
        />
      </div>

      <button
        type="submit"
        className="px-8 py-3 border border-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors"
      >
        문의 보내기
      </button>
    </form>
  );
}
