import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import LogoLoader from "../components/LogoLoader";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes, appsRes, contactsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/jobs"),
        api.get("/admin/applications"),
        api.get("/admin/contact-messages")
      ]);
      setStats(statsRes.data.stats || null);
      setUsers(usersRes.data.users || []);
      setJobs(jobsRes.data.jobs || []);
      setApplications(appsRes.data.applications || []);
      setContacts(contactsRes.data.messages || []);
      setMessage("");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const updateUserRole = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setMessage("User role updated");
      loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update role");
    }
  };

  const updateJobStatus = async (jobId, status) => {
    try {
      await api.patch(`/admin/jobs/${jobId}/status`, { status });
      setMessage("Job status updated");
      loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update job status");
    }
  };

  if (loading) return <LogoLoader variant="page" label="Loading admin dashboard..." />;

  return (
    <section className="space-y-5 lg:space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Website Admin Panel</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Owner controls for users, jobs, applications, premium and contact inbox.
            </p>
          </div>
          <Link
            to="/admin/premium-queue"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
          >
            Open Premium Queue
          </Link>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8">
        <StatCard label="Users" value={stats?.users} />
        <StatCard label="Employers" value={stats?.employers} />
        <StatCard label="Seekers" value={stats?.seekers} />
        <StatCard label="Jobs" value={stats?.jobs} />
        <StatCard label="Active Jobs" value={stats?.activeJobs} />
        <StatCard label="Applications" value={stats?.applications} />
        <StatCard label="Contacts" value={stats?.contactMessages} />
        <StatCard label="Premium Pending" value={stats?.premiumPendingReview} />
      </div>

      <SectionCard title="Users">
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-slate-200">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">
                    <select
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                      value={user.role}
                      onChange={(e) => updateUserRole(user._id, e.target.value)}
                    >
                      <option value="seeker">seeker</option>
                      <option value="employer">employer</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 md:hidden">
          {users.map((user) => (
            <article key={user._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name || "Unnamed user"}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">{user.email || "No email"}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">
                  {user.role}
                </span>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Change Role
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm"
                  value={user.role}
                  onChange={(e) => updateUserRole(user._id, e.target.value)}
                >
                  <option value="seeker">seeker</option>
                  <option value="employer">employer</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Jobs">
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-2">Title</th>
                <th className="p-2">Company</th>
                <th className="p-2">Status</th>
                <th className="p-2">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} className="border-t border-slate-200">
                  <td className="p-2">{job.title}</td>
                  <td className="p-2">{job.companyName}</td>
                  <td className="p-2">{job.status}</td>
                  <td className="p-2">
                    <select
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                      value={job.status}
                      onChange={(e) => updateJobStatus(job._id, e.target.value)}
                    >
                      <option value="active">active</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 md:hidden">
          {jobs.map((job) => (
            <article key={job._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{job.title || "Untitled job"}</p>
                  <p className="mt-1 text-xs text-slate-500">{job.companyName || "No company name"}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">
                  {job.status}
                </span>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Update Status
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm"
                  value={job.status}
                  onChange={(e) => updateJobStatus(job._id, e.target.value)}
                >
                  <option value="active">active</option>
                  <option value="closed">closed</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Recent Applications">
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-2">Candidate</th>
                <th className="p-2">Email</th>
                <th className="p-2">Job</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application._id} className="border-t border-slate-200">
                  <td className="p-2">{application.candidate?.name || "N/A"}</td>
                  <td className="p-2">{application.candidate?.email || "N/A"}</td>
                  <td className="p-2">{application.job?.title || "N/A"}</td>
                  <td className="p-2">{application.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 md:hidden">
          {applications.map((application) => (
            <article key={application._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {application.candidate?.name || "Unknown candidate"}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {application.candidate?.email || "No email"}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">
                  {application.status}
                </span>
              </div>
              <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                <span className="font-semibold text-slate-900">Job:</span> {application.job?.title || "N/A"}
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Contact Inbox">
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Subject</th>
                <th className="p-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id} className="border-t border-slate-200">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.email}</td>
                  <td className="p-2">{c.subject || "N/A"}</td>
                  <td className="p-2 max-w-xs truncate" title={c.message}>{c.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 md:hidden">
          {contacts.map((c) => (
            <article key={c._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.name || "Unknown sender"}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">{c.email || "No email"}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {c.subject || "No subject"}
                </span>
              </div>
              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
                {c.message}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>
    </section>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-sm">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value ?? 0}</p>
    </article>
  );
};

const SectionCard = ({ title, children }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h3>
      {children}
    </div>
  );
};

export default AdminDashboard;
