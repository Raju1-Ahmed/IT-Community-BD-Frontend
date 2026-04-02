import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  CalendarClock,
  CircleDashed,
  FilePenLine,
  MapPinned,
  Printer,
  Share2,
  Send
} from "lucide-react";

const tabs = [
  "All",
  "Requirements",
  "Responsibilities",
  "Skills & Expertise",
  "Salary & Benefits",
  "Company Information"
];

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

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

const toBulletLines = (value) =>
  String(value || "")
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[.\-•]+/, "").trim());

const IconButton = ({ title, icon, label, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${
      active
        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
        : "border-slate-300 text-slate-700 hover:bg-slate-100"
    }`}
    title={title}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const SummaryCard = ({ icon, label, value }) => (
  <div className="min-w-[170px] flex-1 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-slate-900 p-2 text-white shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data.job);

      if (user?.role === "seeker") {
        const savedState = await api.get(`/saved-jobs/check/${id}`);
        setIsSaved(Boolean(savedState?.data?.saved));
      }
    };
    load();
  }, [id, user?.role]);

  const apply = async () => {
    try {
      await api.post(`/applications/job/${id}`, { coverLetter });
      setMessage("Applied successfully.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Apply failed.");
    }
  };

  const toggleSaveJob = async () => {
    try {
      const { data } = await api.post(`/saved-jobs/${id}`);
      setIsSaved(Boolean(data.saved));
      setMessage(data.message || "Saved job updated.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Could not update saved job.");
    }
  };

  const shareJob = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${job?.title || "Job"} - ${job?.companyName || ""}`,
          text: "Check out this job post",
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setMessage("Job link copied to clipboard.");
      }
    } catch (_error) {
      setMessage("Share cancelled or failed.");
    }
  };

  const printJob = () => {
    window.print();
  };

  const summaryRows = useMemo(() => {
    if (!job) return [];
    return [
      { label: "Vacancy", value: job.vacancy || 1 },
      { label: "Age", value: `${job.minAge || 18} to ${job.maxAge || 60} years` },
      { label: "Location", value: job.location || "N/A" },
      {
        label: "Salary",
        value:
          job.salaryMin || job.salaryMax
            ? `Tk. ${job.salaryMin || 0} - ${job.salaryMax || 0} (Monthly)`
            : "Negotiable"
      },
      {
        label: "Experience",
        value:
          job.experienceLevel === "fresher"
            ? "Freshers are encouraged to apply"
            : `Level: ${job.experienceLevel}`
      }
    ];
  }, [job]);

  if (!job) return <p>Loading...</p>;

  const showSection = (name) => activeTab === "All" || activeTab === name;
  const isSeeker = user?.role === "seeker";
  const isOwnerEmployer =
    (user?.role === "employer" || user?.role === "admin") &&
    user?.id &&
    job?.postedBy?._id &&
    String(user.id) === String(job.postedBy._id);
  const responsibilityLines = toBulletLines(job.responsibilities || job.description);
  const topSummaryCards = [
    {
      label: "Published",
      value: formatDateTime(job.createdAt),
      icon: <CalendarClock size={16} />
    },
    {
      label: "Deadline",
      value: formatDate(job.applicationDeadline),
      icon: <CalendarClock size={16} />
    },
    {
      label: "Type",
      value: job.employmentStatusText || "Full Time",
      icon: <CircleDashed size={16} />
    },
    {
      label: "Workplace",
      value: job.workplace || "office",
      icon: <MapPinned size={16} />
    }
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Back to Jobs
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {isOwnerEmployer ? (
              <button
                type="button"
                onClick={() => navigate(`/my-jobs/${job._id}`)}
                className="inline-flex items-center gap-1 rounded-md border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm text-cyan-800 hover:bg-cyan-100"
              >
                <FilePenLine size={16} />
                Manage Job
              </button>
            ) : null}
            {isSeeker ? (
              <IconButton
                title="Save Job"
                icon={isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                label={isSaved ? "Saved" : "Save Job"}
                onClick={toggleSaveJob}
                active={isSaved}
              />
            ) : null}
            <IconButton title="Share Job" icon={<Share2 size={16} />} label="Share" onClick={shareJob} />
            <IconButton title="Print Job" icon={<Printer size={16} />} label="Print" onClick={printJob} />
          </div>
        </div>

        <p className="text-sm text-slate-500">{job.companyName}</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">{job.title}</h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topSummaryCards.map((item) => (
            <SummaryCard
              key={item.label}
              label={item.label}
              value={
                item.label === "Workplace"
                  ? String(item.value).replace(/^\w/, (char) => char.toUpperCase())
                  : item.value
              }
              icon={item.icon}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {isSeeker ? (
            <button onClick={apply} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
              <Send size={15} />
              Apply Now
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              <BriefcaseBusiness size={15} />
              {isOwnerEmployer ? "You posted this job" : "Viewing as employer"}
            </div>
          )}
        </div>

        {isSeeker ? (
          <div className="mt-4 space-y-2">
            <textarea
              className="w-full rounded-md border p-2"
              rows="4"
              placeholder="Cover letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            {message ? <p className="text-sm text-slate-700">{message}</p> : null}
          </div>
        ) : message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-2 text-sm ${
                activeTab === tab ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {showSection("All") && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {summaryRows.map((row) => (
              <div key={row.label} className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{row.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSection("Requirements") && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Requirements</h3>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <p><span className="font-medium">Education:</span> {job.educationRequirements || "N/A"}</p>
            <p><span className="font-medium">Business Area:</span> {job.businessArea || "N/A"}</p>
            <p><span className="font-medium">Additional Requirements:</span> {job.additionalRequirements || "N/A"}</p>
          </div>
        </div>
      )}

      {showSection("Responsibilities") && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Responsibilities & Context</h3>
          {responsibilityLines.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {responsibilityLines.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-start gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-700">N/A</p>
          )}
        </div>
      )}

      {showSection("Skills & Expertise") && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Skills & Expertise</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(job.skills || []).length > 0 ? (
              job.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600">No skills listed.</p>
            )}
          </div>
        </div>
      )}

      {showSection("Salary & Benefits") && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Compensation & Other Benefits</h3>
          <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{job.benefits || "N/A"}</p>
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-medium">Workplace:</span> {job.workplace || "office"}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            <span className="font-medium">Employment Status:</span> {job.employmentStatusText || "Full Time"}
          </p>
        </div>
      )}

      {showSection("Company Information") && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Company Information</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="font-medium">Company:</span> {job.companyName}</p>
            <p><span className="font-medium">Location:</span> {job.location}</p>
            <p><span className="font-medium">Contact Person:</span> {job.postedBy?.name || "N/A"}</p>
            <p><span className="font-medium">Email:</span> {job.postedBy?.email || "N/A"}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default JobDetails;
