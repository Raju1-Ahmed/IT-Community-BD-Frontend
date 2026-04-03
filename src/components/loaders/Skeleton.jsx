const joinClasses = (...items) => items.filter(Boolean).join(" ");

export const Skeleton = ({ className = "" }) => (
  <div className={joinClasses("skeleton-shimmer rounded-xl bg-slate-200/80", className)} aria-hidden="true" />
);

export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={joinClasses("space-y-2", className)} aria-hidden="true">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={`skeleton-line-${index}`}
        className={joinClasses("h-4", index === lines - 1 ? "w-2/3" : "w-full")}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={joinClasses("rounded-3xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <Skeleton className="h-7 w-3/5" />
      <SkeletonText lines={2} />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-36 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonTableRows = ({ rows = 4, columns = 4, className = "" }) => (
  <div className={joinClasses("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
    <div className="grid gap-px bg-slate-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`skeleton-row-${rowIndex}`}
          className="grid bg-white p-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={`skeleton-cell-${rowIndex}-${colIndex}`} className="px-2">
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
