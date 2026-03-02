import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const statusOptions = ["applied", "shortlisted", "interview", "rejected", "hired"];

const EmployerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold text-slate-900">Employer Applications</h2>
      <p className="mt-1 text-sm text-slate-600">Applied job seeker data for your posted jobs.</p>

      {loading ? <p className="mt-4">Loading...</p> : null}

      <div className="mt-4 grid gap-3">
        {applications.map((item) => (
          <article key={item._id} className="rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">{item.job?.title || "Job"}</h3>
            <p className="text-sm text-slate-600">
              {item.job?.companyName || "N/A"} • {item.job?.location || "N/A"}
            </p>

            <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
              <p><span className="font-medium">Candidate:</span> {item.candidate?.name || "N/A"}</p>
              <p><span className="font-medium">Email:</span> {item.candidate?.email || "N/A"}</p>
              <p><span className="font-medium">Phone:</span> {item.candidate?.phone || "N/A"}</p>
              <p><span className="font-medium">Location:</span> {item.candidate?.location || "N/A"}</p>
              <p><span className="font-medium">Current Position:</span> {item.candidate?.currentPosition || "N/A"}</p>
              <p><span className="font-medium">Experience:</span> {item.candidate?.experienceYears ?? 0} years</p>
              <p className="md:col-span-2">
                <span className="font-medium">Skills:</span>{" "}
                {(item.candidate?.skills || []).length > 0
                  ? item.candidate.skills.join(", ")
                  : "N/A"}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Status:</span>
              <select
                className="rounded-md border p-2 text-sm"
                value={item.status}
                onChange={(e) => updateStatus(item._id, e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {item.candidate?._id ? (
                <Link
                  to={`/employer/candidate/${item.candidate._id}`}
                  className="rounded-md border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  View Profile
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {!loading && applications.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No applications found yet.</p>
      ) : null}

      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default EmployerApplications;
