'use client';

import { CategoryFilter, StatusFilter, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types';

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
  return (
    <div className="flex flex-wrap gap-6 mb-10">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((key) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`px-4 py-1.5 text-xs tracking-wider border transition-colors ${
              category === key
                ? 'border-text text-text'
                : 'border-border text-muted hover:border-muted'
            }`}
            aria-pressed={category === key}
          >
            {CATEGORY_LABELS[key]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((key) => (
          <button
            key={key}
            onClick={() => onStatusChange(key)}
            className={`px-4 py-1.5 text-xs tracking-wider border transition-colors ${
              status === key
                ? 'border-text text-text'
                : 'border-border text-muted hover:border-muted'
            }`}
            aria-pressed={status === key}
          >
            {STATUS_LABELS[key]}
          </button>
        ))}
      </div>
    </div>
  );
}
