import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Code2,
  Compass,
  Gem,
  Globe2,
  Layers3,
  MapPin,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from "lucide-react";
import api from "../api/client";

const stats = [
  { label: "Active hiring flow", value: "Fast", hint: "Search, apply, and manage jobs smoothly" },
  { label: "Focus", value: "IT", hint: "Platform built around Bangladesh tech careers" },
  { label: "Access", value: "24/7", hint: "Opportunities and expert visibility in one place" }
];

const highlights = [
  {
    icon: Compass,
    title: "Smarter discovery",
    description: "Filter by role, skill, or company and reach relevant tech jobs faster."
  },
  {
    icon: Building2,
    title: "Employer ready",
    description: "Post openings, review applicants, and manage hiring from one dashboard."
  },
  {
    icon: Gem,
    title: "Expert visibility",
    description: "Showcase premium profiles and stand out for consulting or specialized roles."
  }
];

const categories = [
  { icon: Code2, name: "Frontend & Backend", detail: "React, Node.js, Laravel, Next.js" },
  { icon: Layers3, name: "UI/UX & Product", detail: "Design systems, research, prototyping" },
  { icon: TrendingUp, name: "Marketing & Growth", detail: "SEO, paid ads, analytics, CRM" },
  { icon: Globe2, name: "Remote & Hybrid", detail: "Flexible roles from startups to teams" }
];

const processSteps = [
  {
    title: "Search what matches",
    description: "Use skills, titles, and keywords to quickly narrow down relevant opportunities."
  },
  {
    title: "Apply with confidence",
    description: "Move from discovery to application without unnecessary friction."
  },
  {
    title: "Grow your presence",
    description: "Build a stronger profile and unlock more visibility through expertise features."
  }
];

const HomeEnhanced = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentJobs = async () => {
      try {
        const { data } = await api.get("/jobs");
        setJobs((data.jobs || []).slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    loadRecentJobs();
  }, []);

  const onSearch = () => {
    const query = search.trim();
    navigate(query ? `/jobs?q=${encodeURIComponent(query)}` : "/jobs");
  };

  return (
    <section className="space-y-8 pb-4">
      <div className="home-hero relative overflow-hidden rounded-[2rem] border border-emerald-100/80 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.30),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(251,191,36,0.22),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.24),_transparent_24%)]" />
        <div className="pointer-events-none absolute right-4 top-4 h-28 w-28 rounded-full border border-white/10 bg-white/5 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
              <Sparkles size={14} />
              Bangladesh IT Jobs Platform
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
                Home for better tech hiring, sharper profiles, and real career momentum.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                IT Community BD helps job seekers, employers, and experts connect through a cleaner
                hiring experience built for Bangladesh&apos;s growing digital workforce.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm font-medium text-emerald-100">{item.label}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{item.hint}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-md">
              <p className="mb-3 text-sm font-medium text-slate-100">Search jobs by title, skill, or company</p>
              <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative block w-full">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white px-11 py-3.5 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/60"
                    placeholder="Frontend Developer, React, UI Designer"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSearch();
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={onSearch}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  <Search size={18} />
                  Search Jobs
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-50"
              >
                <BriefcaseBusiness size={16} />
                চাকরি খুঁজুন
              </Link>
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <PlusCircle size={16} />
                চাকরি পোস্ট করুন
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 hidden h-20 w-20 rounded-full bg-emerald-300/20 blur-2xl lg:block" />
            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Career Snapshot</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">A cleaner starting point for IT careers</h2>
                  </div>
                  <BadgeCheck className="text-emerald-300" size={24} />
                </div>
                <div className="mt-5 space-y-3">
                  {highlights.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-emerald-400/15 p-2 text-emerald-300">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-5 text-slate-900 shadow-lg shadow-emerald-100/70">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <ShieldCheck size={18} />
                    <p className="text-sm font-semibold">Trusted workflow</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Designed for job seekers and employers who want a straightforward and modern experience.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5 text-slate-900 shadow-lg shadow-sky-100/70">
                  <div className="flex items-center gap-2 text-sky-700">
                    <Clock3 size={18} />
                    <p className="text-sm font-semibold">Quick actions</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Search, shortlist, and apply in fewer steps while keeping the platform easy to navigate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Popular focus areas</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Built around how tech teams actually hire</h2>
            </div>
            <Link
              to="/appoint-expertise"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-emerald-700"
            >
              Explore expertise
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {categories.map(({ icon: Icon, name, detail }) => (
              <div
                key={name}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-900 p-3 text-white">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-amber-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-6 shadow-sm shadow-amber-100/70">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Simple flow, better outcomes</h2>
          <div className="mt-6 space-y-4">
            {processSteps.map((step, index) => (
              <div key={step.title} className="rounded-[1.4rem] border border-amber-100 bg-white/90 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-slate-950">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Latest openings</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Recent jobs from the platform</h2>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-emerald-700"
          >
            View all jobs
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? <p className="mt-6 text-sm text-slate-600">Loading recent jobs...</p> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <Link
              to={`/jobs/${job._id}`}
              key={job._id}
              className="group rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-lg hover:shadow-emerald-100/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    {(job.jobType || "Job").toUpperCase()}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900 transition group-hover:text-emerald-700">
                    {job.title}
                  </h3>
                </div>
                <div className="rounded-full bg-white p-2 text-slate-500 ring-1 ring-slate-200 transition group-hover:text-emerald-700">
                  <ArrowRight size={16} />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Building2 size={15} className="text-slate-400" />
                  {job.companyName || "Company name not provided"}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={15} className="text-slate-400" />
                  {job.location || "Location not provided"}
                </p>
                <p className="flex items-center gap-2">
                  <BriefcaseBusiness size={15} className="text-slate-400" />
                  {job.experienceLevel || "Experience level not specified"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {!loading && jobs.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">No jobs posted yet.</p>
        ) : null}
      </div>
    </section>
  );
};

export default HomeEnhanced;
