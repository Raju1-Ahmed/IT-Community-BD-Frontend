import { useEffect, useState } from "react";
import api from "../api/client";

const PremiumBilling = () => {
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [method, setMethod] = useState("manual");
  const [paymentId, setPaymentId] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [note, setNote] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data } = await api.get("/premium/me");
    setProfile(data.profile);
    setPayments(data.payments || []);
  };

  useEffect(() => {
    load();
  }, []);

  const initiate = async () => {
    try {
      const { data } = await api.post("/premium/me/payment/initiate", { method });
      setPaymentId(data.payment?._id || "");
      setMessage("Payment initiated. Submit transaction reference after payment.");
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to initiate payment.");
    }
  };

  const submitPayment = async () => {
    try {
      const fd = new FormData();
      fd.append("paymentId", paymentId);
      fd.append("transactionRef", transactionRef);
      fd.append("note", note);
      if (paymentProof) fd.append("paymentProof", paymentProof);

      await api.post("/premium/me/payment/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage("Payment submitted. Admin verification pending.");
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Payment submission failed.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-bold">Premium Billing</h2>
        <p className="mt-2 text-sm text-slate-700">Amount: ৳{profile?.packageAmount || 99} for {profile?.packageDays || 30} days</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select className="rounded-md border p-2" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="manual">Manual</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="sslcommerz">SSLCommerz</option>
          </select>
          <button type="button" onClick={initiate} className="rounded-md bg-emerald-600 px-4 py-2 text-white">Initiate Payment</button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-semibold">Submit Payment Reference</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="rounded-md border p-2" placeholder="Payment ID" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} />
          <input className="rounded-md border p-2" placeholder="Transaction Reference" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} />
          <input className="rounded-md border p-2 md:col-span-2" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <label className="md:col-span-2 text-sm">Payment Proof
            <input type="file" className="mt-1 block" onChange={(e) => setPaymentProof(e.target.files?.[0] || null)} />
          </label>
          <button type="button" onClick={submitPayment} className="w-fit rounded-md bg-slate-800 px-4 py-2 text-white">Submit Payment</button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-semibold">Recent Payments</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          {payments.map((p) => (
            <div key={p._id} className="rounded-md bg-slate-50 p-2">
              {p.method} • {p.status} • ৳{p.amount} • {p.transactionRef || "No ref"}
            </div>
          ))}
          {payments.length === 0 ? <p>No payment records yet.</p> : null}
        </div>
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default PremiumBilling;
