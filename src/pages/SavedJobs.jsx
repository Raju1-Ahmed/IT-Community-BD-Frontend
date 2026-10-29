import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { Skeleton } from "../components/loaders/Skeleton";

const SavedJobsSkeleton = () => (
  <div className="mt-4 space-y-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={`saved-job-skeleton-${index}`} className="rounded-2xl bg-slate-50/80 p-4">
        <div className="space-y-3 animate-pulse">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/saved-jobs/mine");
      setSavedJobs(data.savedJobs || []);
      setMessage("");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const removeSaved = async (jobId) => {
    try {
      await api.post(`/saved-jobs/${jobId}`);
      setSavedJobs((prev) => prev.filter((item) => item.job?._id !== jobId));
      setMessage("Removed from saved jobs.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to remove saved job.");
    }
  };

  return (
    <section className="-mx-4 min-w-0 bg-white px-4 py-2 sm:mx-0 sm:px-0 sm:py-0">
      <h2 className="text-2xl font-bold text-slate-900">Saved Jobs</h2>
      <p className="mt-1 text-sm text-slate-600">Jobs you saved for later review.</p>

      {loading ? <SavedJobsSkeleton /> : null}

      {!loading ? <div className="mt-4 grid gap-3">
        {savedJobs.map((item) => (
          <article key={item._id} className="rounded-2xl bg-slate-50/80 p-4 transition hover:bg-emerald-50/50 sm:p-5">
            <h3 className="font-semibold text-slate-900">{item.job?.title || "Job"}</h3>
            <p className="mt-1 text-sm text-slate-600">
              {item.job?.companyName || "N/A"} • {item.job?.location || "N/A"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {item.job?.jobType || "N/A"} • {item.job?.experienceLevel || "N/A"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {item.job?._id ? (
                <Link
                  to={`/jobs/${item.job._id}`}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  View Details
                </Link>
              ) : null}
              {item.job?._id ? (
                <button
                  type="button"
                  onClick={() => removeSaved(item.job._id)}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-900"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div> : null}

      {!loading && savedJobs.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No saved jobs yet.</p>
      ) : null}

      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default SavedJobs;
