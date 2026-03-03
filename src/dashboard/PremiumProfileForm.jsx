import { useEffect, useState } from "react";
import api from "../api/client";
import PremiumStatusCard from "./PremiumStatusCard";

const PremiumProfileForm = () => {
  const [profile, setProfile] = useState(null);
  const [minimumExperienceYears, setMinimumExperienceYears] = useState(3);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    headline: "",
    summary: "",
    totalExperienceYears: "",
    preferredRole: "",
    expectedSalary: "",
    location: "",
    skills: "",
    experienceHistory: ""
  });
  const [docs, setDocs] = useState({
    cv: null,
    experienceLetter: null,
    companyIdCard: null,
    additionalDoc: null
  });

  const loadProfile = async () => {
    const { data } = await api.get("/premium/me");
    const p = data.profile;
    setProfile(p);
    setMinimumExperienceYears(data.minimumExperienceYears || 3);
    setForm({
      headline: p.headline || "",
      summary: p.summary || "",
      totalExperienceYears: p.totalExperienceYears ?? "",
      preferredRole: p.preferredRole || "",
      expectedSalary: p.expectedSalary ?? "",
      location: p.location || "",
      skills: Array.isArray(p.skills) ? p.skills.join(", ") : "",
      experienceHistory: Array.isArray(p.experienceHistory) ? JSON.stringify(p.experienceHistory, null, 2) : ""
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSaveDraft = async (e) => {
    e.preventDefault();
    try {
      await api.post("/premium/me", {
        ...form,
        totalExperienceYears: Number(form.totalExperienceYears) || 0,
        expectedSalary: Number(form.expectedSalary) || 0,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experienceHistory: form.experienceHistory || "[]"
      });
      await loadProfile();
      setMessage("Premium draft saved.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save draft.");
    }
  };

  const onUploadDocs = async () => {
    try {
      const fd = new FormData();
      if (docs.cv) fd.append("cv", docs.cv);
      if (docs.experienceLetter) fd.append("experienceLetter", docs.experienceLetter);
      if (docs.companyIdCard) fd.append("companyIdCard", docs.companyIdCard);
      if (docs.additionalDoc) fd.append("additionalDoc", docs.additionalDoc);

      await api.post("/premium/me/upload-docs", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await loadProfile();
      setMessage("Documents uploaded.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Document upload failed.");
    }
  };

  const onSubmitForPayment = async () => {
    try {
      await api.post("/premium/me/submit");
      await loadProfile();
      setMessage("Submitted. Now complete payment.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Submission failed.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Premium Package: ৳99 for 30 days. Admin approval is required before public listing.
      </div>

      <PremiumStatusCard profile={profile} minimumExperienceYears={minimumExperienceYears} />

      <form onSubmit={onSaveDraft} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-2">
        <h2 className="md:col-span-2 text-2xl font-bold text-slate-900">Premium Profile Form</h2>
        <input className="rounded-md border p-2" placeholder="Headline" value={form.headline} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))} />
        <input className="rounded-md border p-2" placeholder="Preferred Role" value={form.preferredRole} onChange={(e) => setForm((p) => ({ ...p, preferredRole: e.target.value }))} />
        <input className="rounded-md border p-2" type="number" placeholder="Total Experience Years" value={form.totalExperienceYears} onChange={(e) => setForm((p) => ({ ...p, totalExperienceYears: e.target.value }))} />
        <input className="rounded-md border p-2" type="number" placeholder="Expected Salary" value={form.expectedSalary} onChange={(e) => setForm((p) => ({ ...p, expectedSalary: e.target.value }))} />
        <input className="rounded-md border p-2" placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
        <input className="rounded-md border p-2" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} />
        <textarea className="md:col-span-2 rounded-md border p-2" rows="4" placeholder="Summary" value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} />
        <textarea className="md:col-span-2 rounded-md border p-2 font-mono text-xs" rows="6" placeholder='Experience History JSON [{"companyName":"...","role":"..."}]' value={form.experienceHistory} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: e.target.value }))} />
        <button className="w-fit rounded-md bg-slate-800 px-4 py-2 text-white" type="submit">Save Draft</button>
      </form>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-2">
        <h3 className="md:col-span-2 text-xl font-semibold">Required Documents</h3>
        <label className="text-sm">CV <input type="file" className="mt-1 block" onChange={(e) => setDocs((p) => ({ ...p, cv: e.target.files?.[0] || null }))} /></label>
        <label className="text-sm">Experience Letter <input type="file" className="mt-1 block" onChange={(e) => setDocs((p) => ({ ...p, experienceLetter: e.target.files?.[0] || null }))} /></label>
        <label className="text-sm">Company ID Card <input type="file" className="mt-1 block" onChange={(e) => setDocs((p) => ({ ...p, companyIdCard: e.target.files?.[0] || null }))} /></label>
        <label className="text-sm">Additional Doc <input type="file" className="mt-1 block" onChange={(e) => setDocs((p) => ({ ...p, additionalDoc: e.target.files?.[0] || null }))} /></label>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button type="button" onClick={onUploadDocs} className="rounded-md border border-slate-300 px-4 py-2">Upload Documents</button>
          <button type="button" onClick={onSubmitForPayment} className="rounded-md bg-emerald-600 px-4 py-2 text-white">Submit for Payment</button>
        </div>
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default PremiumProfileForm;
