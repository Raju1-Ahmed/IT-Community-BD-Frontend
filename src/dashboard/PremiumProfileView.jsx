import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import PremiumStatusCard from "./PremiumStatusCard";

const PremiumProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [minimumExperienceYears, setMinimumExperienceYears] = useState(3);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/premium/me");
      setProfile(data.profile);
      setMinimumExperienceYears(data.minimumExperienceYears || 3);
    };
    load();
  }, []);

  return (
    <section className="space-y-4">
      <PremiumStatusCard profile={profile} minimumExperienceYears={minimumExperienceYears} />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-bold">Premium Profile Overview</h2>
        <p className="mt-2 text-sm text-slate-700">Headline: {profile?.headline || "N/A"}</p>
        <p className="mt-1 text-sm text-slate-700">Preferred Role: {profile?.preferredRole || "N/A"}</p>
        <p className="mt-1 text-sm text-slate-700">Experience: {profile?.totalExperienceYears || 0} years</p>
        <p className="mt-1 text-sm text-slate-700">Location: {profile?.location || "N/A"}</p>
        <p className="mt-1 text-sm text-slate-700">Skills: {(profile?.skills || []).join(", ") || "N/A"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/dashboard/premium/form" className="rounded-md border border-slate-300 px-3 py-2 text-sm">Edit Form</Link>
          <Link to="/dashboard/premium/billing" className="rounded-md border border-slate-300 px-3 py-2 text-sm">Billing</Link>
          <Link to="/dashboard/premium/reactivate" className="rounded-md border border-slate-300 px-3 py-2 text-sm">Reactivate</Link>
        </div>
      </div>
    </section>
  );
};

export default PremiumProfileView;
