import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import api from "../api/client";

const normalizeList = (value) =>
  value.split(",").map((i) => i.trim()).filter(Boolean);

const Hint = ({ text }) => (
  <p className="text-xs text-gray-500">{text}</p>
);

const Input = (props) => (
  <input className="rounded-md border p-2 w-full" {...props} />
);

const TextArea = (props) => (
  <textarea className="rounded-md border p-2 w-full" {...props} />
);

const PostJob = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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

  const onSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/jobs", {
        ...form,
        salaryMin: form.salaryNegotiable ? 0 : Number(form.salaryMin) || 0,
        salaryMax: form.salaryNegotiable ? 0 : Number(form.salaryMax) || 0,
        skills: normalizeList(form.skills),
        responsibilities: normalizeList(form.responsibilities),
        benefits: normalizeList(form.benefits)
      });
      navigate("/my-jobs");
    } catch (err) {
      setMessage("Post failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl border">
      <h2 className="text-2xl font-bold mb-4">Post a Job</h2>

      {/* STEP INDICATOR */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded ${
              step >= s ? "bg-emerald-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-3">
          <Input name="title" placeholder="Job Title" onChange={onChange} />
          <Hint text="Example: Frontend Developer (React)" />

          <Input name="companyName" placeholder="Company Name" onChange={onChange} />
          <Hint text="Your company or organization name" />

          <Input name="location" placeholder="Job Location" onChange={onChange} />
          <Hint text="City, Country or Remote" />

          <Input name="skills" placeholder="Skills" onChange={onChange} />
          <Hint text="Use comma: React, Node.js, MongoDB" />

          <button onClick={() => setStep(2)} className="btn">
            Next →
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-3">
          <label>
            <input type="checkbox" name="salaryNegotiable" onChange={onChange} /> Negotiable Salary
          </label>

          <Input name="salaryMin" type="number" placeholder="Min Salary" onChange={onChange} />
          <Input name="salaryMax" type="number" placeholder="Max Salary" onChange={onChange} />
          <Hint text="Enter numbers only (no comma, no text)" />

          <Input name="vacancy" type="number" placeholder="Vacancy" onChange={onChange} />
          <Hint text="How many people you want to hire" />

          <Input name="applicationDeadline" type="date" onChange={onChange} />
          <Hint text="Last date to apply" />

          <div className="flex justify-between">
            <button onClick={() => setStep(1)}>← Back</button>
            <button onClick={() => setStep(3)}>Next →</button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-3">
          <TextArea name="responsibilities" rows="3" onChange={onChange} />
          <Hint text="Use comma: Build UI, Fix bugs, API integration" />

          <TextArea name="benefits" rows="3" onChange={onChange} />
          <Hint text="Use comma: Bonus, Lunch, Insurance" />

          <TextArea name="description" rows="4" onChange={onChange} />
          <Hint text="Use full sentences with dot. Example: Candidates must be punctual." />

          <div className="flex justify-between">
            <button onClick={() => setStep(2)}>← Back</button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="bg-emerald-600 text-white px-4 py-2 rounded"
            >
              <PlusCircle size={16} />
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      )}

      {message && <p className="text-red-500 mt-3">{message}</p>}
    </section>
  );
};

export default PostJob;
