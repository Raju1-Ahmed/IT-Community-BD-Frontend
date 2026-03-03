import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";

const PremiumTalentDetails = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/premium/public/${id}`);
        setProfile(data.profile);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>Profile not found.</p>;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Premium Talent Profile</h2>
        <Link to="/dashboard/premium/talent" className="rounded-md border border-slate-300 px-3 py-2 text-sm">Back</Link>
      </div>

      <p className="text-sm text-slate-600">Name: {profile.seeker?.name || "N/A"}</p>
      <p className="text-sm text-slate-600">Email: {profile.seeker?.email || "N/A"}</p>
      <p className="text-sm text-slate-600">Preferred Role: {profile.preferredRole || "N/A"}</p>
      <p className="text-sm text-slate-600">Experience: {profile.totalExperienceYears || 0} years</p>
      <p className="text-sm text-slate-600">Location: {profile.location || profile.seeker?.location || "N/A"}</p>
      <p className="text-sm text-slate-600">Skills: {(profile.skills || []).join(", ") || "N/A"}</p>
      <p className="mt-2 text-sm text-slate-700">Summary: {profile.summary || profile.seeker?.bio || "N/A"}</p>
    </section>
  );
};

export default PremiumTalentDetails;
