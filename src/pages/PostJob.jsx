import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const PostJob = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    companyName: "",
    location: "",
    jobType: "full-time",
    experienceLevel: "junior",
    salaryMin: "",
    salaryMax: "",
    vacancy: "",
    minAge: "",
    maxAge: "",
    applicationDeadline: "",
    educationRequirements: "",
    additionalRequirements: "",
    responsibilities: "",
    benefits: "",
    workplace: "office",
    businessArea: "",
    encourageVideoCv: false,
    skills: "",
    description: ""
  });
  const [message, setMessage] = useState("");

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/jobs", {
        ...form,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || 0,
        vacancy: Number(form.vacancy) || 1,
        minAge: Number(form.minAge) || 18,
        maxAge: Number(form.maxAge) || 60,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      });
      navigate("/my-jobs");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Post failed.");
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold">Post a Job</h2>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="rounded-md border p-2" name="title" placeholder="Job title" value={form.title} onChange={onChange} required />
        <input className="rounded-md border p-2" name="companyName" placeholder="Company name" value={form.companyName} onChange={onChange} required />
        <input className="rounded-md border p-2" name="location" placeholder="Location" value={form.location} onChange={onChange} required />
        <select className="rounded-md border p-2" name="jobType" value={form.jobType} onChange={onChange}>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
        </select>
        <select className="rounded-md border p-2" name="experienceLevel" value={form.experienceLevel} onChange={onChange}>
          <option value="fresher">Fresher</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
        <input className="rounded-md border p-2" name="salaryMin" type="number" placeholder="Salary min" value={form.salaryMin} onChange={onChange} />
        <input className="rounded-md border p-2" name="salaryMax" type="number" placeholder="Salary max" value={form.salaryMax} onChange={onChange} />
        <input className="rounded-md border p-2" name="vacancy" type="number" placeholder="Vacancy" value={form.vacancy} onChange={onChange} />
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Application Deadline (Last date to apply)</span>
          <input className="rounded-md border p-2" name="applicationDeadline" type="date" value={form.applicationDeadline} onChange={onChange} required />
        </label>
        <input className="rounded-md border p-2" name="minAge" type="number" placeholder="Min age" value={form.minAge} onChange={onChange} />
        <input className="rounded-md border p-2" name="maxAge" type="number" placeholder="Max age" value={form.maxAge} onChange={onChange} />
        <input className="rounded-md border p-2 md:col-span-2" name="educationRequirements" placeholder="Education requirements" value={form.educationRequirements} onChange={onChange} />
        <input className="rounded-md border p-2 md:col-span-2" name="businessArea" placeholder="Business area (optional)" value={form.businessArea} onChange={onChange} />
        <select className="rounded-md border p-2" name="workplace" value={form.workplace} onChange={onChange}>
          <option value="office">Work at office</option>
          <option value="remote">Work from home</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <input className="md:col-span-2 rounded-md border p-2" name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={onChange} />
        <textarea className="md:col-span-2 rounded-md border p-2" rows="4" name="additionalRequirements" placeholder="Additional requirements" value={form.additionalRequirements} onChange={onChange} />
        <textarea className="md:col-span-2 rounded-md border p-2" rows="5" name="responsibilities" placeholder="Responsibilities and context" value={form.responsibilities} onChange={onChange} />
        <textarea className="md:col-span-2 rounded-md border p-2" rows="3" name="benefits" placeholder="Compensation and benefits" value={form.benefits} onChange={onChange} />
        <textarea className="md:col-span-2 rounded-md border p-2" rows="5" name="description" placeholder="Job description" value={form.description} onChange={onChange} required />
        <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="encourageVideoCv"
            checked={form.encourageVideoCv}
            onChange={(e) => setForm((prev) => ({ ...prev, encourageVideoCv: e.target.checked }))}
          />
          Applicants are encouraged to submit Video CV
        </label>
        <button className="w-fit rounded-md bg-emerald-600 px-4 py-2 text-white" type="submit">Publish</button>
      </form>
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
    </section>
  );
};

export default PostJob;
