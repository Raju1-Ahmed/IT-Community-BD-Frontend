import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        <h1 className="text-4xl font-bold text-slate-900">IT Community Bangladesh Job Portal</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          বাংলাদেশ আইটি সেক্টরের চাকরি খোঁজা এবং চাকরি পোস্ট করার জন্য একটি একীভূত প্ল্যাটফর্ম।
          এখানে Job Seeker এবং Employer উভয়েই দ্রুত এবং সহজভাবে প্রয়োজনীয় সেবা নিতে পারবে।
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="mb-2 text-sm font-medium text-slate-700">চাকরি খুঁজুন</p>
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              className="w-full rounded-md border border-slate-300 bg-white p-3 text-base"
              placeholder="জব টাইটেল, কোম্পানি বা স্কিল লিখুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              onClick={onSearch}
              className="rounded-md bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
            >
              Search Jobs
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/jobs" className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
            চাকরি খুঁজুন
          </Link>
          <Link to="/post-job" className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100">
            চাকরি পোস্ট করুন
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">সাম্প্রতিক চাকরি</h2>
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
          <p className="mt-3 text-sm text-slate-600">এখনও কোনো চাকরি পোস্ট করা হয়নি।</p>
        ) : null}
      </div>
    </section>
  );
};

export default Home;
