import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const SeekerProfile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    currentPosition: "",
    experienceYears: "",
    expectedSalary: "",
    education: "",
    dateOfBirth: "",
    github: "",
    linkedin: "",
    portfolio: "",
    skills: "",
    bio: ""
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      location: user.location || "",
      phone: user.phone || "",
      currentPosition: user.currentPosition || "",
      experienceYears: user.experienceYears ?? "",
      expectedSalary: user.expectedSalary ?? "",
      education: user.education || "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : "",
      github: user.github || "",
      linkedin: user.linkedin || "",
      portfolio: user.portfolio || "",
      skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
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

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
      payload.append("location", form.location);
      payload.append("phone", form.phone);
      payload.append("currentPosition", form.currentPosition);
      payload.append("experienceYears", form.experienceYears === "" ? "0" : String(form.experienceYears));
      payload.append("expectedSalary", form.expectedSalary === "" ? "0" : String(form.expectedSalary));
      payload.append("education", form.education);
      payload.append("dateOfBirth", form.dateOfBirth || "");
      payload.append("github", form.github);
      payload.append("linkedin", form.linkedin);
      payload.append("portfolio", form.portfolio);
      payload.append("skills", form.skills);
      payload.append("bio", form.bio);
      if (profileImageFile) {
        payload.append("profileImage", profileImageFile);
      }

      await api.patch("/auth/profile", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await refreshUser();
      setProfileImageFile(null);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold text-slate-900">Seeker Profile</h2>
      <p className="mt-1 text-sm text-slate-600">Update biodata and profile picture.</p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center gap-4 rounded-md border p-3">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
            {profileImagePreview ? (
              <img src={profileImagePreview} alt="Profile preview" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Profile Picture</label>
            <input type="file" accept="image/*" onChange={onProfileImageChange} />
            <p className="text-xs text-slate-500">Allowed: image files, max 3MB.</p>
          </div>
        </div>

        <input className="rounded-md border p-2" name="name" value={form.name} onChange={onChange} placeholder="Full Name" required />
        <input className="rounded-md border p-2" name="phone" value={form.phone} onChange={onChange} placeholder="Phone Number" />
        <input className="rounded-md border p-2" name="location" value={form.location} onChange={onChange} placeholder="Location" />
        <input className="rounded-md border p-2" name="currentPosition" value={form.currentPosition} onChange={onChange} placeholder="Current Position" />
        <input className="rounded-md border p-2" name="experienceYears" type="number" min="0" value={form.experienceYears} onChange={onChange} placeholder="Experience (Years)" />
        <input className="rounded-md border p-2" name="expectedSalary" type="number" min="0" value={form.expectedSalary} onChange={onChange} placeholder="Expected Salary (BDT)" />
        <input className="rounded-md border p-2" name="education" value={form.education} onChange={onChange} placeholder="Education" />
        <input className="rounded-md border p-2" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={onChange} />
        <input className="rounded-md border p-2" name="github" value={form.github} onChange={onChange} placeholder="GitHub URL" />
        <input className="rounded-md border p-2" name="linkedin" value={form.linkedin} onChange={onChange} placeholder="LinkedIn URL" />
        <input className="rounded-md border p-2 md:col-span-2" name="portfolio" value={form.portfolio} onChange={onChange} placeholder="Portfolio URL" />
        <input className="rounded-md border p-2 md:col-span-2" name="skills" value={form.skills} onChange={onChange} placeholder="Skills (comma separated)" />
        <textarea className="rounded-md border p-2 md:col-span-2" name="bio" value={form.bio} onChange={onChange} rows="5" placeholder="Short Bio / Career Summary" />

        <button type="submit" disabled={saving} className="w-fit rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-70">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      <div className="mt-3">
        <Link to="/seeker-resume" className="text-sm font-medium text-emerald-700">
          View Resume Design
        </Link>
      </div>
    </section>
  );
};

export default SeekerProfile;
