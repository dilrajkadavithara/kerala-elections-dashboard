export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div>
        <div className="h-7 w-64 bg-stone-200 rounded-lg mb-2" />
        <div className="h-4 w-96 bg-stone-100 rounded-lg" />
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 h-24">
            <div className="h-3 w-20 bg-stone-100 rounded mb-3" />
            <div className="h-8 w-16 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 h-80">
        <div className="h-4 w-48 bg-stone-200 rounded mb-4" />
        <div className="h-60 bg-stone-50 rounded-lg" />
      </div>
    </div>
  );
}
