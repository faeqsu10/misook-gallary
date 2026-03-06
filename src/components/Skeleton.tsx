export function SkeletonCard() {
  return (
    <div className="block">
      <div className="aspect-[3/4] bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%] animate-shimmer" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-24 bg-border rounded" />
        <div className="h-3 w-16 bg-border rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
