import { useEffect, useState } from "react";
import api from "../api/client";
import PremiumStatusCard from "./PremiumStatusCard";
import { User, Book, Briefcase, FileText, Edit, Trash2, UploadCloud } from 'lucide-react';

const SECTIONS = [
  { key: "personal", label: "1. Personal", icon: User },
  { key: "educationTrain", label: "2. Education/Train", icon: Book },
  { key: "employment", label: "3. Employment", icon: Briefcase },
  { key: "courseIntern", label: "4. Course/Intern", icon: FileText },
];

const defaultForm = {
  headline: "",
  summary: "",
  firstName: "",
  lastName: "",
  fatherName: "",
  motherName: "",
  dateOfBirth: "",
  gender: "",
  religion: "",
  maritalStatus: "",
  divisionId: "",
  divisionName: "",
  districtId: "",
  districtName: "",
  upazilaId: "",
  upazilaName: "",
  unionId: "",
  unionName: "",
  nationalId: "",
  primaryMobile: "",
  secondaryMobile: "",
  emergencyContact: "",
  primaryEmail: "",
  alternateEmail: "",
  bloodGroup: "",
  heightMeters: "",
  weightKg: "",
  totalExperienceYears: "",
  preferredRole: "",
  expectedSalary: "",
  location: "",
  skills: "",
  skillDetails: [],
  experienceHistory: [],
  academics: [],
  coursesOrInternships: [],
};

const FileInput = ({ label, id, value, onChange }) => {
  const fileName =
    typeof value === "string"
      ? value.split("/").pop()
      : value?.name;

  return (
    <div className="col-span-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
          <div className="flex text-sm text-slate-600">
            <label htmlFor={id} className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
              <span>Upload a file</span>
              <input id={id} name={id} type="file" className="sr-only" onChange={onChange} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>
          {fileName ? <p className="text-sm text-slate-500">{fileName}</p> : null}
        </div>
      </div>
    </div>
  );
};


const PremiumProfileForm = ({ embedded = false }) => {
  const [profile, setProfile] = useState(null);
  const [minimumExperienceYears, setMinimumExperienceYears] = useState(3);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("personal");
  const [editingSection, setEditingSection] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [docs, setDocs] = useState({
    cv: null,
    experienceLetter: null,
    companyIdCard: null,
    additionalDoc: null
  });
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [unions, setUnions] = useState([]);

  const toPayload = (nextForm) => ({
    skillDetails: Array.isArray(nextForm.skillDetails) ? nextForm.skillDetails : [],
    ...nextForm,
    totalExperienceYears: Number(nextForm.totalExperienceYears) || 0,
    expectedSalary: Number(nextForm.expectedSalary) || 0,
    skills: Array.isArray(nextForm.skillDetails) && nextForm.skillDetails.length > 0
      ? nextForm.skillDetails.map((item) => String(item.skill || "").trim()).filter(Boolean)
      : String(nextForm.skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
    experienceHistory: Array.isArray(nextForm.experienceHistory) ? nextForm.experienceHistory : [],
    academics: Array.isArray(nextForm.academics) ? nextForm.academics : [],
    coursesOrInternships: (nextForm.coursesOrInternships || []).map(ci => ({...ci, certificateFile: undefined}))
  });

  const loadProfile = async () => {
    const { data } = await api.get("/premium/me");
    const p = data.profile || {};
    setProfile(p);
    setMinimumExperienceYears(data.minimumExperienceYears || 3);
    setForm({
      headline: p.headline || "",
      summary: p.summary || "",
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      fatherName: p.fatherName || "",
      motherName: p.motherName || "",
      dateOfBirth: p.dateOfBirth || "",
      gender: p.gender || "",
      religion: p.religion || "",
      maritalStatus: p.maritalStatus || "",
      divisionId: p.divisionId ? String(p.divisionId) : "",
      divisionName: p.divisionName || "",
      districtId: p.districtId ? String(p.districtId) : "",
      districtName: p.districtName || "",
      upazilaId: p.upazilaId ? String(p.upazilaId) : "",
      upazilaName: p.upazilaName || "",
      unionId: p.unionId ? String(p.unionId) : "",
      unionName: p.unionName || "",
      nationalId: p.nationalId || "",
      primaryMobile: p.primaryMobile || "",
      secondaryMobile: p.secondaryMobile || "",
      emergencyContact: p.emergencyContact || "",
      primaryEmail: p.primaryEmail || "",
      alternateEmail: p.alternateEmail || "",
      bloodGroup: p.bloodGroup || "",
      heightMeters: p.heightMeters || "",
      weightKg: p.weightKg || "",
      totalExperienceYears: p.totalExperienceYears || "",
      preferredRole: p.preferredRole || "",
      expectedSalary: p.expectedSalary ?? "",
      location: p.location || "",
      skills: Array.isArray(p.skills) ? p.skills.join(", ") : "",
      skillDetails: Array.isArray(p.skillDetails) && p.skillDetails.length > 0
        ? p.skillDetails
        : Array.isArray(p.skills)
          ? p.skills.map((skill) => ({ skill, learnedBy: "" }))
          : [],
      experienceHistory: Array.isArray(p.experienceHistory) ? p.experienceHistory : [],
      academics: Array.isArray(p.academics) ? p.academics : [],
      coursesOrInternships: Array.isArray(p.coursesOrInternships) ? p.coursesOrInternships : [],
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const loadDivisions = async () => {
      try {
        const { data } = await api.get("/geo/divisions");
        setDivisions(data.divisions || []);
      } catch (_error) {
        setDivisions([]);
      }
    };
    loadDivisions();
  }, []);

  useEffect(() => {
    const loadDistricts = async () => {
      if (!form.divisionId) {
        setDistricts([]);
        return;
      }
      try {
        const { data } = await api.get(`/geo/districts?divisionId=${form.divisionId}`);
        setDistricts(data.districts || []);
      } catch (_error) {
        setDistricts([]);
      }
    };
    loadDistricts();
  }, [form.divisionId]);

  useEffect(() => {
    const loadUpazilas = async () => {
      if (!form.districtId) {
        setUpazilas([]);
        return;
      }
      try {
        const { data } = await api.get(`/geo/upazilas?districtId=${form.districtId}`);
        setUpazilas(data.upazilas || []);
      } catch (_error) {
        setUpazilas([]);
      }
    };
    loadUpazilas();
  }, [form.districtId]);

  useEffect(() => {
    const loadUnions = async () => {
      if (!form.upazilaId) {
        setUnions([]);
        return;
      }
      try {
        const { data } = await api.get(`/geo/unions?upazilaId=${form.upazilaId}`);
        setUnions(data.unions || []);
      } catch (_error) {
        setUnions([]);
      }
    };
    loadUnions();
  }, [form.upazilaId]);

  const saveDraft = async (nextForm = form) => {
    try {
      await api.post("/premium/me", toPayload(nextForm));
      
      const fd = new FormData();
      let hasFiles = false;
      if (docs.cv) { fd.append("cv", docs.cv); hasFiles = true; }
      if (docs.experienceLetter) { fd.append("experienceLetter", docs.experienceLetter); hasFiles = true; }
      if (docs.companyIdCard) { fd.append("companyIdCard", docs.companyIdCard); hasFiles = true; }
      if (docs.additionalDoc) { fd.append("additionalDoc", docs.additionalDoc); hasFiles = true; }

      (nextForm.coursesOrInternships || []).forEach((item, idx) => {
        if (item.certificateFile && typeof item.certificateFile !== 'string') {
          fd.append(`courseInternCertificate_${idx}`, item.certificateFile, `courseInternCertificate_${idx}_${item.certificateFile.name}`);
          hasFiles = true;
        }
      });

      if (hasFiles) {
        await api.post("/premium/me/upload-docs", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      await loadProfile();
      setMessage("Section updated successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save section.");
    }
  };

  const clearSection = async (sectionKey) => {
    let next = { ...form };

    if (sectionKey === "personal") {
      next = {
        ...next,
        firstName: "",
        lastName: "",
        fatherName: "",
        motherName: "",
        dateOfBirth: "",
        gender: "",
        religion: "",
        maritalStatus: "",
        divisionId: "",
        divisionName: "",
        districtId: "",
        districtName: "",
        upazilaId: "",
        upazilaName: "",
        unionId: "",
        unionName: "",
        nationalId: "",
        primaryMobile: "",
        secondaryMobile: "",
        emergencyContact: "",
        primaryEmail: "",
        alternateEmail: "",
        bloodGroup: "",
        heightMeters: "",
        weightKg: ""
      };
    }
    if (sectionKey === "educationTrain") {
      next = { ...next, academics: [] };
    }
    if (sectionKey === "employment") {
      next = { ...next, totalExperienceYears: "", expectedSalary: "", experienceHistory: [] };
    }
    if (sectionKey === "courseIntern") {
      next = { ...next, summary: "", skills: "", skillDetails: [], coursesOrInternships: [] };
    }

    setForm(next);
    await saveDraft(next);
    setEditingSection("");
  };

  const onSubmitForPayment = async () => {
    try {
      await api.post("/premium/me/submit");
      await loadProfile();
      setMessage("Submitted. Now complete payment.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Submission failed.");
    }
  };

  const isEditing = editingSection === activeSection;

  return (
    <section className="space-y-4">
      {!embedded ? (
        <>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Premium Package: 99 BDT for 30 days. Admin approval is required before public listing.
          </div>
          <PremiumStatusCard profile={profile} minimumExperienceYears={minimumExperienceYears} />
        </>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="p-4">
            <h2 className="text-2xl font-bold text-slate-900">Expert Profile</h2>
            <p className="mt-1 text-sm text-slate-600">Complete your profile to get access to premium features.</p>
        </div>

        <div className="flex flex-col md:flex-row min-h-[600px]">
            <div className="w-full md:w-1/4 border-r border-slate-200">
                <div className="p-4 space-y-2">
                    {SECTIONS.map((item) => (
                        <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                            setActiveSection(item.key);
                            setEditingSection("");
                        }}
                        className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-left ${activeSection === item.key ? "bg-emerald-600 text-white" : "hover:bg-slate-100 text-slate-700"}`}
                        >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full md:w-3/4">
                <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">{SECTIONS.find((s) => s.key === activeSection)?.label}</h3>
                        <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setEditingSection(activeSection)}
                            className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => clearSection(activeSection)}
                            className="flex items-center gap-2 rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {activeSection === "personal" && (
                        isEditing ? (
                            <div className="grid gap-3 md:grid-cols-2">
                            <input className="w-full rounded-md border p-2" placeholder="First Name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Last Name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Father's Name" value={form.fatherName} onChange={(e) => setForm((p) => ({ ...p, fatherName: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Mother's Name" value={form.motherName} onChange={(e) => setForm((p) => ({ ...p, motherName: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Date of Birth" value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
                            <select className="w-full rounded-md border p-2" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <select className="w-full rounded-md border p-2" value={form.religion} onChange={(e) => setForm((p) => ({ ...p, religion: e.target.value }))}>
                                <option value="">Select Religion</option>
                                <option value="Islam">Islam</option>
                                <option value="Hinduism">Hinduism</option>
                                <option value="Buddhism">Buddhism</option>
                                <option value="Christianity">Christianity</option>
                                <option value="Other">Other</option>
                            </select>
                            <select className="w-full rounded-md border p-2" value={form.maritalStatus} onChange={(e) => setForm((p) => ({ ...p, maritalStatus: e.target.value }))}>
                                <option value="">Select Marital Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                            <select
                                className="w-full rounded-md border p-2"
                                value={form.divisionId}
                                onChange={(e) => {
                                const selected = divisions.find((x) => String(x.divisionId) === e.target.value);
                                setForm((p) => ({
                                    ...p,
                                    divisionId: e.target.value,
                                    divisionName: selected?.name || "",
                                    districtId: "",
                                    districtName: "",
                                    upazilaId: "",
                                    upazilaName: "",
                                    unionId: "",
                                    unionName: ""
                                }));
                                }}
                            >
                                <option value="">Select Division</option>
                                {divisions.map((item) => (
                                <option key={item.divisionId} value={item.divisionId}>{item.name}</option>
                                ))}
                            </select>
                            <select
                                className="w-full rounded-md border p-2"
                                value={form.districtId}
                                onChange={(e) => {
                                const selected = districts.find((x) => String(x.districtId) === e.target.value);
                                setForm((p) => ({
                                    ...p,
                                    districtId: e.target.value,
                                    districtName: selected?.name || "",
                                    upazilaId: "",
                                    upazilaName: "",
                                    unionId: "",
                                    unionName: ""
                                }));
                                }}
                                disabled={!form.divisionId}
                            >
                                <option value="">Select District</option>
                                {districts.map((item) => (
                                <option key={item.districtId} value={item.districtId}>{item.name}</option>
                                ))}
                            </select>
                            <select
                                className="w-full rounded-md border p-2"
                                value={form.upazilaId}
                                onChange={(e) => {
                                const selected = upazilas.find((x) => String(x.upazilaId) === e.target.value);
                                setForm((p) => ({
                                    ...p,
                                    upazilaId: e.target.value,
                                    upazilaName: selected?.name || "",
                                    unionId: "",
                                    unionName: ""
                                }));
                                }}
                                disabled={!form.districtId}
                            >
                                <option value="">Select Thana</option>
                                {upazilas.map((item) => (
                                <option key={item.upazilaId} value={item.upazilaId}>{item.name}</option>
                                ))}
                            </select>
                            <select
                                className="w-full rounded-md border p-2"
                                value={form.unionId}
                                onChange={(e) => {
                                const selected = unions.find((x) => String(x.unionId) === e.target.value);
                                setForm((p) => ({
                                    ...p,
                                    unionId: e.target.value,
                                    unionName: selected?.name || ""
                                }));
                                }}
                                disabled={!form.upazilaId}
                            >
                                <option value="">Select Union</option>
                                {unions.map((item) => (
                                <option key={item.unionId} value={item.unionId}>{item.name}</option>
                                ))}
                            </select>
                            <input className="w-full rounded-md border p-2" placeholder="National Id" value={form.nationalId} onChange={(e) => setForm((p) => ({ ...p, nationalId: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Primary Mobile" value={form.primaryMobile} onChange={(e) => setForm((p) => ({ ...p, primaryMobile: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Secondary Mobile" value={form.secondaryMobile} onChange={(e) => setForm((p) => ({ ...p, secondaryMobile: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm((p) => ({ ...p, emergencyContact: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Primary Email" value={form.primaryEmail} onChange={(e) => setForm((p) => ({ ...p, primaryEmail: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Alternate Email" value={form.alternateEmail} onChange={(e) => setForm((p) => ({ ...p, alternateEmail: e.target.value }))} />
                            <select className="w-full rounded-md border p-2" value={form.bloodGroup} onChange={(e) => setForm((p) => ({ ...p, bloodGroup: e.target.value }))}>
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                            <input className="w-full rounded-md border p-2" placeholder="Height (meters)" value={form.heightMeters} onChange={(e) => setForm((p) => ({ ...p, heightMeters: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Weight (kg)" value={form.weightKg} onChange={(e) => setForm((p) => ({ ...p, weightKg: e.target.value }))} />
                            </div>
                        ) : (
                            <div className="grid gap-2 md:grid-cols-2">
                            <p className="text-sm text-slate-700">First Name: {form.firstName || "N/A"}</p>
                            <p className="text-sm text-slate-700">Last Name: {form.lastName || "N/A"}</p>
                            <p className="text-sm text-slate-700">Father's Name: {form.fatherName || "N/A"}</p>
                            <p className="text-sm text-slate-700">Mother's Name: {form.motherName || "N/A"}</p>
                            <p className="text-sm text-slate-700">Date of Birth: {form.dateOfBirth || "N/A"}</p>
                            <p className="text-sm text-slate-700">Gender: {form.gender || "N/A"}</p>
                            <p className="text-sm text-slate-700">Religion: {form.religion || "N/A"}</p>
                            <p className="text-sm text-slate-700">Marital Status: {form.maritalStatus || "N/A"}</p>
                            <p className="text-sm text-slate-700">Division: {form.divisionName || "N/A"}</p>
                            <p className="text-sm text-slate-700">District: {form.districtName || "N/A"}</p>
                            <p className="text-sm text-slate-700">Thana: {form.upazilaName || "N/A"}</p>
                            <p className="text-sm text-slate-700">Union: {form.unionName || "N/A"}</p>
                            <p className="text-sm text-slate-700">National Id: {form.nationalId || "N/A"}</p>
                            <p className="text-sm text-slate-700">Primary Mobile: {form.primaryMobile || "N/A"}</p>
                            <p className="text-sm text-slate-700">Secondary Mobile: {form.secondaryMobile || "N/A"}</p>
                            <p className="text-sm text-slate-700">Emergency Contact: {form.emergencyContact || "N/A"}</p>
                            <p className="text-sm text-slate-700">Primary Email: {form.primaryEmail || "N/A"}</p>
                            <p className="text-sm text-slate-700">Alternate Email: {form.alternateEmail || "N/A"}</p>
                            <p className="text-sm text-slate-700">Blood Group: {form.bloodGroup || "N/A"}</p>
                            <p className="text-sm text-slate-700">Height (meters): {form.heightMeters || "N/A"}</p>
                            <p className="text-sm text-slate-700">Weight (kg): {form.weightKg || "N/A"}</p>
                            </div>
                        )
                        )}

                        {activeSection === "educationTrain" && (
                        isEditing ? (
                            <div className="space-y-4">
                            {(form.academics || []).map((item, idx) => (
                                <div key={`academic-${idx}`} className="rounded-md border border-slate-200 p-3">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900">Academic {idx + 1}</p>
                                    <button
                                    type="button"
                                    onClick={() =>
                                        setForm((p) => ({
                                        ...p,
                                        academics: p.academics.filter((_, i) => i !== idx)
                                        }))
                                    }
                                    className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                                    >
                                    Delete
                                    </button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <input className="rounded-md border p-2" placeholder="Level of Education" value={item.levelOfEducation || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, levelOfEducation: e.target.value } : a)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Exam/Degree Title" value={item.examDegreeTitle || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, examDegreeTitle: e.target.value } : a)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Concentration/Major/Group" value={item.concentrationMajorGroup || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, concentrationMajorGroup: e.target.value } : a)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Institute Name" value={item.instituteName || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, instituteName: e.target.value } : a)) }))} />
                                    <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={Boolean(item.isForeignInstitute)} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, isForeignInstitute: e.target.checked } : a)) }))} />
                                    This is a foreign institute
                                    </label>
                                    <input className="rounded-md border p-2" placeholder="Result" value={item.result || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, result: e.target.value } : a)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Year of Passing" value={item.yearOfPassing || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, yearOfPassing: e.target.value } : a)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Duration (Years)" value={item.durationYears || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, durationYears: e.target.value } : a)) }))} />
                                    <textarea className="md:col-span-2 rounded-md border p-2" rows="3" placeholder="Achievement Note" value={item.achievementNote || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, achievementNote: e.target.value } : a)) }))} />
                                </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                setForm((p) => ({
                                    ...p,
                                    academics: [
                                    ...(p.academics || []),
                                    {
                                        levelOfEducation: "",
                                        examDegreeTitle: "",
                                        concentrationMajorGroup: "",
                                        instituteName: "",
                                        isForeignInstitute: false,
                                        result: "",
                                        yearOfPassing: "",
                                        durationYears: "",
                                        achievementNote: ""
                                    }
                                    ]
                                }))
                                }
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                            >
                                +Add Education (if require)
                            </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {(form.academics || []).length === 0 ? <p className="text-sm text-slate-700">N/A</p> : null}
                            {(form.academics || []).map((item, idx) => (
                                <div key={`academic-view-${idx}`} className="rounded-md border border-slate-200 p-3">
                                <p className="text-sm font-semibold text-slate-900">Academic {idx + 1}</p>
                                <p className="text-sm text-slate-700">Level of Education: {item.levelOfEducation || "N/A"}</p>
                                <p className="text-sm text-slate-700">Exam/Degree Title: {item.examDegreeTitle || "N/A"}</p>
                                <p className="text-sm text-slate-700">Concentration/Major/Group: {item.concentrationMajorGroup || "N/A"}</p>
                                <p className="text-sm text-slate-700">Institute Name: {item.instituteName || "N/A"}</p>
                                <p className="text-sm text-slate-700">This is a foreign institute: {item.isForeignInstitute ? "Yes" : "No"}</p>
                                <p className="text-sm text-slate-700">Result: {item.result || "N/A"}</p>
                                <p className="text-sm text-slate-700">Year of Passing: {item.yearOfPassing || "N/A"}</p>
                                <p className="text-sm text-slate-700">Duration (Years): {item.durationYears || "N/A"}</p>
                                <p className="text-sm text-slate-700 whitespace-pre-line">Achievement Note: {item.achievementNote || "N/A"}</p>
                                </div>
                            ))}
                            </div>
                        )
                        )}

                        {activeSection === "employment" && (
                        isEditing ? (
                            <div className="space-y-4">
                            <input
                                className="w-full rounded-md border p-2"
                                type="number"
                                placeholder="Total Experience Years"
                                value={form.totalExperienceYears}
                                onChange={(e) => setForm((p) => ({ ...p, totalExperienceYears: e.target.value }))}
                            />
                            {(form.experienceHistory || []).map((item, idx) => (
                                <div key={`experience-${idx}`} className="rounded-md border border-slate-200 p-3">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900">Experience {idx + 1}</p>
                                    <button
                                    type="button"
                                    onClick={() =>
                                        setForm((p) => ({
                                        ...p,
                                        experienceHistory: p.experienceHistory.filter((_, i) => i !== idx)
                                        }))
                                    }
                                    className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                                    >
                                    Delete
                                    </button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <input className="rounded-md border p-2" placeholder="Company Name" value={item.companyName || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, companyName: e.target.value } : x)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Company Business" value={item.companyBusiness || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, companyBusiness: e.target.value } : x)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Designation" value={item.designation || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, designation: e.target.value } : x)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Department" value={item.department || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, department: e.target.value } : x)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Employment Period" value={item.employmentPeriod || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, employmentPeriod: e.target.value } : x)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Area of Expertise" value={item.areaOfExpertise || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, areaOfExpertise: e.target.value } : x)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Company Location" value={item.companyLocation || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, companyLocation: e.target.value } : x)) }))} />
                                    <FileInput label="Company Clearance" id="cv-upload" value={docs.cv} onChange={(e) => setDocs((p) => ({ ...p, cv: e.target.files?.[0] || null }))} />
                                    <FileInput label="Company Id Card" id="experience-letter-upload" value={docs.experienceLetter} onChange={(e) => setDocs((p) => ({ ...p, experienceLetter: e.target.files?.[0] || null }))} />
                                    <FileInput label="Appointment Letter" id="company-id-card-upload" value={docs.companyIdCard} onChange={(e) => setDocs((p) => ({ ...p, companyIdCard: e.target.files?.[0] || null }))} />
                                    <textarea className="md:col-span-2 rounded-md border p-2" rows="3" placeholder="Responsibilities" value={item.responsibilities || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, responsibilities: e.target.value } : x)) }))} />
                                </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                setForm((p) => ({
                                    ...p,
                                    experienceHistory: [
                                    ...(p.experienceHistory || []),
                                    {
                                        companyName: "",
                                        companyBusiness: "",
                                        designation: "",
                                        department: "",
                                        employmentPeriod: "",
                                        responsibilities: "",
                                        areaOfExpertise: "",
                                        companyLocation: ""
                                    }
                                    ]
                                }))
                                }
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                            >
                                +Add experience(if require)
                            </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                            <p className="text-sm text-slate-700">Total Experience Years: {form.totalExperienceYears || "N/A"}</p>
                            {(form.experienceHistory || []).length === 0 ? <p className="text-sm text-slate-700">N/A</p> : null}
                            {(form.experienceHistory || []).map((item, idx) => (
                                <div key={`experience-view-${idx}`} className="rounded-md border border-slate-200 p-3">
                                <p className="text-sm font-semibold text-slate-900">Experience {idx + 1}</p>
                                <p className="text-sm text-slate-700">Company Name: {item.companyName || "N/A"}</p>
                                <p className="text-sm text-slate-700">Company Business: {item.companyBusiness || "N/A"}</p>
                                <p className="text-sm text-slate-700">Designation: {item.designation || "N/A"}</p>
                                <p className="text-sm text-slate-700">Department: {item.department || "N/A"}</p>
                                <p className="text-sm text-slate-700">Employment Period: {item.employmentPeriod || "N/A"}</p>
                                <p className="text-sm text-slate-700">Responsibilities: {item.responsibilities || "N/A"}</p>
                                <p className="text-sm text-slate-700">Area of Expertise: {item.areaOfExpertise || "N/A"}</p>
                                <p className="text-sm text-slate-700">Company Location: {item.companyLocation || "N/A"}</p>
                                </div>
                            ))}
                            </div>
                        )
                        )}

                        {activeSection === "courseIntern" && (
                        isEditing ? (
                            <div className="space-y-4">
                            {(form.coursesOrInternships || []).map((item, idx) => (
                                <div key={`course-intern-${idx}`} className="rounded-md border border-slate-200 p-3">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900">{(item.type || 'Course/Intern') + ' ' + (idx + 1)}</p>
                                    <button
                                    type="button"
                                    onClick={() =>
                                        setForm((p) => ({
                                        ...p,
                                        coursesOrInternships: p.coursesOrInternships.filter((_, i) => i !== idx)
                                        }))
                                    }
                                    className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                                    >
                                    Delete
                                    </button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <select
                                    className="w-full rounded-md border p-2"
                                    value={item.type || "Course"}
                                    onChange={(e) => setForm((p) => ({ ...p, coursesOrInternships: p.coursesOrInternships.map((ci, i) => (i === idx ? { ...ci, type: e.target.value } : ci)) }))}
                                    >
                                    <option value="Course">Course</option>
                                    <option value="Internship">Internship</option>
                                    </select>
                                    <input className="rounded-md border p-2" placeholder={item.type === 'Internship' ? "Company Name" : "Organization name"} value={item.name || ""} onChange={(e) => setForm((p) => ({ ...p, coursesOrInternships: p.coursesOrInternships.map((ci, i) => (i === idx ? { ...ci, name: e.target.value } : ci)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Duration" value={item.duration || ""} onChange={(e) => setForm((p) => ({ ...p, coursesOrInternships: p.coursesOrInternships.map((ci, i) => (i === idx ? { ...ci, duration: e.target.value } : ci)) }))} />
                                    <FileInput
                                      label="Certificate"
                                      id={`certificate-upload-${idx}`}
                                      value={item.certificateFile || item.certificate}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setForm(p => ({
                                          ...p,
                                          coursesOrInternships: p.coursesOrInternships.map((ci, i) => i === idx ? { ...ci, certificateFile: file } : ci)
                                        }));
                                      }}
                                    />
                                </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() =>
                                setForm((p) => ({
                                    ...p,
                                    coursesOrInternships: [
                                    ...(p.coursesOrInternships || []),
                                    {
                                        type: 'Course',
                                        name: '',
                                        duration: '',
                                        certificateFile: null
                                    }
                                    ]
                                }))
                                }
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                            >
                                + Add Course/Internship
                            </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {(form.coursesOrInternships || []).length === 0 ? <p className="text-sm text-slate-700">N/A</p> : null}
                            {(form.coursesOrInternships || []).map((item, idx) => (
                                <div key={`course-intern-view-${idx}`} className="rounded-md border border-slate-200 p-3">
                                <p className="text-sm font-semibold text-slate-900">{item.type} {idx + 1}</p>
                                <p className="text-sm text-slate-700">{item.type === 'Internship' ? "Company" : "Course Name"}: {item.name || "N/A"}</p>
                                <p className="text-sm text-slate-700">Duration: {item.duration || "N/A"}</p>
                                <p className="text-sm text-slate-700">Certificate: {item.certificate ? (<a href={item.certificate} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">View</a>) : (item.certificateFile ? 'File ready for upload' : 'N/A')}</p>
                                </div>
                            ))}
                            </div>
                        )
                        )}
                    </div>

                    {isEditing && (
                        <div className="mt-4 flex gap-2">
                        <button type="button" onClick={() => saveDraft().then(() => setEditingSection(""))} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">
                            Save
                        </button>
                        <button type="button" onClick={() => setEditingSection("")} className="rounded-md border border-slate-300 px-4 py-2 text-sm">
                            Cancel
                        </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default PremiumProfileForm;
