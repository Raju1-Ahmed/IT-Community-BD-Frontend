import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, CircleDollarSign, PlusCircle, ShieldCheck } from "lucide-react";
import api from "../api/client";

const parseSkills = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const sectionMeta = [
  {
    icon: BriefcaseBusiness,
    title: "Job Summary",
    description: "Role, company, location, and core hiring details."
  },
  {
    icon: ShieldCheck,
    title: "Requirements & Context",
    description: "Skills, expectations, and what applicants should know."
  },
  {
    icon: CircleDollarSign,
    title: "Compensation & Apply Settings",
    description: "Salary, benefits, and application timing."
  }
];

const Field = ({ label, hint, children, className = "" }) => (
  <label className={`flex flex-col gap-2 ${className}`}>
    <span className="text-sm font-medium text-slate-800">{label}</span>
    {children}
    {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
  </label>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${className}`}
    {...props}
  />
);

const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${className}`}
    {...props}
  >
    {children}
  </select>
);

const TextArea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${className}`}
    {...props}
  />
);

const SectionCard = ({ icon: Icon, title, description, children }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-start gap-4">
      <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">{children}</div>
  </div>
);

const PostJobSchemaForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    vacancy: 1,
    minAge: 18,
    maxAge: 60,
    applicationDeadline: "",
    educationRequirements: "",
    additionalRequirements: "",
    responsibilities: "",
    benefits: "",
    workplace: "office",
    genderPreference: "any",
    businessArea: "",
    skills: "",
    description: ""
  });

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
    setLoading(true);
    setMessage("");
    try {
      const { data } = await api.post("/jobs", {
        ...form,
        salaryMin: form.salaryNegotiable ? 0 : Number(form.salaryMin) || 0,
        salaryMax: form.salaryNegotiable ? 0 : Number(form.salaryMax) || 0,
        vacancy: Number(form.vacancy) || 1,
        minAge: Number(form.minAge) || 18,
        maxAge: Number(form.maxAge) || 60,
        skills: parseSkills(form.skills)
      });
      navigate(`/my-jobs/${data?.job?._id}`);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Post failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-8 text-white shadow-lg">
        <h2 className="mt-2 text-3xl font-bold">Post a Job</h2>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {sectionMeta.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-3 inline-flex rounded-xl bg-white/15 p-2 text-emerald-100">
                <Icon size={18} />
              </div>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-xs text-slate-200">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <SectionCard
          icon={BriefcaseBusiness}
          title="Job Summary"
        >
          <Field label="Job Title" hint="Example: Frontend Developer">
            <Input name="title" value={form.title} onChange={onChange} placeholder="Job title" required />
          </Field>

          <Field label="Company Name" hint="Recruiting company or organization name">
            <Input name="companyName" value={form.companyName} onChange={onChange} placeholder="Company name" required />
          </Field>

          <Field label="Location" hint="Example: Dhaka, Bangladesh">
            <Input name="location" value={form.location} onChange={onChange} placeholder="Job location" required />
          </Field>

          <Field label="Business Area" hint="Example: Software Company">
            <Input name="businessArea" value={form.businessArea} onChange={onChange} placeholder="Business area" />
          </Field>

          <Field label="Job Type">
            <Select name="jobType" value={form.jobType} onChange={onChange}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </Select>
          </Field>

          <Field label="Experience Level">
            <Select name="experienceLevel" value={form.experienceLevel} onChange={onChange}>
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </Select>
          </Field>

          <Field label="Workplace">
            <Select name="workplace" value={form.workplace} onChange={onChange}>
              <option value="office">Work at office</option>
              <option value="remote">Work from home</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </Field>

          <Field label="Preferred Gender">
            <Select name="genderPreference" value={form.genderPreference} onChange={onChange}>
              <option value="any">Male/Female Anyone</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </Field>

          <Field label="Skills" hint="Use comma to separate skills">
            <Input
              name="skills"
              value={form.skills}
              onChange={onChange}
              placeholder="React, JavaScript, REST API, Git"
            />
          </Field>

        </SectionCard>

        <SectionCard
          icon={ShieldCheck}
          title="Requirements & Context"
        >
          <Field
            label="Education Requirements"
            className="md:col-span-2"
            hint="Example: Bachelor in CSE, Diploma in Computer, or equivalent experience"
          >
            <TextArea
              rows="3"
              name="educationRequirements"
              value={form.educationRequirements}
              onChange={onChange}
              placeholder="Education requirements"
            />
          </Field>

          <Field
            label="Additional Requirements"
            className="md:col-span-2"
            hint="Use this for age preference, communication skills, tools, or other expectations"
          >
            <TextArea
              rows="4"
              name="additionalRequirements"
              value={form.additionalRequirements}
              onChange={onChange}
              placeholder="Additional requirements"
            />
          </Field>

          <Field
            label="Responsibilities & Context"
            className="md:col-span-2"
            hint="Use semicolon (;) to separate each responsibility"
          >
            <TextArea
              rows="6"
              name="responsibilities"
              value={form.responsibilities}
              onChange={onChange}
              placeholder="Build UI components; Integrate APIs; Fix bugs; Support releases"
            />
          </Field>

          <Field
            label="Read Before Apply"
            className="md:col-span-2"
            hint="Important notes, instructions, warnings, or anything applicants should read before applying"
          >
            <TextArea
              rows="6"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Important notes for applicants"
              required
            />
          </Field>
        </SectionCard>

        <SectionCard
          icon={CircleDollarSign}
          title="Compensation & Apply Settings"
        >
          <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <label className="inline-flex items-center gap-3 text-sm font-medium text-emerald-900">
              <input
                type="checkbox"
                name="salaryNegotiable"
                checked={form.salaryNegotiable}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Salary is negotiable
            </label>
          </div>

          <Field label="Salary Min">
            <Input
              type="number"
              name="salaryMin"
              value={form.salaryMin}
              onChange={onChange}
              placeholder={form.salaryNegotiable ? "Negotiable salary" : "Minimum salary"}
              disabled={form.salaryNegotiable}
            />
          </Field>

          <Field label="Salary Max">
            <Input
              type="number"
              name="salaryMax"
              value={form.salaryMax}
              onChange={onChange}
              placeholder={form.salaryNegotiable ? "Negotiable salary" : "Maximum salary"}
              disabled={form.salaryNegotiable}
            />
          </Field>

          <Field label="Vacancy">
            <Input type="number" name="vacancy" value={form.vacancy} onChange={onChange} placeholder="Vacancy" />
          </Field>

          <Field label="Application Deadline">
            <Input type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={onChange} required />
          </Field>

          <Field label="Minimum Age">
            <Input type="number" name="minAge" value={form.minAge} onChange={onChange} placeholder="Minimum age" />
          </Field>

          <Field label="Maximum Age">
            <Input type="number" name="maxAge" value={form.maxAge} onChange={onChange} placeholder="Maximum age" />
          </Field>

          <Field
            label="Compensation & Other Benefits"
            className="md:col-span-2"
            hint="Use this field for bonus, leave, allowance, accommodation, or other benefits"
          >
            <TextArea
              rows="5"
              name="benefits"
              value={form.benefits}
              onChange={onChange}
              placeholder="Performance bonus, Mobile bill, Weekly 2 holidays"
            />
          </Field>

        </SectionCard>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <PlusCircle size={18} />
            {loading ? "Publishing..." : "Publish Job"}
          </button>
        </div>

        {message ? <p className="text-sm text-rose-600">{message}</p> : null}
      </form>
    </section>
  );
};

export default PostJobSchemaForm;
