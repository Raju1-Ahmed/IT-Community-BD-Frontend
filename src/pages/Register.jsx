import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "seeker",
    companyName: "",
    location: "",
    skills: ""
  });
  const [error, setError] = useState("");

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register({
        ...form,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      });
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
        <input className="w-full rounded-md border p-2" name="location" placeholder="Location" onChange={onChange} />
        <input className="w-full rounded-md border p-2" name="skills" placeholder="Skills (comma separated)" onChange={onChange} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
