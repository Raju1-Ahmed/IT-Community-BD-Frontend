import { useEffect, useState } from "react";
import api from "../api/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const listOrFallback = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr : []);

const Experties = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/premium/experties");
        setProfiles(data.profiles || []);
        setMessage("");
      } catch (error) {
        setMessage(error?.response?.data?.message || "Failed to load experties data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-slate-900">Experties</h2>
        <p className="mt-1 text-sm text-slate-600">
          Job seeker expert-profile page থেকে saved করা data list.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-700">Loading experties...</p> : null}
      {message ? <p className="text-sm text-red-600">{message}</p> : null}

      <div className="grid gap-4">
        {profiles.map((profile) => {
          const imageUrl = profile?.seeker?.profileImage
            ? profile.seeker.profileImage.startsWith("http")
              ? profile.seeker.profileImage
              : `${BACKEND_ORIGIN}${profile.seeker.profileImage}`
            : "";

          return (
            <article key={profile._id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={profile?.seeker?.name || "Seeker"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-600">
                        {(profile?.seeker?.name || "S").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {profile?.seeker?.name || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "N/A"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {profile.preferredRole || profile?.seeker?.currentPosition || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Status: {profile.status || "draft"}</p>
                  <p>Updated: {new Date(profile.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-1 text-sm text-slate-700">
                  <p><span className="font-medium">Headline:</span> {profile.headline || "N/A"}</p>
                  <p><span className="font-medium">Summary:</span> {profile.summary || "N/A"}</p>
                  <p><span className="font-medium">Location:</span> {profile.location || profile?.seeker?.location || "N/A"}</p>
                  <p><span className="font-medium">Experience:</span> {profile.totalExperienceYears || 0} years</p>
                  <p><span className="font-medium">Expected Salary:</span> {profile.expectedSalary || 0} BDT</p>
                  <p>
                    <span className="font-medium">Skills:</span>{" "}
                    {listOrFallback(profile.skills).length > 0 ? profile.skills.join(", ") : "N/A"}
                  </p>
                </div>

                <div className="space-y-1 text-sm text-slate-700">
                  <p><span className="font-medium">Primary Email:</span> {profile.primaryEmail || profile?.seeker?.email || "N/A"}</p>
                  <p><span className="font-medium">Primary Mobile:</span> {profile.primaryMobile || "N/A"}</p>
                  <p><span className="font-medium">Academics:</span> {listOrFallback(profile.academics).length}</p>
                  <p><span className="font-medium">Employment Entries:</span> {listOrFallback(profile.experienceHistory).length}</p>
                  <p><span className="font-medium">Course/Intern Entries:</span> {listOrFallback(profile.coursesOrInternships).length}</p>
                  <p><span className="font-medium">CV:</span> {hasText(profile.cvUrl) ? "Uploaded" : "N/A"}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && profiles.length === 0 ? (
        <p className="text-sm text-slate-600">No experties data found yet.</p>
      ) : null}
    </section>
  );
};

export default Experties;
