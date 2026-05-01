import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Building2, Globe, Linkedin, MapPin, Phone, UploadCloud, User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const Input = ({ label, hint, className = "", ...props }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <input
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      {...props}
    />
    {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
  </div>
);

const TextArea = ({ label, hint, className = "", ...props }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <textarea
      className="min-h-[132px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      {...props}
    />
    {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
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
  const [mobileEditOpen, setMobileEditOpen] = useState(false);

  const getCompletion = () => {
    const fields = Object.values(form);
    const filled = fields.filter((value) => value && String(value).trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  useEffect(() => {
    if (!user) return;

    const resolvedProfileImage = user.profileImage
      ? user.profileImage.startsWith("http")
        ? user.profileImage
        : `${BACKEND_ORIGIN}${user.profileImage}`
      : "";
    const versionedProfileImage =
      resolvedProfileImage && user.updatedAt
        ? `${resolvedProfileImage}${resolvedProfileImage.includes("?") ? "&" : "?"}v=${new Date(user.updatedAt).getTime()}`
        : resolvedProfileImage;

    setForm({
      name: user.name || "",
      companyName: user.companyName || "",
      location: user.location || "",
      phone: user.phone || "",
      linkedin: user.linkedin || "",
      portfolio: user.portfolio || "",
      bio: user.bio || ""
    });

    setProfileImagePreview(versionedProfileImage);
  }, [user]);

  const onChange = (event) => {
    setIsDirty(true);
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Only image files are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Maximum image size is 2MB.");
      return;
    }

    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setIsDirty(true);
    setMessage("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview("");
    setIsDirty(true);
  };

  const validate = () => {
    if (!form.name.trim() || !form.companyName.trim()) return "Recruiter name and company name are required.";
    if (form.linkedin && !form.linkedin.startsWith("http")) return "LinkedIn URL must start with http.";
    if (form.portfolio && !form.portfolio.startsWith("http")) return "Website URL must start with http.";
    return null;
  };

  const onSubmit = async () => {
    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (profileImageFile) payload.append("profileImage", profileImageFile);

      await api.patch("/auth/profile", payload);
      await refreshUser();

      setMessage("Profile saved successfully.");
      setIsDirty(false);
      setProfileImageFile(null);
      setMobileEditOpen(false);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save employer profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6 pb-6">
      <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-bold">Employer Profile</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200">
              Keep your recruiter identity, company presence, and contact information polished for job seekers.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">Completion</p>
            <p className="mt-2 text-2xl font-bold text-white">{getCompletion()}%</p>
          </div>
        </div>
      </div>

      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.toLowerCase().includes("success") || message.toLowerCase().includes("saved")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className={`${mobileEditOpen ? "block" : "hidden"} rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:block md:p-6`}>
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Profile progress</h2>
                  <p className="mt-1 text-sm text-slate-500">Complete the core employer details for a stronger company presence.</p>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {isDirty ? "Unsaved changes" : "Up to date"}
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-emerald-600 transition-all" style={{ width: `${getCompletion()}%` }} />
              </div>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`rounded-3xl border-2 border-dashed p-5 text-center transition ${
                dragActive ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              {profileImagePreview ? (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={profileImagePreview}
                    alt="Employer profile"
                    className="block h-24 w-24 rounded-full object-cover object-center ring-4 ring-white shadow-md"
                  />
                  <div className="flex flex-wrap justify-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <UploadCloud size={15} />
                      Change image
                      <input type="file" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
                    </label>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Drag and drop your company image here</p>
                    <p className="mt-1 text-xs text-slate-500">PNG or JPG up to 2MB.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <UploadCloud size={15} />
                    Upload image
                    <input type="file" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
                  </label>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input name="name" value={form.name} onChange={onChange} label="Recruiter Name" placeholder="Enter recruiter name" />
              <Input name="companyName" value={form.companyName} onChange={onChange} label="Company Name" placeholder="Enter company name" />
              <Input name="location" value={form.location} onChange={onChange} label="Location" placeholder="City, area, or office location" />
              <Input name="phone" value={form.phone} onChange={onChange} label="Phone" placeholder="Primary contact number" />
              <Input
                name="linkedin"
                value={form.linkedin}
                onChange={onChange}
                label="LinkedIn"
                placeholder="https://linkedin.com/company/..."
              />
              <Input
                name="portfolio"
                value={form.portfolio}
                onChange={onChange}
                label="Website"
                placeholder="https://yourcompany.com"
              />
              <TextArea
                name="bio"
                value={form.bio}
                onChange={onChange}
                label="Company Bio"
                placeholder="Tell job seekers what your company does, what you hire for, and what kind of culture you offer."
                className="md:col-span-2"
              />
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{isDirty ? "You have unsaved updates" : "Everything looks synced"}</p>
                <p className="mt-1 text-xs text-slate-500">Save after updating details, image, or company summary.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setMobileEditOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:hidden"
                >
                  Back to Preview
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!isDirty || saving}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm md:p-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-4 ring-white shadow-sm">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Company preview" className="block h-full w-full object-cover object-center" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600">
                    {(form.companyName || "C").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-slate-900">{form.companyName || "Company Name"}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <User size={14} />
                  {form.name || "Recruiter"}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} />
                  {form.location || "Location not added"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <Phone size={15} className="mt-0.5 text-slate-400" />
                <span>{form.phone || "No phone number added"}</span>
              </p>
              <p className="flex items-start gap-2">
                <Linkedin size={15} className="mt-0.5 text-slate-400" />
                <span className="break-all">{form.linkedin || "No LinkedIn profile added"}</span>
              </p>
              <p className="flex items-start gap-2">
                <Globe size={15} className="mt-0.5 text-slate-400" />
                <span className="break-all">{form.portfolio || "No website added"}</span>
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Building2 size={16} />
                About Company
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{form.bio || "No company bio added yet."}</p>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Profile strength</span>
                <span>{getCompletion()}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${getCompletion()}%` }} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileEditOpen((prev) => !prev)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 md:hidden"
            >
              {mobileEditOpen ? "Hide Edit Fields" : "Edit Profile"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default EmployerProfile;
