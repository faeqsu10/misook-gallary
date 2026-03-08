'use client';

import { Suspense } from 'react';
import ContactForm from '@/components/ContactForm';
import { useI18n } from '@/lib/i18n';

export default function ContactPage() {
  const { t } = useI18n();

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12 fade-in-up">
        <h1 className="font-serif text-2xl md:text-3xl mb-4">{t.contactTitle}</h1>
        <p className="text-base text-muted leading-relaxed">
          {t.contactPageDesc}
          <br />
          {t.contactPageDetail}
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
