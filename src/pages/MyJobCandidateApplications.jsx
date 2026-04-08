import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Eye,
  Heart,
  MapPin,
  UserRoundCheck,
  Users
} from "lucide-react";
import api from "../api/client";
import { Skeleton } from "../components/loaders/Skeleton";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const CandidateApplicationsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-40 rounded-3xl" />
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-64 rounded-3xl" />
    </div>
    <Skeleton className="h-80 rounded-3xl" />
  </div>
);

const StatCard = ({ label, value, icon: Icon, tone = "slate" }) => {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900"
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone] || tones.slate}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-xl bg-white/80 p-2 shadow-sm">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

const statusTone = {
  applied: "bg-slate-100 text-slate-700",
  shortlisted: "bg-emerald-100 text-emerald-700",
  interview: "bg-cyan-100 text-cyan-700",
  rejected: "bg-rose-100 text-rose-700",
  hired: "bg-amber-100 text-amber-700"
};

const MyJobCandidateApplications = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/jobs/${id}/candidate-applications`);
        setData(response.data);
        setMessage("");
      } catch (error) {
        setMessage(error?.response?.data?.message || "Failed to load candidate applications.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const topViewers = useMemo(() => {
    const events = data?.analytics?.recentViewEvents || [];
    const grouped = new Map();

    events.forEach((item) => {
      const key = item.viewerEmail || item.viewerName;
      const current = grouped.get(key) || {
        viewerName: item.viewerName,
        currentPosition: item.currentPosition,
        total: 0,
        viewedAt: item.viewedAt
      };

      current.total += 1;
      if (new Date(item.viewedAt || 0) > new Date(current.viewedAt || 0)) {
        current.viewedAt = item.viewedAt;
      }

      grouped.set(key, current);
    });

    return Array.from(grouped.values())
      .sort((a, b) => b.total - a.total || new Date(b.viewedAt || 0) - new Date(a.viewedAt || 0))
      .slice(0, 5);
  }, [data]);

  if (loading) return <CandidateApplicationsSkeleton />;

  if (!data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {message || "No job analytics found."}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-200">Job-level employer analytics</p>
            <h2 className="mt-2 text-3xl font-bold">{data.job?.title || "Candidate Applications"}</h2>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-200">
              <span>{data.job?.companyName || "N/A"}</span>
              {data.job?.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} /> {data.job.location}
                </span>
              ) : null}
            </div>
          </div>

          <Link
            to="/my-jobs"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            <ArrowLeft size={16} /> Back to My Jobs
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <StatCard label="Applications" value={data.analytics?.totalApplications || 0} icon={Users} tone="slate" />
          <StatCard label="Total Views" value={data.analytics?.totalViews || 0} icon={Eye} tone="emerald" />
          <StatCard label="Unique Viewers" value={data.analytics?.uniqueViewers || 0} icon={UserRoundCheck} tone="cyan" />
          <StatCard label="Saved By" value={data.analytics?.savedCount || 0} icon={Heart} tone="amber" />
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Latest View Events</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {(data.analytics?.recentViewEvents || []).length === 0 ? (
              <div className="px-5 py-4 text-sm text-slate-500">No one has viewed this job yet.</div>
            ) : null}
            {(data.analytics?.recentViewEvents || []).map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{item.viewerName || "Viewer"}</p>
                  <p className="text-xs text-slate-500">{item.currentPosition || item.viewerEmail || "Job seeker"}</p>
                </div>
                <p className="text-xs font-medium text-slate-600">{formatDateTime(item.viewedAt)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Saved By Candidates</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {(data.analytics?.savedBy || []).length === 0 ? (
              <div className="px-5 py-4 text-sm text-slate-500">No candidate has saved this job yet.</div>
            ) : null}
            {(data.analytics?.savedBy || []).map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.currentPosition || item.email || "Job seeker"}</p>
                </div>
                <p className="text-xs font-medium text-slate-600">{formatDateTime(item.savedAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Candidates Who Applied</h3>
        </div>

        <div className="divide-y divide-slate-200">
          {(data.applications || []).length === 0 ? (
            <div className="px-5 py-5 text-sm text-slate-500">No candidate has applied to this job yet.</div>
          ) : null}

          {(data.applications || []).map((application) => (
            <div key={application._id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-semibold text-slate-900">{application.candidate?.name || "Candidate"}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[application.status] || statusTone.applied}`}>
                    {application.status}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span>{application.candidate?.currentPosition || "Job seeker"}</span>
                  {application.candidate?.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} /> {application.candidate.location}
                    </span>
                  ) : null}
                  {application.candidate?.experienceYears !== undefined ? (
                    <span>{application.candidate.experienceYears} years experience</span>
                  ) : null}
                </div>

                {Array.isArray(application.candidate?.skills) && application.candidate.skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {application.candidate.skills.slice(0, 6).map((skill) => (
                      <span key={`${application._id}-${skill}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <div className="text-right text-xs text-slate-500">
                  <p>Applied on</p>
                  <p className="mt-1 font-medium text-slate-700">{formatDateTime(application.createdAt)}</p>
                </div>

                {application.candidate?._id ? (
                  <Link
                    to={`/employer/candidate/${application.candidate._id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    <BriefcaseBusiness size={16} />
                    View Candidate
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {topViewers.length > 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Top Viewers</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {topViewers.map((item) => (
              <div key={`${item.viewerName}-${item.viewedAt}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{item.viewerName}</p>
                  <p className="text-xs text-slate-500">{item.currentPosition || "Job seeker"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-700">{item.total} views</p>
                  <p className="text-xs text-slate-500">Last viewed {formatDateTime(item.viewedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default MyJobCandidateApplications;
