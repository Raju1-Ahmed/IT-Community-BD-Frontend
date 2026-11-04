 import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());
  const { user } = useAuth();
  const isSeeker = String(user?.role || "").toLowerCase() === "seeker";

  const getJobId = (value) => String(value?._id || value?.id || value || "");

  const loadJobs = async (q = "") => {
    setLoading(true);
    try {
      const jobsRequest = api.get("/jobs", { params: { q } });
      const applicationsRequest = isSeeker ? api.get("/applications/mine", { meta: { skipLoader: true } }) : null;
      const [{ data }, applicationsResponse] = await Promise.all([
        jobsRequest,
        applicationsRequest ? applicationsRequest.catch(() => null) : Promise.resolve(null)
      ]);
      setJobs(data.jobs || []);
      setAppliedJobIds(new Set((applicationsResponse?.data?.applications || []).map((application) => getJobId(application?.job || application?.jobId)).filter(Boolean)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    loadJobs(q);
  }, [searchParams, isSeeker]);

  const handleSearch = () => {
    const trimmed = query.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  return (
    <section>
      <div className="mb-4 flex gap-2">
        <input
          className="w-full rounded-md border p-2"
          placeholder="Search by title/company/skill"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-md bg-slate-800 px-4 py-2 text-white"
        >
          Search
        </button>
      </div>

      {loading ? <p>Loading jobs...</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <article key={job._id} className="rounded-xl border border-slate-200 bg-white p-4 transition">
            <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{job.companyName} • {job.location}</p>
            <p className="mt-2 text-sm text-slate-600">{job.jobType} • {job.experienceLevel}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <Link to={`/jobs/${job._id}`} className="text-sm font-medium text-emerald-700">
                View Details
              </Link>
              {appliedJobIds.has(getJobId(job)) ? <span className="text-sm font-semibold text-emerald-700">Applied</span> : null}
            </div>
          </article>
        ))}
      </div>

      {!loading && jobs.length === 0 ? <p>No jobs found.</p> : null}
    </section>
  );
};

export default Jobs;
