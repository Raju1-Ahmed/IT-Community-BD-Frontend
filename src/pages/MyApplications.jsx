import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, CalendarDays, CircleCheckBig, Clock3, MapPin, XCircle } from "lucide-react";
import api from "../api/client";

const statusConfig = {
  applied: {
    label: "Applied",
    tone: "border-slate-200 bg-slate-50 text-slate-700",
    message: "Employer has not updated your application yet.",
    icon: Clock3
  },
  shortlisted: {
    label: "Shortlisted",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    message: "Employer shortlisted your application.",
    icon: CircleCheckBig
  },
  interview: {
    label: "Interview",
    tone: "border-cyan-200 bg-cyan-50 text-cyan-700",
    message: "Employer moved your application to interview stage.",
    icon: Briefcase
  },
  rejected: {
    label: "Rejected",
    tone: "border-red-200 bg-red-50 text-red-700",
    message: "Employer marked this application as rejected.",
    icon: XCircle
  },
  hired: {
    label: "Hired",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    message: "Employer selected you for hiring.",
    icon: CircleCheckBig
  }
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/applications/mine");
        setApplications(data.applications || []);
        setMessage("");
      } catch (error) {
        setMessage(error?.response?.data?.message || "Failed to load your applications.");
      }
    };
    load();
  }, []);

  const summary = useMemo(() => ({
    total: applications.length,
    shortlisted: applications.filter((item) => item.status === "shortlisted").length,
    interview: applications.filter((item) => item.status === "interview").length,
    hired: applications.filter((item) => item.status === "hired").length
  }), [applications]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Application Tracker</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">My Applications</h2>
        <p className="mt-1 text-sm text-slate-600">
          See which status the employer kept for each application.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Total Applications</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">Shortlisted</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900">{summary.shortlisted}</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-xs text-cyan-700">Interview</p>
            <p className="mt-1 text-2xl font-bold text-cyan-900">{summary.interview}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-700">Hired</p>
            <p className="mt-1 text-2xl font-bold text-amber-900">{summary.hired}</p>
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4">
        {applications.map((item) => (
          <article key={item._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{item.job?.title || "Job"}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span>{item.job?.companyName || "N/A"}</span>
                  {item.job?.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} /> {item.job.location}
                    </span>
                  ) : null}
                </div>
              </div>

              {(() => {
                const config = statusConfig[item.status] || statusConfig.applied;
                const Icon = config.icon;
                return (
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${config.tone}`}>
                    <Icon size={15} />
                    {config.label}
                  </div>
                );
              })()}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Employer Status</p>
              <p className="mt-1 text-sm text-slate-600">
                {(statusConfig[item.status] || statusConfig.applied).message}
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Applied On</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(item.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Last Status Update</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(item.updatedAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Current Stage</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {(statusConfig[item.status] || statusConfig.applied).label}
                </p>
              </div>
            </div>

            {item.job?._id ? (
              <Link
                to={`/jobs/${item.job._id}`}
                className="mt-4 inline-block text-sm font-medium text-emerald-700"
              >
                View Full Job Details
              </Link>
            ) : null}
          </article>
        ))}
      </div>
      {applications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          You have not applied to any job yet.
        </div>
      ) : null}
    </section>
  );
};

export default MyApplications;
