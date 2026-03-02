const PrivacyPolicy = () => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-bold text-slate-900">Privacy Policy</h2>
      <p className="mt-3 text-sm text-slate-600">Last updated: March 2, 2026</p>

      <div className="mt-5 space-y-4 text-sm text-slate-700">
        <p>
          IT Community BD respects your privacy. This policy explains what data we collect, how we
          use it, and how we protect it.
        </p>
        <p>
          We may collect account details, profile information, job applications, and activity data
          needed to provide job matching and hiring services.
        </p>
        <p>
          Your data is used for authentication, profile management, job applications, platform
          analytics, and support purposes.
        </p>
        <p>
          We do not sell personal data. Data may be shared only with relevant employers when you
          apply for a job, and with service providers required to operate this platform.
        </p>
        <p>
          You can request profile updates or account removal by contacting support through the
          contact page.
        </p>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
