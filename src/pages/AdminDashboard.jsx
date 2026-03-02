import { useEffect, useState } from "react";
import api from "../api/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes, appsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/jobs"),
        api.get("/admin/applications")
      ]);
      setStats(statsRes.data.stats || null);
      setUsers(usersRes.data.users || []);
      setJobs(jobsRes.data.jobs || []);
      setApplications(appsRes.data.applications || []);
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

  if (loading) return <p>Loading admin dashboard...</p>;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Users" value={stats?.users} />
        <StatCard label="Employers" value={stats?.employers} />
        <StatCard label="Seekers" value={stats?.seekers} />
        <StatCard label="Jobs" value={stats?.jobs} />
        <StatCard label="Active Jobs" value={stats?.activeJobs} />
        <StatCard label="Applications" value={stats?.applications} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-xl font-semibold">Users</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50">
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
                      className="rounded-md border p-1"
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-xl font-semibold">Jobs</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50">
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
                      className="rounded-md border p-1"
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-xl font-semibold">Recent Applications</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50">
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
      </div>
    </section>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value ?? 0}</p>
    </article>
  );
};

export default AdminDashboard;
