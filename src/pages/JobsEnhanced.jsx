import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  MapPin,
  Search,
  SlidersHorizontal
} from "lucide-react";
import api from "../api/client";

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatSalary = (job) => {
  if (!job.salaryMin && !job.salaryMax) return "Negotiable";
  return `BDT ${job.salaryMin || 0} - ${job.salaryMax || 0}`;
};

const StatCard = ({ label, value, icon, className }) => (
  <div className={`rounded-2xl border p-4 shadow-sm ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="rounded-xl bg-white/80 p-2 text-slate-800 shadow-sm">{icon}</div>
    </div>
  </div>
);

const MetaPill = ({ icon, text }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
    {icon}
    <span>{text}</span>
  </div>
);

const JobsEnhanced = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadJobs = async (q = "") => {
    setLoading(true);
    try {
      const { data } = await api.get("/jobs", { params: { q } });
      setJobs(data.jobs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    loadJobs(q);
  }, [searchParams]);

  const stats = useMemo(() => {
    const active = jobs.filter((job) => job.status === "active").length;
    const remoteFriendly = jobs.filter((job) => job.workplace === "remote" || job.workplace === "hybrid").length;
    return {
      total: jobs.length,
      active,
      remoteFriendly
    };
  }, [jobs]);

  const handleSearch = () => {
    const trimmed = query.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-8 text-white shadow-lg">
        <p className="text-sm font-medium text-emerald-200">Career opportunities</p>
        <h2 className="mt-2 text-3xl font-bold">Find Your Next Job</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-200">
          Search current openings, compare roles quickly, and open any listing for full job details.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <StatCard
            label="Available Jobs"
            value={stats.total}
            icon={<BriefcaseBusiness size={18} />}
            className="border-white/10 bg-white/10 backdrop-blur-sm"
          />
          <StatCard
            label="Active Posts"
            value={stats.active}
            icon={<CalendarClock size={18} />}
            className="border-emerald-300/30 bg-emerald-100/90"
          />
          <StatCard
            label="Remote Friendly"
            value={stats.remoteFriendly}
            icon={<SlidersHorizontal size={18} />}
            className="border-slate-300/40 bg-slate-100/95"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Search by title, company, or skill"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Search size={16} />
            Search Jobs
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Loading jobs...
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {jobs.map((job) => (
          <article
            key={job._id}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                {job.status || "active"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                {job.jobType}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                {job.experienceLevel}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-emerald-700">
                {job.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{job.companyName}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <MetaPill icon={<MapPin size={14} className="text-emerald-700" />} text={job.location} />
              <MetaPill icon={<CircleDollarSign size={14} className="text-emerald-700" />} text={formatSalary(job)} />
              <MetaPill
                icon={<CalendarClock size={14} className="text-emerald-700" />}
                text={`Deadline: ${formatDate(job.applicationDeadline)}`}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {Array.isArray(job.skills) && job.skills.length > 0
                  ? `Top skills: ${job.skills.slice(0, 3).join(", ")}`
                  : "Explore the full job details to see more requirements."}
              </p>
              <Link
                to={`/jobs/${job._id}`}
                className="inline-flex shrink-0 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>

      {!loading && jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <BriefcaseBusiness size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No jobs found</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try another search term or clear the search to browse all current job openings.
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default JobsEnhanced;
