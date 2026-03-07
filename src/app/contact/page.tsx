import type { Metadata } from 'next';
import { Suspense } from 'react';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: '문의',
  description: '작품이 마음에 닿았다면 조용히 문의를 남겨주세요.',
};

export default function ContactPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12 fade-in-up">
        <h1 className="font-serif text-2xl md:text-3xl mb-4">문의</h1>
        <p className="text-base text-muted leading-relaxed">
          작품이 마음에 닿았다면 조용히 문의를 남겨주세요.
          <br />
          작품 구매, 전시, 혹은 따뜻한 응원 — 모든 메시지를 소중히 읽겠습니다.
        </p>
      </div>
      <div className="fade-in-up delay-200">
        <Suspense>
          <ContactForm />
        </Suspense>
      </div>
    </section>
  );
}
