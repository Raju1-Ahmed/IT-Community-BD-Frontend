import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, BriefcaseBusiness, PlusCircle, Sparkles } from "lucide-react";
import api from "../api/client";

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentJobs = async () => {
      try {
        const { data } = await api.get("/jobs");
        setJobs((data.jobs || []).slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    loadRecentJobs();
  }, []);

  const onSearch = () => {
    const query = search.trim();
    navigate(query ? `/jobs?q=${encodeURIComponent(query)}` : "/jobs");
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <Sparkles size={14} />
          Bangladesh IT Jobs Platform
        </div>

        <h1 className="mt-4 text-4xl font-bold text-slate-900">Find Jobs. Hire Talent. Build Careers.</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          IT Community BD connects job seekers and employers in one productive platform. Search jobs,
          apply quickly, post vacancies, and manage hiring workflows efficiently.
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="mb-2 text-sm font-medium text-slate-700">Search Jobs</p>
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              className="w-full rounded-md border border-slate-300 bg-white p-3 text-base"
              placeholder="Job title, company, or skill"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
            >
              <Search size={18} />
              Search Jobs
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/jobs" className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
            <BriefcaseBusiness size={16} />
            চাকরি খুঁজুন
          </Link>
          <Link to="/post-job" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100">
            <PlusCircle size={16} />
            চাকরি পোস্ট করুন
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Recent Jobs</h2>
        {loading ? <p className="mt-3 text-sm text-slate-600">Loading recent jobs...</p> : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {jobs.map((job) => (
            <Link
              to={`/jobs/${job._id}`}
              key={job._id}
              className="rounded-lg border border-slate-200 p-4 hover:border-emerald-400"
            >
              <h3 className="font-semibold text-slate-900">{job.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{job.companyName} • {job.location}</p>
              <p className="mt-1 text-sm text-slate-600">{job.jobType} • {job.experienceLevel}</p>
            </Link>
          ))}
        </div>

        {!loading && jobs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No jobs posted yet.</p>
        ) : null}
      </div>
    </section>
  );
};

export default Home;
