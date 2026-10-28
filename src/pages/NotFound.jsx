import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="absolute -left-24 top-10 -z-10 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />

      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-xl shadow-emerald-200/60">
          <SearchX className="h-10 w-10" strokeWidth={1.8} />
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">Page not found</p>
        <h1 className="mt-3 text-6xl font-black tracking-tight text-slate-900 sm:text-8xl">404</h1>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">This page took a wrong turn.</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
          The link may be outdated, or the page may have moved. Let’s get you back to the IT Community Bangladesh homepage.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
