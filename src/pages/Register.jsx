import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IT_JOBS } from "../data/itJobs";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "seeker",
    companyName: "",
    skills: "",
    jobCategory: "",
    jobRole: "",
    jobSpecialization: ""
  });
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      setForm((prev) => ({
        ...prev,
        role: value,
        companyName: value === "employer" ? prev.companyName : "",
        jobCategory: value === "seeker" ? prev.jobCategory : "",
        jobRole: value === "seeker" ? prev.jobRole : "",
        jobSpecialization: value === "seeker" ? prev.jobSpecialization : ""
      }));
      return;
    }
    if (name === "jobCategory") {
      setForm((prev) => ({ ...prev, jobCategory: value, jobRole: "", jobSpecialization: "" }));
      return;
    }
    if (name === "jobRole") {
      setForm((prev) => ({ ...prev, jobRole: value, jobSpecialization: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectedCategory = IT_JOBS.find((item) => item.category === form.jobCategory);
  const roleOptions = selectedCategory?.roles || [];
  const selectedRole = roleOptions.find((item) => item.role === form.jobRole);
  const specializationOptions = selectedRole?.specializations || [];

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        skills: form.role === "seeker"
          ? [form.jobSpecialization].filter(Boolean)
          : form.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
      };
      await register(payload);
      navigate("/jobs");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold">Create Account</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input className="w-full rounded-md border p-2" name="name" placeholder="Name" onChange={onChange} required />
        <input className="w-full rounded-md border p-2" type="email" name="email" placeholder="Email" onChange={onChange} required />
        <input className="w-full rounded-md border p-2" type="password" name="password" placeholder="Password" onChange={onChange} required />
        <select className="w-full rounded-md border p-2" name="role" onChange={onChange} value={form.role}>
          <option value="seeker">Job Seeker</option>
          <option value="employer">Employer</option>
        </select>
        {form.role === "employer" && (
          <input className="w-full rounded-md border p-2" name="companyName" placeholder="Company Name" onChange={onChange} required />
        )}
        {form.role === "seeker" && (
          <>
            <select className="w-full rounded-md border p-2" name="jobCategory" value={form.jobCategory} onChange={onChange} required>
              <option value="">Select Job Category</option>
              {IT_JOBS.map((item) => (
                <option key={item.category} value={item.category}>{item.category}</option>
              ))}
            </select>
            <select className="w-full rounded-md border p-2" name="jobRole" value={form.jobRole} onChange={onChange} required disabled={!form.jobCategory}>
              <option value="">Select Role</option>
              {roleOptions.map((item) => (
                <option key={item.role} value={item.role}>{item.role}</option>
              ))}
            </select>
            <select className="w-full rounded-md border p-2" name="jobSpecialization" value={form.jobSpecialization} onChange={onChange} required disabled={!form.jobRole}>
              <option value="">Select Specialization</option>
              {specializationOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </>
        )}
        {form.role !== "seeker" ? (
          <input className="w-full rounded-md border p-2" name="skills" placeholder="Skills (comma separated)" onChange={onChange} />
        ) : null}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
