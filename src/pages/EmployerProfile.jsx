import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const EmployerProfile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    location: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    bio: ""
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      companyName: user.companyName || "",
      location: user.location || "",
      phone: user.phone || "",
      linkedin: user.linkedin || "",
      portfolio: user.portfolio || "",
      bio: user.bio || ""
    });

    setProfileImagePreview(
      user.profileImage
        ? user.profileImage.startsWith("http")
          ? user.profileImage
          : `${BACKEND_ORIGIN}${user.profileImage}`
        : ""
    );
  }, [user]);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("companyName", form.companyName);
      payload.append("location", form.location);
      payload.append("phone", form.phone);
      payload.append("linkedin", form.linkedin);
      payload.append("portfolio", form.portfolio);
      payload.append("bio", form.bio);
      if (profileImageFile) payload.append("profileImage", profileImageFile);

      await api.patch("/auth/profile", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await refreshUser();
      setProfileImageFile(null);
      setMessage("Employer profile updated successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold text-slate-900">Employer Profile</h2>
      <p className="mt-1 text-sm text-slate-600">Update company and recruiter profile details.</p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center gap-4 rounded-md border p-3">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
            {profileImagePreview ? (
              <img src={profileImagePreview} alt="Profile preview" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Profile/Company Image</label>
            <input type="file" accept="image/*" onChange={onProfileImageChange} />
          </div>
        </div>

        <input className="rounded-md border p-2" name="name" value={form.name} onChange={onChange} placeholder="Recruiter Name" required />
        <input className="rounded-md border p-2" name="companyName" value={form.companyName} onChange={onChange} placeholder="Company Name" required />
        <input className="rounded-md border p-2" name="location" value={form.location} onChange={onChange} placeholder="Company Location" />
        <input className="rounded-md border p-2" name="phone" value={form.phone} onChange={onChange} placeholder="Contact Number" />
        <input className="rounded-md border p-2" name="linkedin" value={form.linkedin} onChange={onChange} placeholder="LinkedIn URL" />
        <input className="rounded-md border p-2" name="portfolio" value={form.portfolio} onChange={onChange} placeholder="Company Website URL" />
        <textarea className="rounded-md border p-2 md:col-span-2" rows="5" name="bio" value={form.bio} onChange={onChange} placeholder="Company overview / hiring note" />

        <button type="submit" disabled={saving} className="w-fit rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-70">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default EmployerProfile;
