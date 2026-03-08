'use client';

import { CategoryFilter, StatusFilter } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

interface FilterBarProps {
  category: CategoryFilter;
  status: StatusFilter;
  onCategoryChange: (c: CategoryFilter) => void;
  onStatusChange: (s: StatusFilter) => void;
}

export default function FilterBar({
  category,
  status,
  onCategoryChange,
  onStatusChange,
}: FilterBarProps) {
  const { t } = useI18n();

  const categoryLabels: Record<CategoryFilter, string> = {
    all: t.all,
    portrait: t.portrait,
    abstract: t.abstract,
    drawing: t.drawing,
  };

  const statusLabels: Record<StatusFilter, string> = {
    all: t.all,
    collection: t.collection,
    exhibit: t.exhibit,
    inquiry: t.inquiry,
  };

  return (
    <div className="flex flex-wrap gap-6 mb-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted shrink-0">{t.filterCategory}</span>
        {(Object.keys(categoryLabels) as CategoryFilter[]).map((key) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`px-4 py-2.5 text-sm tracking-wider border transition-colors ${
              category === key
                ? 'border-text text-text'
                : 'border-border text-muted hover:border-muted'
            }`}
            aria-pressed={category === key}
          >
            {categoryLabels[key]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted shrink-0">{t.filterStatus}</span>
        {(Object.keys(statusLabels) as StatusFilter[]).map((key) => (
          <button
            key={key}
            onClick={() => onStatusChange(key)}
            className={`px-4 py-2.5 text-sm tracking-wider border transition-colors ${
              status === key
                ? 'border-text text-text'
                : 'border-border text-muted hover:border-muted'
            }`}
            aria-pressed={status === key}
          >
            {statusLabels[key]}
          </button>
        ))}
      </div>
    </div>
  );
}
