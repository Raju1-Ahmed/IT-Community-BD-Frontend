const AboutUs = () => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-bold text-slate-900">About Us</h2>
      <p className="mt-3 text-slate-700">
        IT Community Bangladesh is a dedicated job platform for Bangladesh's technology sector.
        Our goal is to connect skilled job seekers with private IT companies through one simple and trusted system.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg bg-emerald-50 p-4">
          <h3 className="font-semibold text-emerald-800">For Job Seekers</h3>
          <p className="mt-2 text-sm text-emerald-900">
            Create profile, build resume view, search jobs, and apply with ease.
          </p>
        </article>
        <article className="rounded-lg bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-800">For Employers</h3>
          <p className="mt-2 text-sm text-blue-900">
            Post jobs, manage applications, and find suitable candidates quickly.
          </p>
        </article>
        <article className="rounded-lg bg-slate-100 p-4">
          <h3 className="font-semibold text-slate-800">Our Mission</h3>
          <p className="mt-2 text-sm text-slate-700">
            Strengthen Bangladesh's IT hiring ecosystem with transparent and efficient hiring.
          </p>
        </article>
      </div>
    </section>
  );
};

export default AboutUs;
