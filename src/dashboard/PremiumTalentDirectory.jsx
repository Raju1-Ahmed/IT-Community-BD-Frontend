import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const PremiumTalentDirectory = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/premium/public");
        setProfiles(data.profiles || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold">Verified Experienced Talent</h2>
      <p className="mt-1 text-sm text-slate-600">Approved premium profiles for fast hiring.</p>

      {loading ? <p className="mt-3">Loading...</p> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {profiles.map((p) => (
          <article key={p._id} className="rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">{p.seeker?.name || "Candidate"}</h3>
            <p className="mt-1 text-sm text-slate-600">{p.preferredRole || p.seeker?.currentPosition || "N/A"}</p>
            <p className="mt-1 text-sm text-slate-600">Experience: {p.totalExperienceYears || 0} years</p>
            <p className="mt-1 text-sm text-slate-600">Location: {p.location || p.seeker?.location || "N/A"}</p>
            <p className="mt-1 text-sm text-slate-600">Skills: {(p.skills || []).slice(0, 6).join(", ") || "N/A"}</p>
            <Link to={`/dashboard/premium/talent/${p._id}`} className="mt-3 inline-block text-sm font-medium text-emerald-700">View Profile</Link>
          </article>
        ))}
      </div>

      {!loading && profiles.length === 0 ? <p className="mt-3 text-sm">No approved premium profiles yet.</p> : null}
    </section>
  );
};

export default PremiumTalentDirectory;
