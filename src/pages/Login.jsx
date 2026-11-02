import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Chrome, Github } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, socialSignIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/jobs");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  const onSocialSignIn = async (provider) => {
    setError("");
    try {
      await socialSignIn(provider);
      navigate("/jobs");
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.response?.data?.message || err?.message || "Social sign-in failed");
      }
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold">Login</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input className="w-full rounded-md border p-2" type="email" placeholder="Email" onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <input className="w-full rounded-md border p-2" type="password" placeholder="Password" onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" type="submit">Login</button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        OR
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="flex justify-center gap-3">
        <button className="rounded-full border border-slate-300 p-3 text-slate-700 hover:bg-slate-50" type="button" onClick={() => onSocialSignIn("google")} aria-label="Continue with Google" title="Continue with Google"><Chrome size={19} /></button>
        <button className="rounded-full border border-slate-300 p-3 text-slate-700 hover:bg-slate-50" type="button" onClick={() => onSocialSignIn("github")} aria-label="Continue with GitHub" title="Continue with GitHub"><Github size={19} /></button>
      </div>
      <p className="mt-5 text-center text-sm text-slate-600">
        Don&apos;t have an account? <Link className="font-semibold text-emerald-600 hover:text-emerald-700" to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
