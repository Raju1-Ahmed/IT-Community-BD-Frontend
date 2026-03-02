import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

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

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data.job);
    };
    load();
  }, [id]);

  const apply = async () => {
    try {
      await api.post(`/applications/job/${id}`, { coverLetter });
      setMessage("Applied successfully.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Apply failed.");
    }
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
      },
      { label: "Published", value: formatDate(job.createdAt) }
    ];
  }, [job]);

  if (!job) return <p>Loading...</p>;

  const showSection = (name) => activeTab === "All" || activeTab === name;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">{job.companyName}</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">{job.title}</h2>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs text-slate-500">Application Deadline</p>
            <p className="text-sm font-semibold text-slate-800">{formatDate(job.applicationDeadline)}</p>
          </div>

          {user?.role === "seeker" ? (
            <button onClick={apply} className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
              Apply Now
            </button>
          ) : null}
        </div>

        {user?.role === "seeker" ? (
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
        ) : null}
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
          {job.encourageVideoCv ? (
            <p className="mt-4 text-sm text-slate-700">Applicants are encouraged to submit Video CV.</p>
          ) : null}
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
          <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{job.responsibilities || job.description || "N/A"}</p>
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
