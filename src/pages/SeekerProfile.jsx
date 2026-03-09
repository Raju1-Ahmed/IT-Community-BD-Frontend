import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, Trash2, User, Briefcase, GraduationCap, Code, Globe, Layers } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  SOFTWARE_CATEGORY,
  buildCategoryProfileState,
  getCategoryProfileSections,
  isSoftwareCategory,
  sanitizeCategoryProfile
} from "../data/categoryProfileConfig";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const EMPTY = {
  experience: { company: "", role: "", duration: "", desc: "" },
  projects: { title: "", link: "", description: "" },
  educationEntries: { institute: "", degree: "", year: "" },
  languages: { lang: "", level: "" },
  certifications: { title: "", year: "" },
  volunteer: { role: "", organization: "", details: "" }
};

const INITIAL_BLOCKS = {
  experience: [{ ...EMPTY.experience }],
  projects: [{ ...EMPTY.projects }],
  educationEntries: [{ ...EMPTY.educationEntries }],
  languages: [{ ...EMPTY.languages }],
  certifications: [{ ...EMPTY.certifications }],
  volunteer: [{ ...EMPTY.volunteer }]
};

const INITIAL_FORM = {
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  address: "",
  summary: "",
  portfolio: "",
  linkedin: "",
  github: "",
  frontendSkills: "",
  backendSkills: "",
  cloudTools: "",
  generalSkills: "",
  dateOfBirth: ""
};

const splitSkills = (raw = "") =>
  raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const ArraySection = ({ title, icon: Icon, fields, items, onAdd, onRemove, onChange }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 font-semibold text-slate-700">
        {Icon ? <Icon size={18} /> : null}
        {title}
      </h3>
      <button type="button" onClick={onAdd} className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">
        <PlusCircle size={16} /> Add
      </button>
    </div>

    {items.map((row, rowIndex) => (
      <div key={`${title}-${rowIndex}`} className="relative mb-4 rounded border p-4">
        {items.length > 1 ? (
          <button
            type="button"
            onClick={() => onRemove(rowIndex)}
            className="absolute right-3 top-3 text-red-400 hover:text-red-600"
            aria-label="Remove row"
          >
            <Trash2 size={16} />
          </button>
        ) : null}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {fields.map((field) =>
            field.type === "textarea" ? (
              <textarea
                key={field.key}
                className="h-20 rounded border p-2 text-sm md:col-span-2"
                placeholder={field.placeholder}
                value={row[field.key] || ""}
                onChange={(e) => onChange(rowIndex, field.key, e.target.value)}
              />
            ) : (
              <input
                key={field.key}
                type={field.type || "text"}
                className="rounded border p-2 text-sm"
                placeholder={field.placeholder}
                value={row[field.key] || ""}
                onChange={(e) => onChange(rowIndex, field.key, e.target.value)}
              />
            )
          )}
        </div>
      </div>
    ))}
  </div>
);

const SeekerProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const currentCategory = user?.jobCategory || "";
  const softwareMode = isSoftwareCategory(currentCategory);
  const categorySections = useMemo(() => getCategoryProfileSections(currentCategory), [currentCategory]);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [categoryProfile, setCategoryProfile] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    const skillsText = Array.isArray(user.skills) ? user.skills.join(", ") : "";
    setFormData({
      fullName: user.name || "",
      jobTitle: user.currentPosition || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.location || "",
      summary: user.bio || "",
      portfolio: user.portfolio || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
      frontendSkills: softwareMode ? skillsText : "",
      backendSkills: "",
      cloudTools: "",
      generalSkills: softwareMode ? "" : skillsText,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : ""
    });
    setBlocks({
      experience: Array.isArray(user.experience) && user.experience.length ? user.experience : [{ ...EMPTY.experience }],
      projects: Array.isArray(user.projects) && user.projects.length ? user.projects : [{ ...EMPTY.projects }],
      educationEntries:
        Array.isArray(user.educationEntries) && user.educationEntries.length ? user.educationEntries : [{ ...EMPTY.educationEntries }],
      languages: Array.isArray(user.languages) && user.languages.length ? user.languages : [{ ...EMPTY.languages }],
      certifications: Array.isArray(user.certifications) && user.certifications.length ? user.certifications : [{ ...EMPTY.certifications }],
      volunteer: Array.isArray(user.volunteer) && user.volunteer.length ? user.volunteer : [{ ...EMPTY.volunteer }]
    });
    setCategoryProfile(buildCategoryProfileState(currentCategory, user.categoryProfile || {}));
    setProfileImagePreview(
      user.profileImage ? (user.profileImage.startsWith("http") ? user.profileImage : `${BACKEND_ORIGIN}${user.profileImage}`) : ""
    );
  }, [user, currentCategory, softwareMode]);

  const updateBasic = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const updateBlockRow = (key, rowIndex, field, value) =>
    setBlocks((prev) => ({
      ...prev,
      [key]: prev[key].map((row, idx) => (idx === rowIndex ? { ...row, [field]: value } : row))
    }));
  const addBlockRow = (key) => setBlocks((prev) => ({ ...prev, [key]: [...prev[key], { ...EMPTY[key] }] }));
  const removeBlockRow = (key, rowIndex) =>
    setBlocks((prev) => ({
      ...prev,
      [key]: prev[key].length <= 1 ? [{ ...EMPTY[key] }] : prev[key].filter((_, idx) => idx !== rowIndex)
    }));

  const updateCategoryRow = (sectionKey, rowIndex, field, value) =>
    setCategoryProfile((prev) => ({
      ...prev,
      [sectionKey]: (prev[sectionKey] || []).map((row, idx) => (idx === rowIndex ? { ...row, [field]: value } : row))
    }));
  const addCategoryRow = (sectionKey, template) =>
    setCategoryProfile((prev) => ({ ...prev, [sectionKey]: [...(prev[sectionKey] || []), { ...template }] }));
  const removeCategoryRow = (sectionKey, rowIndex, template) =>
    setCategoryProfile((prev) => ({
      ...prev,
      [sectionKey]:
        (prev[sectionKey] || []).length <= 1 ? [{ ...template }] : (prev[sectionKey] || []).filter((_, idx) => idx !== rowIndex)
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = new FormData();
      payload.append("name", formData.fullName);
      payload.append("currentPosition", formData.jobTitle);
      payload.append("phone", formData.phone);
      payload.append("location", formData.address);
      payload.append("bio", formData.summary);
      payload.append("portfolio", formData.portfolio);
      payload.append("linkedin", formData.linkedin);
      payload.append("github", formData.github);
      payload.append("dateOfBirth", formData.dateOfBirth || "");

      const softwareSkills = [formData.frontendSkills, formData.backendSkills, formData.cloudTools].flatMap((item) => splitSkills(item));
      const commonSkills = splitSkills(formData.generalSkills);
      const skills = Array.from(new Set((softwareMode ? softwareSkills : commonSkills).filter(Boolean)));
      payload.append("skills", skills.join(", "));

      payload.append("experience", JSON.stringify(blocks.experience));
      payload.append("educationEntries", JSON.stringify(blocks.educationEntries));
      payload.append("languages", JSON.stringify(blocks.languages));
      payload.append("certifications", JSON.stringify(blocks.certifications));
      payload.append("volunteer", JSON.stringify(blocks.volunteer));
      payload.append("projects", JSON.stringify(softwareMode ? blocks.projects : []));
      payload.append(
        "categoryProfile",
        JSON.stringify(softwareMode ? {} : sanitizeCategoryProfile(currentCategory, categoryProfile))
      );
      if (profileImageFile) payload.append("profileImage", profileImageFile);

      await api.patch("/auth/profile", payload, { headers: { "Content-Type": "multipart/form-data" } });
      await refreshUser();
      navigate("/seeker-resume");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold text-slate-900">Seeker Profile</h2>
      <p className="mt-1 text-sm text-slate-600">Build your resume details and keep your profile updated.</p>
      <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        Form mode: <span className="font-semibold">{softwareMode ? SOFTWARE_CATEGORY : currentCategory || "General Profile"}</span>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-6">
        <div className="rounded-md border p-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
              {profileImagePreview ? <img src={profileImagePreview} alt="Profile preview" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setProfileImageFile(file);
                  if (file) {
                    setProfileImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-6 md:grid-cols-2">
          <div className="col-span-2 flex items-center gap-2 text-blue-600">
            <User size={18} />
            <span className="font-semibold">Personal Information</span>
          </div>
          <input name="fullName" value={formData.fullName} onChange={updateBasic} placeholder="Full Name" className="rounded border p-2" required />
          <input name="jobTitle" value={formData.jobTitle} onChange={updateBasic} placeholder="Job Title" className="rounded border p-2" />
          <input value={formData.email} disabled className="rounded border bg-slate-100 p-2" />
          <input name="phone" value={formData.phone} onChange={updateBasic} placeholder="Phone Number" className="rounded border p-2" />
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={updateBasic} className="rounded border p-2" />
          <textarea name="address" value={formData.address} onChange={updateBasic} placeholder="Address" className="col-span-2 h-20 rounded border p-2" />
          <div className="col-span-2 mt-2 flex items-center gap-2 text-blue-600">
            <Globe size={18} />
            <span className="font-semibold">Links</span>
          </div>
          <input type="url" name="portfolio" value={formData.portfolio} onChange={updateBasic} placeholder="Portfolio URL" className="rounded border p-2" />
          <input type="url" name="linkedin" value={formData.linkedin} onChange={updateBasic} placeholder="LinkedIn URL" className="rounded border p-2" />
          <input type="url" name="github" value={formData.github} onChange={updateBasic} placeholder="GitHub URL" className="rounded border p-2" />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-semibold text-slate-700">Professional Summary</h3>
          <textarea name="summary" value={formData.summary} onChange={updateBasic} className="h-28 w-full rounded border p-2" />
        </div>

        <ArraySection
          title="Work Experience"
          icon={Briefcase}
          items={blocks.experience}
          onAdd={() => addBlockRow("experience")}
          onRemove={(idx) => removeBlockRow("experience", idx)}
          onChange={(idx, key, value) => updateBlockRow("experience", idx, key, value)}
          fields={[
            { key: "company", placeholder: "Company Name" },
            { key: "role", placeholder: "Role / Designation" },
            { key: "duration", placeholder: "Duration" },
            { key: "desc", placeholder: "Job Description", type: "textarea" }
          ]}
        />

        {softwareMode ? (
          <>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-700">
                <Code size={18} /> Skills & Technologies
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <input name="frontendSkills" value={formData.frontendSkills} onChange={updateBasic} placeholder="Frontend skills" className="rounded border p-2" />
                <input name="backendSkills" value={formData.backendSkills} onChange={updateBasic} placeholder="Backend skills" className="rounded border p-2" />
                <input name="cloudTools" value={formData.cloudTools} onChange={updateBasic} placeholder="Cloud & tools" className="rounded border p-2" />
              </div>
            </div>
            <ArraySection
              title="Projects"
              icon={Code}
              items={blocks.projects}
              onAdd={() => addBlockRow("projects")}
              onRemove={(idx) => removeBlockRow("projects", idx)}
              onChange={(idx, key, value) => updateBlockRow("projects", idx, key, value)}
              fields={[
                { key: "title", placeholder: "Project Title" },
                { key: "link", placeholder: "Project Link", type: "url" },
                { key: "description", placeholder: "Project Description", type: "textarea" }
              ]}
            />
          </>
        ) : (
          <>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <Code size={18} /> Core Skills
              </h3>
              <input name="generalSkills" value={formData.generalSkills} onChange={updateBasic} placeholder="Skills (comma separated)" className="w-full rounded border p-2" />
            </div>

            {categorySections.map((section) => {
              const items = Array.isArray(categoryProfile[section.key]) && categoryProfile[section.key].length ? categoryProfile[section.key] : [{ ...section.template }];
              return (
                <ArraySection
                  key={section.key}
                  title={section.label}
                  icon={Layers}
                  items={items}
                  onAdd={() => addCategoryRow(section.key, section.template)}
                  onRemove={(idx) => removeCategoryRow(section.key, idx, section.template)}
                  onChange={(idx, key, value) => updateCategoryRow(section.key, idx, key, value)}
                  fields={section.fields.map((field) => ({ key: field.key, placeholder: field.placeholder, type: field.type }))}
                />
              );
            })}
          </>
        )}

        <ArraySection
          title="Education"
          icon={GraduationCap}
          items={blocks.educationEntries}
          onAdd={() => addBlockRow("educationEntries")}
          onRemove={(idx) => removeBlockRow("educationEntries", idx)}
          onChange={(idx, key, value) => updateBlockRow("educationEntries", idx, key, value)}
          fields={[
            { key: "institute", placeholder: "Institute" },
            { key: "degree", placeholder: "Degree" },
            { key: "year", placeholder: "Year" }
          ]}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ArraySection
            title="Languages"
            items={blocks.languages}
            onAdd={() => addBlockRow("languages")}
            onRemove={(idx) => removeBlockRow("languages", idx)}
            onChange={(idx, key, value) => updateBlockRow("languages", idx, key, value)}
            fields={[
              { key: "lang", placeholder: "Language" },
              { key: "level", placeholder: "Level" }
            ]}
          />
          <ArraySection
            title="Certifications"
            items={blocks.certifications}
            onAdd={() => addBlockRow("certifications")}
            onRemove={(idx) => removeBlockRow("certifications", idx)}
            onChange={(idx, key, value) => updateBlockRow("certifications", idx, key, value)}
            fields={[
              { key: "title", placeholder: "Certification Title" },
              { key: "year", placeholder: "Year" }
            ]}
          />
        </div>

        <ArraySection
          title="Volunteer Experience"
          items={blocks.volunteer}
          onAdd={() => addBlockRow("volunteer")}
          onRemove={(idx) => removeBlockRow("volunteer", idx)}
          onChange={(idx, key, value) => updateBlockRow("volunteer", idx, key, value)}
          fields={[
            { key: "role", placeholder: "Role" },
            { key: "organization", placeholder: "Organization" },
            { key: "details", placeholder: "Details", type: "textarea" }
          ]}
        />

        <button type="submit" disabled={saving} className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 disabled:opacity-70">
          {saving ? "Saving..." : "Generate Full Resume"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
      <div className="mt-3">
        <Link to="/seeker-resume" className="text-sm font-medium text-emerald-700">
          View Resume Design
        </Link>
      </div>
    </section>
  );
};

export default SeekerProfile;
