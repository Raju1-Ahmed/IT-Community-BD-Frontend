import { useEffect, useState } from "react";
import api from "../api/client";

const AdminPremiumQueue = () => {
  const [profiles, setProfiles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/premium/admin/queue");
      setProfiles(data.profiles || []);
      setPayments(data.payments || []);
      setMessage("");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load queue.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const verifyPayment = async (paymentId, action) => {
    try {
      await api.patch(`/premium/admin/payment/${paymentId}`, { action });
      setMessage(`Payment ${action}.`);
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Payment update failed.");
    }
  };

  const reviewProfile = async (profileId, action) => {
    try {
      await api.patch(`/premium/admin/review/${profileId}`, { action });
      setMessage(`Profile ${action}d.`);
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Profile review failed.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-bold">Admin Premium Queue</h2>
        <p className="mt-1 text-sm text-slate-600">Verify payments and approve premium profiles.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-semibold">Pending Payment Verification</h3>
        <div className="mt-3 space-y-2">
          {payments.map((p) => (
            <div key={p._id} className="rounded-md border border-slate-200 p-3 text-sm">
              <p>{p.seeker?.name} • {p.method} • Ref: {p.transactionRef || "N/A"}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => verifyPayment(p._id, "verified")} className="rounded-md bg-emerald-600 px-3 py-1 text-white">Verify</button>
                <button type="button" onClick={() => verifyPayment(p._id, "rejected")} className="rounded-md bg-red-600 px-3 py-1 text-white">Reject</button>
              </div>
            </div>
          ))}
          {payments.length === 0 ? <p className="text-sm text-slate-600">No submitted payments.</p> : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-semibold">Pending Profile Review</h3>
        <div className="mt-3 space-y-2">
          {profiles.map((p) => (
            <div key={p._id} className="rounded-md border border-slate-200 p-3 text-sm">
              <p>{p.seeker?.name} • {p.headline || "No headline"} • {p.totalExperienceYears || 0} years</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => reviewProfile(p._id, "approve")} className="rounded-md bg-emerald-600 px-3 py-1 text-white">Approve</button>
                <button type="button" onClick={() => reviewProfile(p._id, "reject")} className="rounded-md bg-red-600 px-3 py-1 text-white">Reject</button>
              </div>
            </div>
          ))}
          {profiles.length === 0 ? <p className="text-sm text-slate-600">No pending profiles.</p> : null}
        </div>
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default AdminPremiumQueue;
