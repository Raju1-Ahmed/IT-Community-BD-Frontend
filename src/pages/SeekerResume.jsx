import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
};

const SeekerResume = () => {
  const { user } = useAuth();

  const imageUrl = user?.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : `${BACKEND_ORIGIN}${user.profileImage}`
    : "";

  return (
    <section className="mx-auto max-w-4xl rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
      <div className="grid md:grid-cols-3">
        <aside className="rounded-l-2xl bg-slate-900 p-6 text-slate-100">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-full ring-4 ring-slate-700">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold">
                {(user?.name || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="mt-4 text-center text-xl font-semibold">{user?.name || "Your Name"}</h2>
          <p className="text-center text-sm text-slate-300">{user?.currentPosition || "Job Seeker"}</p>

          <div className="mt-6 space-y-2 text-sm">
            <p><span className="text-slate-400">Email:</span> {user?.email || "N/A"}</p>
            <p><span className="text-slate-400">Phone:</span> {user?.phone || "N/A"}</p>
            <p><span className="text-slate-400">Location:</span> {user?.location || "N/A"}</p>
            <p><span className="text-slate-400">DOB:</span> {formatDate(user?.dateOfBirth)}</p>
          </div>

          <div className="mt-6 space-y-1 text-sm">
            {user?.github ? <p>GitHub: {user.github}</p> : null}
            {user?.linkedin ? <p>LinkedIn: {user.linkedin}</p> : null}
            {user?.portfolio ? <p>Portfolio: {user.portfolio}</p> : null}
          </div>
        </aside>

        <div className="md:col-span-2 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Resume</h1>
            <Link to="/seeker-profile" className="rounded-md border border-slate-300 px-3 py-1 text-sm">
              Edit Profile
            </Link>
          </div>

          <section className="mb-6">
            <h3 className="border-b pb-1 text-lg font-semibold text-slate-800">Professional Summary</h3>
            <p className="mt-2 text-sm text-slate-700">{user?.bio || "Add your short bio from profile page."}</p>
          </section>

          <section className="mb-6">
            <h3 className="border-b pb-1 text-lg font-semibold text-slate-800">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(user?.skills || []).length > 0 ? (
                user.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-600">No skills added yet.</p>
              )}
            </div>
          </section>

          <section className="mb-6">
            <h3 className="border-b pb-1 text-lg font-semibold text-slate-800">Education</h3>
            <p className="mt-2 text-sm text-slate-700">{user?.education || "No education added."}</p>
          </section>

          <section>
            <h3 className="border-b pb-1 text-lg font-semibold text-slate-800">Career Details</h3>
            <div className="mt-2 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
              <p>Experience: {user?.experienceYears ?? 0} years</p>
              <p>Expected Salary: {user?.expectedSalary ? `${user.expectedSalary} BDT` : "N/A"}</p>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default SeekerResume;
