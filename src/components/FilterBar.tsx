'use client';

import { CategoryFilter, StatusFilter } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

interface FilterBarProps {
  category: CategoryFilter;
  status: StatusFilter;
  series: string;
  onCategoryChange: (c: CategoryFilter) => void;
  onStatusChange: (s: StatusFilter) => void;
  onSeriesChange: (v: string) => void;
  availableSeries: string[];
}

export default function FilterBar({
  category,
  status,
  series,
  onCategoryChange,
  onStatusChange,
  onSeriesChange,
  availableSeries,
}: FilterBarProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-6 mb-10" role="search" aria-label="작품 필터">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.filterCategory}>
        <span className="text-xs text-muted shrink-0">{t.filterCategory}</span>
        {(Object.keys(t.categoryLabels) as CategoryFilter[]).map((key) => (
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
            {t.categoryLabels[key]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.filterStatus}>
        <span className="text-xs text-muted shrink-0">{t.filterStatus}</span>
        {(Object.keys(t.statusLabels) as StatusFilter[]).map((key) => (
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
            {t.statusLabels[key]}
          </button>
        ))}
      </div>
      {availableSeries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.filterSeries}>
          <span className="text-xs text-muted shrink-0">{t.filterSeries}</span>
          <button
            onClick={() => onSeriesChange('all')}
            className={`px-4 py-2.5 text-sm tracking-wider border transition-colors ${
              series === 'all'
                ? 'border-text text-text'
                : 'border-border text-muted hover:border-muted'
            }`}
            aria-pressed={series === 'all'}
          >
            {t.seriesLabels['all']}
          </button>
          {availableSeries.map((s) => (
            <button
              key={s}
              onClick={() => onSeriesChange(s)}
              className={`px-4 py-2.5 text-sm tracking-wider border transition-colors ${
                series === s
                  ? 'border-text text-text'
                  : 'border-border text-muted hover:border-muted'
              }`}
              aria-pressed={series === s}
            >
              {t.seriesLabels[s] ?? s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
