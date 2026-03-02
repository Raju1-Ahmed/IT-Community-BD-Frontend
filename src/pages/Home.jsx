import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-4xl font-bold text-slate-900">IT Community Bangladesh Job Portal</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Private IT companies can post jobs and candidates can search, apply, and track application status.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/jobs" className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          Explore Jobs
        </Link>
        <Link to="/post-job" className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100">
          Employer: Post Job
        </Link>
      </div>
    </section>
  );
};

export default Home;
