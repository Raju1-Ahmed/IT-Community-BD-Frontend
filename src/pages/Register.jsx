import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IT_JOBS } from "../data/itJobs";
import { Github } from "lucide-react";
import GoogleIcon from "../components/GoogleIcon";

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyRegistration, resendRegistrationOtp, socialSignIn } = useAuth();
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
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const onSocialSignIn = async (provider) => {
    setError("");
    try {
      await socialSignIn(provider, form.role);
      navigate("/jobs");
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.response?.data?.message || err?.message || "Social sign-in failed");
      }
    }
  };

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
      if (verificationEmail) {
        setIsVerifying(true);
        await verifyRegistration({ email: verificationEmail, otp });
        navigate("/jobs");
        return;
      }
      const payload = {
        ...form,
        skills: form.role === "seeker"
          ? [form.jobSpecialization].filter(Boolean)
          : form.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
      };
      const data = await register(payload);
      setVerificationEmail(data.email || form.email.trim().toLowerCase());
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async () => {
    setError("");
    setIsResending(true);
    try {
      await resendRegistrationOtp(verificationEmail);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not resend verification code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold">Create Account</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        {verificationEmail ? (
          <>
            <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
              We sent a 6-digit verification code to <strong>{verificationEmail}</strong>.
            </p>
            <input className="w-full rounded-md border p-2 tracking-[0.4em]" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter OTP" required />
            <button className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60" type="submit" disabled={isVerifying || otp.length !== 6}>
              {isVerifying ? "Verifying..." : "Verify email & create account"}
            </button>
            <button className="w-full text-sm font-semibold text-emerald-700 disabled:opacity-60" type="button" onClick={onResend} disabled={isResending}>
              {isResending ? "Sending..." : "Resend code"}
            </button>
          </>
        ) : null}
        {!verificationEmail ? <>
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
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" type="submit">Continue</button>
        </> : null}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      {!verificationEmail ? <>
      <div className="my-4 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />OR<span className="h-px flex-1 bg-slate-200" /></div>
      <div className="flex justify-center gap-3">
        <button className="rounded-full border border-slate-300 p-3 text-slate-700 hover:bg-slate-50" type="button" onClick={() => onSocialSignIn("google")} aria-label="Continue with Google" title="Continue with Google"><GoogleIcon /></button>
        <button className="rounded-full border border-slate-300 p-3 text-slate-700 hover:bg-slate-50" type="button" onClick={() => onSocialSignIn("github")} aria-label="Continue with GitHub" title="Continue with GitHub"><Github size={19} /></button>
      </div>
      </> : null}
      <p className="mt-5 text-center text-sm text-slate-600">
        Already have an account? <Link className="font-semibold text-emerald-600 hover:text-emerald-700" to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
