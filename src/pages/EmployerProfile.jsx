import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Phone, Globe, Linkedin, User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

// reusable components
const Input = ({ label, hint, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <input className="rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" {...props} />
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

const TextArea = ({ label, hint, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <textarea className="rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" {...props} />
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

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
  const [isDirty, setIsDirty] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // profile completion
  const getCompletion = () => {
    const fields = Object.values(form);
    const filled = fields.filter((f) => f && f.trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

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

  const onChange = (e) => {
    setIsDirty(true);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // image upload
  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setMessage("Only image allowed.");
    }

    if (file.size > 2 * 1024 * 1024) {
      return setMessage("Max 2MB file.");
    }

    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview("");
    setIsDirty(true);
  };

  const validate = () => {
    if (!form.name || !form.companyName) return "Required fields missing.";
    if (form.linkedin && !form.linkedin.startsWith("http")) return "Invalid LinkedIn URL.";
    return null;
  };

  const onSubmit = async () => {
    const error = validate();
    if (error) return setMessage(error);

    setSaving(true);
    setMessage("");

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (profileImageFile) payload.append("profileImage", profileImageFile);

      await api.patch("/auth/profile", payload);
      await refreshUser();

      setMessage("✅ Profile saved!");
      setIsDirty(false);

      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("❌ Failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 pb-24">

      {/* FORM */}
      <section className="md:col-span-2 bg-white p-6 rounded-xl border">
        <h2 className="text-2xl font-bold">Employer Profile</h2>

        {/* progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs">
            <span>Profile Completion</span>
            <span>{getCompletion()}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded mt-1">
            <div className="h-2 bg-emerald-600 rounded" style={{ width: `${getCompletion()}%` }} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">

          {/* IMAGE */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`md:col-span-2 border-2 border-dashed p-6 rounded-xl text-center ${
              dragActive ? "border-emerald-500 bg-emerald-50" : ""
            }`}
          >
            {profileImagePreview ? (
              <div className="flex flex-col items-center gap-3">
                <img src={profileImagePreview} className="h-24 w-24 rounded-full object-cover" />
                <div className="flex gap-3">
                  <label className="text-blue-600 cursor-pointer text-sm">
                    Change
                    <input type="file" hidden onChange={(e) => handleFile(e.target.files[0])} />
                  </label>
                  <button onClick={removeImage} className="text-red-500 text-sm">Remove</button>
                </div>
              </div>
            ) : (
              <>
                <p>Drag & drop or upload image</p>
                <input type="file" onChange={(e) => handleFile(e.target.files[0])} />
              </>
            )}
          </div>

          <Input name="name" value={form.name} onChange={onChange} label="Recruiter Name" />
          <Input name="companyName" value={form.companyName} onChange={onChange} label="Company Name" />

          <Input name="location" value={form.location} onChange={onChange} label="Location" />
          <Input name="phone" value={form.phone} onChange={onChange} label="Phone" />

          <Input name="linkedin" value={form.linkedin} onChange={onChange} label="LinkedIn" />
          <Input name="portfolio" value={form.portfolio} onChange={onChange} label="Website" />

          <TextArea name="bio" value={form.bio} onChange={onChange} label="Company Bio" className="md:col-span-2" />
        </div>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </section>

      {/* PREMIUM LIVE PREVIEW */}
      <section className="bg-gray-50 p-6 rounded-xl border">
        <h3 className="font-semibold mb-4">Live Preview</h3>

        <div className="bg-white p-5 rounded-xl shadow space-y-4">

          {/* header */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
              {profileImagePreview && <img src={profileImagePreview} className="w-full h-full object-cover" />}
            </div>

            <div>
              <h4 className="text-lg font-semibold">{form.companyName || "Company Name"}</h4>
              <p className="text-sm text-gray-500">{form.location}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <User size={12} /> {form.name || "Recruiter"}
              </p>
            </div>
          </div>

          {/* contact */}
          <div className="border-t pt-3 text-sm space-y-2">
            <p className="flex items-center gap-2">
              <Phone size={14} /> {form.phone || "No phone"}
            </p>

            <p className="flex items-center gap-2">
              <Linkedin size={14} />
              {form.linkedin ? (
                <a href={form.linkedin} target="_blank" className="text-blue-600 underline">
                  LinkedIn Profile
                </a>
              ) : "No LinkedIn"}
            </p>

            <p className="flex items-center gap-2">
              <Globe size={14} />
              {form.portfolio ? (
                <a href={form.portfolio} target="_blank" className="text-blue-600 underline">
                  Website
                </a>
              ) : "No Website"}
            </p>
          </div>

          {/* bio */}
          <div className="border-t pt-3">
            <h5 className="text-sm font-semibold mb-1">About Company</h5>
            <p className="text-sm text-gray-600">
              {form.bio || "No description yet."}
            </p>
          </div>

          {/* strength */}
          <div className="border-t pt-3">
            <div className="h-2 bg-gray-200 rounded">
              <div className="h-2 bg-emerald-500 rounded" style={{ width: `${getCompletion()}%` }} />
            </div>
            <p className="text-xs mt-1 text-gray-400">{getCompletion()}% completed</p>
          </div>

        </div>
      </section>

      {/* STICKY SAVE */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-between items-center">
        <p className="text-sm">{isDirty ? "Unsaved changes" : "All saved"}</p>

        <button
          onClick={onSubmit}
          disabled={!isDirty || saving}
          className="bg-emerald-600 text-white px-5 py-2 rounded flex gap-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

    </div>
  );
};

export default EmployerProfile;