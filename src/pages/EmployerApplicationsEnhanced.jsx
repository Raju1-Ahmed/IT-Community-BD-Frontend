import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound
} from "lucide-react";
import api from "../api/client";
import { Skeleton, SkeletonCard } from "../components/loaders/Skeleton";

const statusOptions = ["applied", "shortlisted", "interview", "rejected", "hired"];

const statusToneMap = {
  applied: "border-slate-200 bg-slate-50 text-slate-700",
  shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  interview: "border-sky-200 bg-sky-50 text-sky-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  hired: "border-amber-200 bg-amber-50 text-amber-700"
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const StatCard = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
      statusToneMap[status] || statusToneMap.applied
    }`}
  >
    {status}
  </span>
);

const EmployerApplicationsEnhanced = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    query: "",
    status: "",
    jobId: ""
  });

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/applications/employer/mine");
      setApplications(data.applications || []);
      setMessage("");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const updateStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      setApplications((prev) =>
        prev.map((item) => (item._id === applicationId ? { ...item, status } : item))
      );
      setMessage("Application status updated.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Status update failed.");
    }
  };

  const jobOptions = useMemo(() => {
    const map = new Map();

    applications.forEach((item) => {
      if (item.job?._id && !map.has(item.job._id)) {
        map.set(item.job._id, item.job);
      }
    });

    return [...map.values()];
  }, [applications]);

  const stats = useMemo(() => {
    const shortlisted = applications.filter((item) => item.status === "shortlisted").length;
    const interviews = applications.filter((item) => item.status === "interview").length;
    const hired = applications.filter((item) => item.status === "hired").length;

    return {
      total: applications.length,
      shortlisted,
      interviews,
      hired
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return applications.filter((item) => {
      const queryMatch = query
        ? [
            item.job?.title,
            item.job?.companyName,
            item.candidate?.name,
            item.candidate?.email,
            item.candidate?.currentPosition,
            ...(item.candidate?.skills || [])
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      const statusMatch = filters.status ? item.status === filters.status : true;
      const jobMatch = filters.jobId ? item.job?._id === filters.jobId : true;

      return queryMatch && statusMatch && jobMatch;
    });
  }, [applications, filters]);

  const groupedApplications = useMemo(() => {
    const groups = new Map();

    filteredApplications.forEach((item) => {
      const key = item.job?._id || "unknown";
      if (!groups.has(key)) {
        groups.set(key, {
          job: item.job,
          items: []
        });
      }
      groups.get(key).items.push(item);
    });

    return [...groups.values()];
  }, [filteredApplications]);

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-800 p-8 text-white shadow-lg">
        <p className="text-sm font-medium text-cyan-200">Recruiter workspace</p>
        <h2 className="mt-2 text-3xl font-bold">Employer Applications</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-200">
          Review applicants by job, update hiring status quickly, and open detailed profiles with less friction.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <StatCard label="Applications" value={stats.total} hint="Total candidates received" />
          <StatCard label="Shortlisted" value={stats.shortlisted} hint="Candidates moved forward" />
          <StatCard label="Interview" value={stats.interviews} hint="Interview stage pipeline" />
          <StatCard label="Hired" value={stats.hired} hint="Final successful hires" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_220px_260px]">
          <label className="relative block">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="Search by candidate, job, email, or skill"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            />
          </label>

          <select
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            value={filters.jobId}
            onChange={(e) => setFilters((prev) => ({ ...prev, jobId: e.target.value }))}
          >
            <option value="">All jobs</option>
            {jobOptions.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <div className="grid gap-4 xl:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={`application-skeleton-${index}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && groupedApplications.length > 0 ? (
        <div className="space-y-5">
          {groupedApplications.map((group) => (
            <section key={group.job?._id || "unknown"} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{group.job?.title || "Job"}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {group.job?.companyName || "N/A"} • {group.job?.location || "N/A"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                    {group.job?.jobType || "N/A"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                    {group.job?.experienceLevel || "N/A"}
                  </span>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {group.items.length} candidate{group.items.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {group.items.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-cyan-300 hover:bg-white"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <UserRound size={16} className="text-slate-400" />
                            <h4 className="text-lg font-semibold text-slate-900">{item.candidate?.name || "N/A"}</h4>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{item.candidate?.currentPosition || "Position not added"}</p>
                        </div>

                        <StatusBadge status={item.status} />
                      </div>

                      <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                        <p className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" />
                          {item.candidate?.email || "N/A"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" />
                          {item.candidate?.phone || "N/A"}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          {item.candidate?.location || "N/A"}
                        </p>
                        <p className="flex items-center gap-2">
                          <CalendarClock size={14} className="text-slate-400" />
                          {item.candidate?.experienceYears ?? 0} years experience
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Skills</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(item.candidate?.skills || []).length > 0 ? (
                            item.candidate.skills.slice(0, 6).map((skill) => (
                              <span
                                key={`${item._id}-${skill}`}
                                className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No skills added</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">Status</span>
                          <select
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                            value={item.status}
                            onChange={(e) => updateStatus(item._id, e.target.value)}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        {item.candidate?._id ? (
                          <Link
                            to={`/employer/candidate/${item.candidate._id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <CheckCircle2 size={16} />
                            View Profile
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {!loading && groupedApplications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <BriefcaseBusiness size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No applications found</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try a different filter or wait for new candidates to apply to your posted jobs.
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

export default EmployerApplicationsEnhanced;
