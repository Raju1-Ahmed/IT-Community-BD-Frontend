import { useState } from "react";
import { Skeleton, SkeletonCard, SkeletonTableRows, SkeletonText } from "../components/loaders/Skeleton";
import { useLoader } from "../hooks/useLoader";

const LoaderShowcase = () => {
  const { increment, decrement, beginRouteLoad, endRouteLoad } = useLoader();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [pagePreview, setPagePreview] = useState(false);

  const simulateProgress = () => {
    beginRouteLoad();
    increment();

    setTimeout(() => {
      decrement();
      endRouteLoad();
    }, 1800);
  };

  const simulateButton = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
    }, 1800);
  };

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white/85 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Loader Showcase</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Advanced Loader System Preview</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          This page shows the full loader stack: branded loader, button loader, page loader, top progress bar, and skeleton states.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={simulateProgress}
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Trigger Top Progress
          </button>
          <button
            type="button"
            onClick={() => setPagePreview((value) => !value)}
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {pagePreview ? "Hide Page Loader" : "Show Page Loader"}
          </button>
          <button
            type="button"
            onClick={simulateButton}
            className="rounded-2xl border border-cyan-300 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
          >
            {buttonLoading ? "Processing..." : "Trigger Button Loader"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Section Loader</h2>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-3 w-40 max-w-full rounded-full" />
                </div>
              </div>
              <Skeleton className="h-24 rounded-3xl" />
              <Skeleton className="h-24 rounded-3xl" />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Inline Loader</h2>
          <div className="rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-3 w-32 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {pagePreview ? (
        <div className="rounded-[32px] border border-slate-200 bg-white/70 p-6 shadow-sm">
          <div className="space-y-4">
            <Skeleton className="h-10 w-44 rounded-2xl" />
            <SkeletonText lines={2} className="max-w-lg" />
            <div className="grid gap-4 lg:grid-cols-3">
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Skeleton System</h2>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <SkeletonCard />
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <Skeleton className="h-10 w-36 rounded-full" />
              <SkeletonText lines={3} />
              <div className="grid gap-3 md:grid-cols-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

        <SkeletonTableRows rows={4} columns={4} className="mt-6" />
      </div>
    </section>
  );
};

export default LoaderShowcase;
