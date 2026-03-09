import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const isLikelyImage = (url) => /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i.test(String(url || ""));

const ExpertiseDocumentCarousel = ({ documents, heightClass = "h-56" }) => {
  const slides = useMemo(
    () =>
      (Array.isArray(documents) ? documents : []).filter(
        (item) => item && String(item.url || "").trim().length > 0
      ),
    [documents]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className={`flex ${heightClass} items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500`}>
        No document preview
      </div>
    );
  }

  const current = slides[index];
  const canSlide = slides.length > 1;

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${heightClass}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!canSlide) return;
          setIndex((prev) => (prev - 1 + slides.length) % slides.length);
        }}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-1.5 text-slate-700 shadow-sm hover:bg-white disabled:opacity-50"
        disabled={!canSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!canSlide) return;
          setIndex((prev) => (prev + 1) % slides.length);
        }}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-1.5 text-slate-700 shadow-sm hover:bg-white disabled:opacity-50"
        disabled={!canSlide}
        aria-label="Next slide"
      >
        <ChevronRight size={16} />
      </button>

      <div className="flex h-full items-center justify-center">
        {isLikelyImage(current.url) ? (
          <img src={current.url} alt={current.label} className="h-full w-full object-cover" />
        ) : (
          <div className="space-y-2 px-4 text-center text-xs text-slate-700">
            <p>{current.label}</p>
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-md border border-slate-300 bg-white px-3 py-1 font-medium hover:bg-slate-50"
              onClick={(e) => e.stopPropagation()}
            >
              Open File
            </a>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black/55 px-3 py-2 text-xs text-white">
        <span className="font-medium">{current.label}</span>
        <span className="ml-2 text-white/80">
          {index + 1}/{slides.length}
        </span>
      </div>
    </div>
  );
};

export default ExpertiseDocumentCarousel;
