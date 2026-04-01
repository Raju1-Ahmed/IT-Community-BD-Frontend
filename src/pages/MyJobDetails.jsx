import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";

const normalizeCommaSeparatedText = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");

const MyJobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    companyName: "",
    location: "",
    jobType: "full-time",
    experienceLevel: "junior",
    salaryNegotiable: false,
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
    skills: "",
    description: "",
    status: "active"
  });

  const loadJob = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/jobs/${id}`);
      const foundJob = data.job;
      setJob(foundJob);
      setForm({
        title: foundJob.title || "",
        companyName: foundJob.companyName || "",
        location: foundJob.location || "",
        jobType: foundJob.jobType || "full-time",
        experienceLevel: foundJob.experienceLevel || "junior",
        salaryNegotiable: !foundJob.salaryMin && !foundJob.salaryMax,
        salaryMin: foundJob.salaryMin ?? "",
        salaryMax: foundJob.salaryMax ?? "",
        vacancy: foundJob.vacancy ?? "",
        minAge: foundJob.minAge ?? "",
        maxAge: foundJob.maxAge ?? "",
        applicationDeadline: foundJob.applicationDeadline
          ? new Date(foundJob.applicationDeadline).toISOString().slice(0, 10)
          : "",
        educationRequirements: foundJob.educationRequirements || "",
        additionalRequirements: foundJob.additionalRequirements || "",
        responsibilities: foundJob.responsibilities || "",
        benefits: foundJob.benefits || "",
        workplace: foundJob.workplace || "office",
        businessArea: foundJob.businessArea || "",
        skills: Array.isArray(foundJob.skills) ? foundJob.skills.join(", ") : "",
        description: foundJob.description || "",
        status: foundJob.status || "active"
      });
      setMessage("");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      if (name === "salaryNegotiable") {
        return {
          ...prev,
          salaryNegotiable: checked,
          salaryMin: checked ? "" : prev.salaryMin,
          salaryMax: checked ? "" : prev.salaryMax
        };
      }
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const { data } = await api.put(`/jobs/${id}`, {
        ...form,
        salaryMin: form.salaryNegotiable ? 0 : Number(form.salaryMin) || 0,
        salaryMax: form.salaryNegotiable ? 0 : Number(form.salaryMax) || 0,
        vacancy: Number(form.vacancy) || 1,
        minAge: Number(form.minAge) || 18,
        maxAge: Number(form.maxAge) || 60,
        skills: form.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });
      setJob(data.job);
      setMessage("Job updated successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading job details...</p>;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">My Job Details</h2>
        <Link to="/my-jobs" className="rounded-md border border-slate-300 px-3 py-1 text-sm">
          Back to My Jobs
        </Link>
      </div>

      {job ? (
        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          Posted on: {new Date(job.createdAt).toLocaleString()}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
        <input className="rounded-md border p-2" name="title" value={form.title} onChange={onChange} placeholder="Job title" required />
        <input className="rounded-md border p-2" name="companyName" value={form.companyName} onChange={onChange} placeholder="Company name" required />
        <input className="rounded-md border p-2" name="location" value={form.location} onChange={onChange} placeholder="Location" required />
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
        <select className="rounded-md border p-2" name="status" value={form.status} onChange={onChange}>
          <option value="active">active</option>
          <option value="closed">closed</option>
        </select>
        <label className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="flex items-center gap-2">
            <input type="checkbox" name="salaryNegotiable" checked={form.salaryNegotiable} onChange={onChange} />
            Negotiable
          </span>
        </label>
        <input
          className="rounded-md border p-2"
          type="number"
          name="salaryMin"
          value={form.salaryMin}
          onChange={onChange}
          placeholder={form.salaryNegotiable ? "Negotiable salary" : "Salary min"}
          disabled={form.salaryNegotiable}
        />
        <input
          className="rounded-md border p-2"
          type="number"
          name="salaryMax"
          value={form.salaryMax}
          onChange={onChange}
          placeholder={form.salaryNegotiable ? "Negotiable salary" : "Salary max"}
          disabled={form.salaryNegotiable}
        />
        <input className="rounded-md border p-2" type="number" name="vacancy" value={form.vacancy} onChange={onChange} placeholder="Vacancy" />
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Application Deadline (Last date to apply)</span>
          <input className="rounded-md border p-2" type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={onChange} required />
        </label>
        <input className="rounded-md border p-2" type="number" name="minAge" value={form.minAge} onChange={onChange} placeholder="Min age" />
        <input className="rounded-md border p-2" type="number" name="maxAge" value={form.maxAge} onChange={onChange} placeholder="Max age" />
        <input className="rounded-md border p-2 md:col-span-2" name="educationRequirements" value={form.educationRequirements} onChange={onChange} placeholder="Education requirements" />
        <input className="rounded-md border p-2 md:col-span-2" name="businessArea" value={form.businessArea} onChange={onChange} placeholder="Business area" />
        <select className="rounded-md border p-2" name="workplace" value={form.workplace} onChange={onChange}>
          <option value="office">Work at office</option>
          <option value="remote">Work from home</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <input className="rounded-md border p-2 md:col-span-2" name="skills" value={form.skills} onChange={onChange} placeholder="Skills (comma separated)" />
        <label className="md:col-span-2 flex flex-col gap-1">
          <span className="text-xs text-slate-600">Additional Requirements</span>
          <textarea
            className="rounded-md border p-2"
            rows="4"
            name="additionalRequirements"
            value={form.additionalRequirements}
            onChange={onChange}
            placeholder="Example: 1-2 years experience in React, Good communication skills"
          />
        </label>
        <label className="md:col-span-2 flex flex-col gap-1">
          <span className="text-xs text-slate-600">Responsibilities & Context</span>
          <span className="text-xs text-slate-500">Use commas to separate each point.</span>
          <textarea
            className="rounded-md border p-2"
            rows="5"
            name="responsibilities"
            value={form.responsibilities}
            onChange={onChange}
            onBlur={(e) =>
              setForm((prev) => ({
                ...prev,
                responsibilities: normalizeCommaSeparatedText(e.target.value)
              }))
            }
            placeholder="Example: Build UI components, Integrate REST APIs, Fix bugs, Support feature delivery"
          />
        </label>
        <label className="md:col-span-2 flex flex-col gap-1">
          <span className="text-xs text-slate-600">Compensation & Other Benefits</span>
          <span className="text-xs text-slate-500">Use commas to separate benefits.</span>
          <textarea
            className="rounded-md border p-2"
            rows="3"
            name="benefits"
            value={form.benefits}
            onChange={onChange}
            onBlur={(e) =>
              setForm((prev) => ({
                ...prev,
                benefits: normalizeCommaSeparatedText(e.target.value)
              }))
            }
            placeholder="Example: Mobile bill, Weekly 2 holidays, Performance bonus, Lunch facility"
          />
        </label>
        <label className="md:col-span-2 flex flex-col gap-1">
          <span className="text-xs text-slate-600">Read Before Apply</span>
          <textarea
            className="rounded-md border p-2"
            rows="6"
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Important notes, instructions, warnings, or anything applicants should read before applying"
            required
          />
        </label>

        <button type="submit" disabled={saving} className="w-fit rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-70">
          {saving ? "Saving..." : "Update Job"}
        </button>
      </form>

      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default MyJobDetails;
