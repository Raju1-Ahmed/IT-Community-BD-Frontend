import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const EmployerCandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCandidate = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/candidate/${id}`);
        setCandidate(data.candidate);
        setMessage("");
      } catch (error) {
        setMessage(error?.response?.data?.message || "Failed to load candidate profile.");
      } finally {
        setLoading(false);
      }
    };
    loadCandidate();
  }, [id]);

  if (loading) return <p>Loading candidate profile...</p>;
  if (!candidate) return <p>{message || "Candidate not found."}</p>;

  const imageUrl = candidate.profileImage
    ? candidate.profileImage.startsWith("http")
      ? candidate.profileImage
      : `${BACKEND_ORIGIN}${candidate.profileImage}`
    : "";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Candidate Profile</h2>
        <Link to="/employer-applications" className="rounded-md border border-slate-300 px-3 py-1 text-sm">
          Back
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
          {imageUrl ? <img src={imageUrl} alt="Candidate" className="h-full w-full object-cover" /> : null}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{candidate.name}</h3>
          <p className="text-sm text-slate-600">{candidate.currentPosition || "Job Seeker"}</p>
        </div>
      </div>

      <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <p><span className="font-medium">Email:</span> {candidate.email || "N/A"}</p>
        <p><span className="font-medium">Phone:</span> {candidate.phone || "N/A"}</p>
        <p><span className="font-medium">Location:</span> {candidate.location || "N/A"}</p>
        <p><span className="font-medium">Experience:</span> {candidate.experienceYears ?? 0} years</p>
        <p><span className="font-medium">Education:</span> {candidate.education || "N/A"}</p>
        <p><span className="font-medium">Expected Salary:</span> {candidate.expectedSalary || 0} BDT</p>
        <p className="md:col-span-2">
          <span className="font-medium">Skills:</span>{" "}
          {(candidate.skills || []).length > 0 ? candidate.skills.join(", ") : "N/A"}
        </p>
        <p className="md:col-span-2">
          <span className="font-medium">Bio:</span> {candidate.bio || "N/A"}
        </p>
        <p><span className="font-medium">GitHub:</span> {candidate.github || "N/A"}</p>
        <p><span className="font-medium">LinkedIn:</span> {candidate.linkedin || "N/A"}</p>
        <p className="md:col-span-2"><span className="font-medium">Portfolio:</span> {candidate.portfolio || "N/A"}</p>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default EmployerCandidateProfile;
