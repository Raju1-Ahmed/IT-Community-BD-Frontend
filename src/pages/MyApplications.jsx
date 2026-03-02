import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/applications/mine");
      setApplications(data.applications || []);
    };
    load();
  }, []);

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">My Applications</h2>
      <div className="grid gap-3">
        {applications.map((item) => (
          <article key={item._id} className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">{item.job?.title || "Job"}</h3>
            <p className="text-sm text-slate-600">Status: {item.status}</p>
            <p className="text-sm text-slate-600">Company: {item.job?.companyName || "N/A"}</p>

            {item.job?._id ? (
              <Link
                to={`/jobs/${item.job._id}`}
                className="mt-2 inline-block text-sm font-medium text-emerald-700"
              >
                View Full Job Details
              </Link>
            ) : null}
          </article>
        ))}
      </div>
      {applications.length === 0 ? <p>You have not applied yet.</p> : null}
    </section>
  );
};

export default MyApplications;
