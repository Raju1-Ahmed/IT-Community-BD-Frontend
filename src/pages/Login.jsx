import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold">Login</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input className="w-full rounded-md border p-2" type="email" placeholder="Email" onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <input className="w-full rounded-md border p-2" type="password" placeholder="Password" onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
