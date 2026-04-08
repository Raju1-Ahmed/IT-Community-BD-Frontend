import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  MapPin,
  PencilLine,
  Trash2
} from "lucide-react";
import api from "../api/client";
import { Skeleton } from "../components/loaders/Skeleton";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
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

const MyJobsSkeleton = () => (
  <div className="grid gap-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={`my-job-skeleton-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-36" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-full" />
            <Skeleton className="h-8 w-40 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const MyJobsEnhanced = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [actionJobId, setActionJobId] = useState("");

  const stats = useMemo(() => {
    const active = jobs.filter((job) => job.status === "active").length;
    const closed = jobs.filter((job) => job.status === "closed").length;
    return {
      total: jobs.length,
      active,
      closed
    };
  }, [jobs]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/jobs/mine");
        setJobs(data.jobs || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const deleteJob = async (jobId) => {
    const confirmed = window.confirm("Are you sure you want to delete this job?");
    if (!confirmed) return;

    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      setMessage("Job deleted successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete job.");
    }
  };

  const toggleJobStatus = async (job) => {
    const nextStatus = job.status === "active" ? "closed" : "active";
    const confirmed = window.confirm(
      nextStatus === "closed"
        ? "Are you sure you want to close this job?"
        : "Are you sure you want to reopen this job?"
    );

    if (!confirmed) return;

    try {
      setActionJobId(job._id);
      const { data } = await api.put(`/jobs/${job._id}`, {
        status: nextStatus
      });

      setJobs((prev) =>
        prev.map((item) =>
          item._id === job._id ? { ...item, status: data?.job?.status || nextStatus } : item
        )
      );
      setMessage(nextStatus === "closed" ? "Job closed successfully." : "Job reopened successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update job status.");
    } finally {
      setActionJobId("");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-8 text-white shadow-lg">
        <p className="text-sm font-medium text-emerald-200">Employer workspace</p>
        <h2 className="mt-2 text-3xl font-bold">My Posted Jobs</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-200">
          Review your live posts, open any job for updates, and keep your hiring activity organized in one place.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <StatCard
            label="Total Jobs"
            value={stats.total}
            icon={<BriefcaseBusiness size={18} />}
            className="border-white/10 bg-white/10 backdrop-blur-sm"
          />
          <StatCard
            label="Active Jobs"
            value={stats.active}
            icon={<CalendarClock size={18} />}
            className="border-emerald-300/30 bg-emerald-100/90"
          />
          <StatCard
            label="Closed Jobs"
            value={stats.closed}
            icon={<CircleDollarSign size={18} />}
            className="border-slate-300/40 bg-slate-100/95"
          />
        </div>
      </div>

      {loading ? <MyJobsSkeleton /> : null}

      {!loading ? <div className="grid gap-4">
        {jobs.map((job) => (
          <article
            key={job._id}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <Link
              to={`/my-jobs/${job._id}/candidate-applications`}
              className="block"
            >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      job.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                    {job.jobType}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                    {job.experienceLevel}
                  </span>
                </div>

                <div className="mt-3 block">
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
                    text={`Published: ${formatDateTime(job.createdAt)}`}
                  />
                </div>
              </div>
            </div>
            </Link>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Link
                  to={`/my-jobs/${job._id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  <PencilLine size={16} />
                  Open & Edit
                </Link>

                <Link
                  to={`/my-jobs/${job._id}/candidate-applications`}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
                >
                  <BriefcaseBusiness size={16} />
                  Candidate Application
                </Link>

                <button
                  type="button"
                  onClick={() => toggleJobStatus(job)}
                  disabled={actionJobId === job._id}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    job.status === "active"
                      ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <CalendarClock size={16} />
                  {actionJobId === job._id
                    ? "Updating..."
                    : job.status === "active"
                      ? "Close Job"
                      : "Reopen Job"}
                </button>

                <button
                  type="button"
                  onClick={() => deleteJob(job._id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
          </article>
        ))}
      </div> : null}

      {!loading && jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <BriefcaseBusiness size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No jobs posted yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Your posted jobs will appear here after you publish your first opportunity.
          </p>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}
    </section>
  );
};

export default MyJobsEnhanced;
