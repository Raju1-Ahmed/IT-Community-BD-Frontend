import { useEffect, useState } from "react";
import api from "../api/client";

const PremiumReactivate = () => {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/premium/me");
      setProfile(data.profile);
    };
    load();
  }, []);

  const reactivate = async () => {
    try {
      const { data } = await api.post("/premium/me/reactivate");
      setProfile(data.profile);
      setMessage(data.message);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to reactivate.");
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold">Premium Reactivation</h2>
      <p className="mt-2 text-sm text-slate-700">Current status: {profile?.status || "N/A"}</p>
      <p className="mt-1 text-sm text-slate-700">If expired, reactivate and pay ৳99 to get another 30 days.</p>
      <button type="button" onClick={reactivate} className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-white">Start Reactivation</button>
      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default PremiumReactivate;
