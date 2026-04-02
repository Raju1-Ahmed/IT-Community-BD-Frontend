import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

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

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">My Posted Jobs</h2>
      {loading ? <p>Loading...</p> : null}

      <div className="grid gap-3">
        {jobs.map((job) => (
          <article key={job._id} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-emerald-400">
            <Link to={`/my-jobs/${job._id}`}>
              <h3 className="font-semibold text-slate-900">{job.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{job.companyName} - {job.location}</p>
              <p className="mt-1 text-sm text-slate-600">
                {job.jobType} - {job.experienceLevel} - {job.status}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Salary: {job.salaryMin || 0} - {job.salaryMax || 0} BDT
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Published: {formatDateTime(job.createdAt)}
              </p>
              <p className="mt-2 text-xs text-emerald-700">Click to open details and edit this job</p>
            </Link>

            <button
              type="button"
              onClick={() => deleteJob(job._id)}
              className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
            >
              Delete Job
            </button>
          </article>
        ))}
      </div>

      {!loading && jobs.length === 0 ? <p>No jobs posted yet.</p> : null}
      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default MyJobs;
