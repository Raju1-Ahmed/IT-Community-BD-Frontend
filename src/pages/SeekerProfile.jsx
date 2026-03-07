import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, Trash2, User, Briefcase, GraduationCap, Code, Globe } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const emptyExperience = { company: "", role: "", duration: "", desc: "" };
const emptyProject = { title: "", link: "", description: "" };
const emptyEducation = { institute: "", degree: "", year: "" };
const emptyLanguage = { lang: "", level: "" };
const emptyCertification = { title: "", year: "" };
const emptyVolunteer = { role: "", organization: "", details: "" };
const initialFormData = {
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
  dateOfBirth: ""
};

const SeekerProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);

  const [experience, setExperience] = useState([{ ...emptyExperience }]);
  const [projects, setProjects] = useState([{ ...emptyProject }]);
  const [education, setEducation] = useState([{ ...emptyEducation }]);
  const [languages, setLanguages] = useState([{ ...emptyLanguage }]);
  const [certifications, setCertifications] = useState([{ ...emptyCertification }]);
  const [volunteer, setVolunteer] = useState([{ ...emptyVolunteer }]);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const existingSkills = Array.isArray(user.skills) ? user.skills.join(", ") : "";

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
      frontendSkills: existingSkills,
      backendSkills: "",
      cloudTools: "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : ""
    });

    setExperience(Array.isArray(user.experience) && user.experience.length ? user.experience : [{ ...emptyExperience }]);
    setProjects(Array.isArray(user.projects) && user.projects.length ? user.projects : [{ ...emptyProject }]);
    setEducation(Array.isArray(user.educationEntries) && user.educationEntries.length ? user.educationEntries : [{ ...emptyEducation }]);
    setLanguages(Array.isArray(user.languages) && user.languages.length ? user.languages : [{ ...emptyLanguage }]);
    setCertifications(Array.isArray(user.certifications) && user.certifications.length ? user.certifications : [{ ...emptyCertification }]);
    setVolunteer(Array.isArray(user.volunteer) && user.volunteer.length ? user.volunteer : [{ ...emptyVolunteer }]);

    setProfileImagePreview(
      user.profileImage
        ? user.profileImage.startsWith("http")
          ? user.profileImage
          : `${BACKEND_ORIGIN}${user.profileImage}`
        : ""
    );
  }, [user]);

  const onBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const addField = (state, setState, template) => setState([...state, { ...template }]);

  const removeField = (index, state, setState, template) => {
    if (state.length === 1) {
      setState([{ ...template }]);
      return;
    }
    setState(state.filter((_, idx) => idx !== index));
  };

  const updateArrayField = (index, key, value, state, setState) => {
    setState(state.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)));
  };

  const clearAllInputs = () => {
    setFormData(initialFormData);
    setExperience([{ ...emptyExperience }]);
    setProjects([{ ...emptyProject }]);
    setEducation([{ ...emptyEducation }]);
    setLanguages([{ ...emptyLanguage }]);
    setCertifications([{ ...emptyCertification }]);
    setVolunteer([{ ...emptyVolunteer }]);
    setProfileImageFile(null);
    setProfileImagePreview("");
  };

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

      const skills = [formData.frontendSkills, formData.backendSkills, formData.cloudTools]
        .join(",")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .join(", ");

      payload.append("skills", skills);
      payload.append("experience", JSON.stringify(experience));
      payload.append("projects", JSON.stringify(projects));
      payload.append("educationEntries", JSON.stringify(education));
      payload.append("languages", JSON.stringify(languages));
      payload.append("certifications", JSON.stringify(certifications));
      payload.append("volunteer", JSON.stringify(volunteer));

      if (profileImageFile) {
        payload.append("profileImage", profileImageFile);
      }

      await api.patch("/auth/profile", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await refreshUser();
      clearAllInputs();
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

      <form onSubmit={onSubmit} className="mt-4 space-y-8">
        <div className="rounded-md border p-4">
          <div className="flex items-center gap-4">
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
        </div>

        <div className="grid grid-cols-1 gap-6 rounded-xl bg-slate-50 p-6 md:grid-cols-2">
          <div className="col-span-2 mb-1 flex items-center gap-2 text-blue-600">
            <User size={20} />
            <span className="font-semibold">Personal Information</span>
          </div>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={onBasicChange}
            placeholder="Full Name"
            className="rounded border p-2"
            required
          />
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={onBasicChange}
            placeholder="Job Title (e.g. Full-Stack Developer)"
            className="rounded border p-2"
          />
          <input type="email" value={formData.email} placeholder="Email Address" className="rounded border p-2 bg-slate-100" disabled />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onBasicChange}
            placeholder="Phone Number"
            className="rounded border p-2"
          />
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={onBasicChange}
            className="rounded border p-2"
          />
          <textarea
            name="address"
            value={formData.address}
            onChange={onBasicChange}
            placeholder="Address"
            className="col-span-2 h-20 rounded border p-2"
          />

          <div className="col-span-2 mt-2 flex items-center gap-2 text-blue-600">
            <Globe size={20} />
            <span className="font-semibold">Links & Socials</span>
          </div>

          <input
            type="url"
            name="portfolio"
            value={formData.portfolio}
            onChange={onBasicChange}
            placeholder="Portfolio URL"
            className="rounded border p-2"
          />
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={onBasicChange}
            placeholder="LinkedIn URL"
            className="rounded border p-2"
          />
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={onBasicChange}
            placeholder="GitHub URL"
            className="rounded border p-2"
          />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-700">Professional Summary</h3>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={onBasicChange}
            className="h-32 w-full rounded border p-3"
            placeholder="Write a short summary about your career..."
          />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-700">
              <Briefcase size={20} /> Work Experience
            </h3>
            <button
              type="button"
              onClick={() => addField(experience, setExperience, emptyExperience)}
              className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600"
            >
              <PlusCircle size={16} /> Add Experience
            </button>
          </div>

          {experience.map((exp, index) => (
            <div key={`exp-${index}`} className="relative mb-6 border-l-4 border-blue-200 pl-4">
              {experience.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeField(index, experience, setExperience, emptyExperience)}
                  className="absolute right-0 top-0 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              ) : null}

              <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Company Name"
                  className="rounded border p-2 text-sm"
                  value={exp.company}
                  onChange={(e) => updateArrayField(index, "company", e.target.value, experience, setExperience)}
                />
                <input
                  type="text"
                  placeholder="Role / Designation"
                  className="rounded border p-2 text-sm"
                  value={exp.role}
                  onChange={(e) => updateArrayField(index, "role", e.target.value, experience, setExperience)}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. Jan 2023 - Present)"
                  className="rounded border p-2 text-sm"
                  value={exp.duration}
                  onChange={(e) => updateArrayField(index, "duration", e.target.value, experience, setExperience)}
                />
              </div>
              <textarea
                placeholder="Job Description & Responsibilities"
                className="h-20 w-full rounded border p-2 text-sm"
                value={exp.desc}
                onChange={(e) => updateArrayField(index, "desc", e.target.value, experience, setExperience)}
              />
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-700">
            <Code size={20} /> Skills & Technologies
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="frontendSkills"
              value={formData.frontendSkills}
              onChange={onBasicChange}
              placeholder="Frontend Skills (comma separated)"
              className="w-full rounded border p-2"
            />
            <input
              type="text"
              name="backendSkills"
              value={formData.backendSkills}
              onChange={onBasicChange}
              placeholder="Backend Skills (comma separated)"
              className="w-full rounded border p-2"
            />
            <input
              type="text"
              name="cloudTools"
              value={formData.cloudTools}
              onChange={onBasicChange}
              placeholder="Cloud & Tools (comma separated)"
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Projects</h3>
            <button
              type="button"
              onClick={() => addField(projects, setProjects, emptyProject)}
              className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600"
            >
              <PlusCircle size={16} /> Add Project
            </button>
          </div>

          {projects.map((project, index) => (
            <div key={`project-${index}`} className="relative mb-6 rounded border p-4">
              {projects.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeField(index, projects, setProjects, emptyProject)}
                  className="absolute right-3 top-3 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Project Title"
                  className="rounded border p-2 text-sm"
                  value={project.title}
                  onChange={(e) => updateArrayField(index, "title", e.target.value, projects, setProjects)}
                />
                <input
                  type="url"
                  placeholder="Project Link"
                  className="rounded border p-2 text-sm"
                  value={project.link}
                  onChange={(e) => updateArrayField(index, "link", e.target.value, projects, setProjects)}
                />
              </div>
              <textarea
                placeholder="Project Description"
                className="mt-3 h-20 w-full rounded border p-2 text-sm"
                value={project.description}
                onChange={(e) => updateArrayField(index, "description", e.target.value, projects, setProjects)}
              />
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-700">
              <GraduationCap size={20} /> Education
            </h3>
            <button
              type="button"
              onClick={() => addField(education, setEducation, emptyEducation)}
              className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600"
            >
              <PlusCircle size={16} /> Add Education
            </button>
          </div>

          {education.map((entry, index) => (
            <div key={`edu-${index}`} className="relative mb-6 rounded border p-4">
              {education.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeField(index, education, setEducation, emptyEducation)}
                  className="absolute right-3 top-3 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Institute"
                  className="rounded border p-2 text-sm"
                  value={entry.institute}
                  onChange={(e) => updateArrayField(index, "institute", e.target.value, education, setEducation)}
                />
                <input
                  type="text"
                  placeholder="Degree"
                  className="rounded border p-2 text-sm"
                  value={entry.degree}
                  onChange={(e) => updateArrayField(index, "degree", e.target.value, education, setEducation)}
                />
                <input
                  type="text"
                  placeholder="Year"
                  className="rounded border p-2 text-sm"
                  value={entry.year}
                  onChange={(e) => updateArrayField(index, "year", e.target.value, education, setEducation)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">Languages</h3>
              <button
                type="button"
                onClick={() => addField(languages, setLanguages, emptyLanguage)}
                className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600"
              >
                <PlusCircle size={16} /> Add
              </button>
            </div>

            {languages.map((lang, index) => (
              <div key={`lang-${index}`} className="relative mb-4 rounded border p-3">
                {languages.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeField(index, languages, setLanguages, emptyLanguage)}
                    className="absolute right-2 top-2 text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}

                <input
                  type="text"
                  placeholder="Language"
                  className="mb-2 w-full rounded border p-2 text-sm"
                  value={lang.lang}
                  onChange={(e) => updateArrayField(index, "lang", e.target.value, languages, setLanguages)}
                />
                <input
                  type="text"
                  placeholder="Level"
                  className="w-full rounded border p-2 text-sm"
                  value={lang.level}
                  onChange={(e) => updateArrayField(index, "level", e.target.value, languages, setLanguages)}
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">Certifications</h3>
              <button
                type="button"
                onClick={() => addField(certifications, setCertifications, emptyCertification)}
                className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600"
              >
                <PlusCircle size={16} /> Add
              </button>
            </div>

            {certifications.map((cert, index) => (
              <div key={`cert-${index}`} className="relative mb-4 rounded border p-3">
                {certifications.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeField(index, certifications, setCertifications, emptyCertification)}
                    className="absolute right-2 top-2 text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}

                <input
                  type="text"
                  placeholder="Certification Title"
                  className="mb-2 w-full rounded border p-2 text-sm"
                  value={cert.title}
                  onChange={(e) => updateArrayField(index, "title", e.target.value, certifications, setCertifications)}
                />
                <input
                  type="text"
                  placeholder="Year"
                  className="w-full rounded border p-2 text-sm"
                  value={cert.year}
                  onChange={(e) => updateArrayField(index, "year", e.target.value, certifications, setCertifications)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Volunteer Experience</h3>
            <button
              type="button"
              onClick={() => addField(volunteer, setVolunteer, emptyVolunteer)}
              className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600"
            >
              <PlusCircle size={16} /> Add Volunteer
            </button>
          </div>

          {volunteer.map((item, index) => (
            <div key={`vol-${index}`} className="relative mb-6 rounded border p-4">
              {volunteer.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeField(index, volunteer, setVolunteer, emptyVolunteer)}
                  className="absolute right-3 top-3 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Role"
                  className="rounded border p-2 text-sm"
                  value={item.role}
                  onChange={(e) => updateArrayField(index, "role", e.target.value, volunteer, setVolunteer)}
                />
                <input
                  type="text"
                  placeholder="Organization"
                  className="rounded border p-2 text-sm"
                  value={item.organization}
                  onChange={(e) => updateArrayField(index, "organization", e.target.value, volunteer, setVolunteer)}
                />
              </div>
              <textarea
                placeholder="Details"
                className="mt-3 h-20 w-full rounded border p-2 text-sm"
                value={item.details}
                onChange={(e) => updateArrayField(index, "details", e.target.value, volunteer, setVolunteer)}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg transition duration-300 hover:bg-blue-700 disabled:opacity-70"
        >
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
