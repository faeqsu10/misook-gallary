export default function Loading() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-16">
        <div className="space-y-4">
          <div className="h-10 w-64 bg-border rounded animate-shimmer bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%]" />
          <div className="h-4 w-48 bg-border rounded animate-shimmer bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%]" />
          <div className="h-4 w-40 bg-border rounded animate-shimmer bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%]" />
        </div>
        <div className="aspect-[3/4] bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%] animate-shimmer" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%] animate-shimmer" />
            <div className="h-4 w-3/4 bg-border rounded animate-shimmer bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%]" />
          </div>
        ))}
      </div>
    </section>
  );
}
