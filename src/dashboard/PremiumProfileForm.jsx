import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import PremiumStatusCard from "./PremiumStatusCard";
import { User, MapPin, Book, Briefcase, Sparkles, FileText, Edit, Trash2, UploadCloud, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Skeleton, SkeletonText } from "../components/loaders/Skeleton";

const STEPS = [
  { key: "basic", section: "personal", label: "Basic Information", shortLabel: "Basic", icon: User },
  { key: "contact", section: "personal", label: "Contact & Location", shortLabel: "Contact", icon: MapPin },
  { key: "education", section: "educationTrain", label: "Education", shortLabel: "Education", icon: Book },
  { key: "experience", section: "employment", label: "Work Experience", shortLabel: "Experience", icon: Briefcase },
  { key: "skills", section: "courseIntern", label: "Skills & Extras", shortLabel: "Skills", icon: Sparkles },
  { key: "review", section: "review", label: "Review & Submit", shortLabel: "Review", icon: FileText },
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

const editorFieldClass =
  "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

const ReviewStep = ({ form, onEdit }) => {
  const items = [
    ["Name", [form.firstName, form.lastName].filter(Boolean).join(" ")],
    ["Preferred role", form.preferredRole],
    ["Location", [form.districtName, form.upazilaName].filter(Boolean).join(", ") || form.location],
    ["Education records", `${form.academics?.length || 0} added`],
    ["Experience records", `${form.experienceHistory?.length || 0} added`],
    ["Skills", form.skills || `${form.skillDetails?.length || 0} added`],
    ["Courses / internships", `${form.coursesOrInternships?.length || 0} added`],
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
        <p className="text-sm font-semibold text-emerald-800">Your profile is ready for a final review.</p>
        <p className="mt-1 text-sm text-emerald-700">Check the summary below before submitting your expert profile.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{value || "Not added yet"}</p>
          </div>
        ))}
      </div>
      <button type="button" onClick={onEdit} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
        Edit profile information
      </button>
    </div>
  );
};

const secondaryButtonClass =
  "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50";

const destructiveButtonClass =
  "inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-100";

const FileInput = ({ label, id, value, onChange, onClear }) => {
  const fileName =
    typeof value === "string"
      ? value.split("/").pop()
      : value?.name;

  return (
    <div className="col-span-2">
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="rounded-3xl border border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-6 py-8 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100">
            <UploadCloud className="h-7 w-7 text-emerald-600" />
          </div>
          <div className="text-sm text-slate-600">
            <label htmlFor={id} className="relative cursor-pointer rounded-full bg-white px-4 py-2 font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500">
              <span>Choose file</span>
              <input key={`${id}-${fileName || "empty"}`} id={id} name={id} type="file" className="sr-only" onChange={onChange} />
            </label>
            <p className="mt-3">Drag and drop or browse from your device</p>
          </div>
          <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>
          {fileName ? (
            <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-left shadow-sm">
              <p className="min-w-0 truncate text-sm font-medium text-slate-700">{fileName}</p>
              {onClear ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                  aria-label={`Remove ${fileName}`}
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const SectionTransitionLoader = ({ title = "Loading section..." }) => (
  <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-7 w-48 rounded-2xl" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-11 w-24 rounded-2xl" />
        <Skeleton className="h-11 w-24 rounded-2xl" />
      </div>
    </div>

    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 via-white to-cyan-50/40 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{title}</p>
      <SkeletonText lines={2} className="mt-4" />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
      </div>
    </div>
  </div>
);

const formatInsightDate = (value) => {
  if (!value) return "No views yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No views yet";

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const buildTopEmployers = (recentViews = []) => {
  const employerMap = new Map();

  recentViews.forEach((item) => {
    const key = item.employerName || "Employer";
    const existing = employerMap.get(key) || {
      employerName: key,
      total: 0,
      lastViewedAt: item.viewedAt
    };

    existing.total += 1;
    if (new Date(item.viewedAt || 0) > new Date(existing.lastViewedAt || 0)) {
      existing.lastViewedAt = item.viewedAt;
    }

    employerMap.set(key, existing);
  });

  return Array.from(employerMap.values())
    .sort((a, b) => b.total - a.total || new Date(b.lastViewedAt || 0) - new Date(a.lastViewedAt || 0))
    .slice(0, 5);
};


const PremiumProfileForm = ({ embedded = false }) => {
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState({
    totalViews: 0,
    uniqueEmployers: 0,
    viewsThisWeek: 0,
    lastViewedAt: null,
    recentViews: []
  });
  const [minimumExperienceYears, setMinimumExperienceYears] = useState(3);
  const [message, setMessage] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [activeSection, setActiveSection] = useState("personal");
  const [editingSection, setEditingSection] = useState("personal");
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
  const [sectionLoading, setSectionLoading] = useState(false);

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

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const { data } = await api.get("/premium/me");
      const p = data.profile || {};
      setProfile(p);
      setInsights(
        data.insights || {
          totalViews: 0,
          uniqueEmployers: 0,
          viewsThisWeek: 0,
          lastViewedAt: null,
          recentViews: []
        }
      );
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
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

  const switchSection = (sectionKey) => {
    if (sectionKey === activeSection) {
      setEditingSection("");
      return;
    }

    setSectionLoading(true);
    setEditingSection("");
    setTimeout(() => {
      setActiveSection(sectionKey);
      setSectionLoading(false);
    }, 320);
  };

  const goToStep = (stepIndex) => {
    const nextStep = Math.max(0, Math.min(STEPS.length - 1, stepIndex));
    setSectionLoading(true);
    setEditingSection("");
    setTimeout(() => {
      setActiveStep(nextStep);
      setActiveSection(STEPS[nextStep].section);
      setEditingSection(STEPS[nextStep].section === "review" ? "" : STEPS[nextStep].section);
      setSectionLoading(false);
    }, 180);
  };

  const saveAndNext = async () => {
    if (activeStep === STEPS.length - 1) return;
    await saveDraft();
    goToStep(activeStep + 1);
  };

  const isReviewStep = activeStep === STEPS.length - 1;
  const isEditing = editingSection === activeSection;
  const repeatViews = Math.max((insights.totalViews || 0) - (insights.uniqueEmployers || 0), 0);
  const recentEventPreview = (insights.recentViews || []).slice(0, 5);
  const topEmployers = buildTopEmployers(insights.recentViews || []);

  if (profileLoading) {
    return (
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-600">Loading your expert profile…</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {embedded ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Profile Insights</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Employer activity on your expert profile</h2>
              <p className="mt-1 text-sm text-slate-500">Last viewed: {formatInsightDate(insights.lastViewedAt)}</p>
            </div>
            <button
              type="button"
              onClick={() => loadProfile()}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total Views</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{insights.totalViews}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-emerald-700">Unique Employers</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{insights.uniqueEmployers}</p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-xs text-cyan-700">Views This Week</p>
              <p className="mt-1 text-2xl font-bold text-cyan-900">{insights.viewsThisWeek}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-700">Repeat Views</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{repeatViews}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Top Employers</p>
              </div>

              <div className="divide-y divide-slate-200">
                {topEmployers.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-slate-500">No employer summary available yet.</div>
                ) : null}

                {topEmployers.map((item) => (
                  <div key={`${item.employerName}-${item.lastViewedAt}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{item.employerName}</p>
                      <p className="text-xs text-slate-500">Last viewed {formatInsightDate(item.lastViewedAt)}</p>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.total} view{item.total > 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Latest 5 View Events</p>
              </div>

              <div className="divide-y divide-slate-200">
                {recentEventPreview.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-slate-500">No employer has viewed your expert profile yet.</div>
                ) : null}

                {recentEventPreview.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{item.employerName || "Employer"}</p>
                      <p className="text-xs text-slate-500">Viewed from Appoint Expertise</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-700">{formatInsightDate(item.viewedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!embedded ? (
        <>
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 p-5 text-sm text-emerald-900 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Premium Package</p>
                <p className="mt-1 text-slate-600">99 BDT for 30 days.</p>
              </div>
            </div>
          </div>
          <PremiumStatusCard profile={profile} minimumExperienceYears={minimumExperienceYears} />
        </>
      ) : null}

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)]">
        <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,#f8fffc_0%,#ffffff_45%,#f0fdfa_100%)] p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium Expert Profile
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Expert Profile</h2>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-900">Step {activeStep + 1} of {STEPS.length}</p>
                <p className="mt-0.5 text-xs text-slate-500">{STEPS[activeStep].label}</p>
              </div>
            </div>
        </div>

        <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
            <div className="border-b border-slate-200 bg-slate-50/70 p-4 md:p-6">
                <div className="flex items-start justify-between gap-2 overflow-x-auto pb-1">
                    {STEPS.map((item, index) => (
                        <button
                        key={item.key}
                        type="button"
                        onClick={() => index <= activeStep && goToStep(index)}
                        disabled={index > activeStep}
                        className={`group relative flex min-w-[92px] flex-1 flex-col items-center gap-2 rounded-2xl px-2 py-2 text-center text-xs transition-all duration-200 md:min-w-0 ${
                          activeStep === index
                            ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-200"
                            : index < activeStep
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                              : "bg-white text-slate-400 ring-1 ring-slate-200"
                        }`}
                        >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            activeStep === index ? "bg-white/15" : index < activeStep ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"
                          }`}>
                            {index < activeStep ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                          </span>
                          <span className="hidden font-semibold md:block">{item.label}</span>
                          <span className="font-semibold md:hidden">{item.shortLabel}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full">
                <div className="p-5 md:p-8">
                    <div className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="mt-2 text-xl font-semibold text-slate-900">{STEPS[activeStep].label}</h3>
                        </div>
                        <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          {isReviewStep ? "Ready to submit" : "Complete this step"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4 transition-all duration-300 [&_input]:outline-none [&_input]:transition [&_input]:focus:ring-4 [&_input]:focus:ring-emerald-100 [&_select]:outline-none [&_select]:transition [&_textarea]:outline-none [&_textarea]:transition [&_textarea]:focus:ring-4 [&_textarea]:focus:ring-emerald-100">
                        {sectionLoading ? (
                          <SectionTransitionLoader
                            title={`${STEPS[activeStep]?.label || "Section"} ready state`}
                          />
                        ) : null}
                        {!sectionLoading ? (
                          <>
                        {isReviewStep ? (
                          <ReviewStep form={form} onEdit={() => goToStep(0)} />
                        ) : null}
                        {activeSection === "personal" && (
                        isEditing ? (
                            <div className="grid gap-4 md:grid-cols-2 [&_input]:w-full [&_input]:rounded-2xl [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white/90 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:shadow-sm [&_input]:transition [&_input]:placeholder:text-slate-400 [&_input]:focus:border-emerald-400 [&_input]:focus:ring-4 [&_input]:focus:ring-emerald-100 [&_select]:w-full [&_select]:rounded-2xl [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white/90 [&_select]:px-4 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:shadow-sm [&_select]:transition [&_select]:focus:border-emerald-400 [&_select]:focus:ring-4 [&_select]:focus:ring-emerald-100">
                            {activeStep === 0 ? (
                              <>
                            <input className="w-full rounded-md border p-2 md:col-span-2" placeholder="Profile headline" value={form.headline} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))} />
                            <textarea className="w-full rounded-md border p-2 md:col-span-2" rows="3" placeholder="Short professional summary" value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} />
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
                              </>
                            ) : null}
                            {activeStep === 1 ? (
                              <>
                            <input className="w-full rounded-md border p-2 md:col-span-2" placeholder="Preferred Role" value={form.preferredRole} onChange={(e) => setForm((p) => ({ ...p, preferredRole: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" type="number" placeholder="Expected Salary" value={form.expectedSalary} onChange={(e) => setForm((p) => ({ ...p, expectedSalary: e.target.value }))} />
                            <input className="w-full rounded-md border p-2" placeholder="Current Location / Address" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
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
                              </>
                            ) : null}
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2 [&_p]:rounded-2xl [&_p]:border [&_p]:border-slate-200 [&_p]:bg-white [&_p]:p-4 [&_p]:text-sm [&_p]:text-slate-700 [&_p]:shadow-sm">
                            <p>First Name: {form.firstName || "N/A"}</p>
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
                            <p>Weight (kg): {form.weightKg || "N/A"}</p>
                            </div>
                        )
                        )}

                        {activeSection === "educationTrain" && (
                        isEditing ? (
                            <div className="space-y-4 [&_input]:w-full [&_input]:rounded-2xl [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white/90 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:shadow-sm [&_input]:transition [&_input]:placeholder:text-slate-400 [&_input]:focus:border-emerald-400 [&_input]:focus:ring-4 [&_input]:focus:ring-emerald-100 [&_select]:w-full [&_select]:rounded-2xl [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white/90 [&_select]:px-4 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:shadow-sm [&_select]:transition [&_select]:focus:border-emerald-400 [&_select]:focus:ring-4 [&_select]:focus:ring-emerald-100 [&_textarea]:w-full [&_textarea]:rounded-2xl [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white/90 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:shadow-sm [&_textarea]:transition [&_textarea]:placeholder:text-slate-400 [&_textarea]:focus:border-emerald-400 [&_textarea]:focus:ring-4 [&_textarea]:focus:ring-emerald-100">
                            {(form.academics || []).map((item, idx) => (
                                <div key={`academic-${idx}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900">Academic {idx + 1}</p>
                                    <button
                                    type="button"
                                    onClick={() =>
                                        setForm((p) => ({
                                        ...p,
                                        academics: p.academics.filter((_, i) => i !== idx)
                                        }))
                                    }
                                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"
                                    >
                                    Delete
                                    </button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <input className="rounded-md border p-2" placeholder="Level of Education" value={item.levelOfEducation || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, levelOfEducation: e.target.value } : a)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Exam/Degree Title" value={item.examDegreeTitle || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, examDegreeTitle: e.target.value } : a)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Concentration/Major/Group" value={item.concentrationMajorGroup || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, concentrationMajorGroup: e.target.value } : a)) }))} />
                                    <input className="rounded-md border p-2" placeholder="Institute Name" value={item.instituteName || ""} onChange={(e) => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, instituteName: e.target.value } : a)) }))} />
                                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 md:col-span-2">
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">Foreign institute</p>
                                        <p className="mt-0.5 text-xs text-slate-500">Qualification completed outside Bangladesh</p>
                                      </div>
                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={Boolean(item.isForeignInstitute)}
                                        aria-label={`Foreign institute for academic record ${idx + 1}`}
                                        onClick={() => setForm((p) => ({ ...p, academics: p.academics.map((a, i) => (i === idx ? { ...a, isForeignInstitute: !a.isForeignInstitute } : a)) }))}
                                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                                          item.isForeignInstitute ? "bg-emerald-600" : "bg-slate-300"
                                        }`}
                                      >
                                        <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${item.isForeignInstitute ? "translate-x-5" : "translate-x-0"}`} />
                                      </button>
                                    </div>
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
                                className={secondaryButtonClass}
                            >
                                +Add Education (if require)
                            </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {(form.academics || []).length === 0 ? <p className="text-sm text-slate-700">N/A</p> : null}
                            {(form.academics || []).map((item, idx) => (
                                <div key={`academic-view-${idx}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="mb-3 text-sm font-semibold text-slate-900">Academic {idx + 1}</p>
                                <div className="grid gap-3 md:grid-cols-2 [&_p]:rounded-2xl [&_p]:border [&_p]:border-slate-200 [&_p]:bg-slate-50/80 [&_p]:p-4 [&_p]:text-sm [&_p]:text-slate-700">
                                  <p>Level of Education: {item.levelOfEducation || "N/A"}</p>
                                  <p>Exam/Degree Title: {item.examDegreeTitle || "N/A"}</p>
                                  <p>Concentration/Major/Group: {item.concentrationMajorGroup || "N/A"}</p>
                                  <p>Institute Name: {item.instituteName || "N/A"}</p>
                                  <p>This is a foreign institute: {item.isForeignInstitute ? "Yes" : "No"}</p>
                                  <p>Result: {item.result || "N/A"}</p>
                                  <p>Year of Passing: {item.yearOfPassing || "N/A"}</p>
                                  <p>Duration (Years): {item.durationYears || "N/A"}</p>
                                  <p className="md:col-span-2">Achievement Note: {item.achievementNote || "N/A"}</p>
                                </div>
                                </div>
                            ))}
                            </div>
                        )
                        )}

                        {activeSection === "employment" && (
                        isEditing ? (
                            <div className="space-y-4 [&_input]:w-full [&_input]:rounded-2xl [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white/90 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:shadow-sm [&_input]:transition [&_input]:placeholder:text-slate-400 [&_input]:focus:border-emerald-400 [&_input]:focus:ring-4 [&_input]:focus:ring-emerald-100 [&_textarea]:w-full [&_textarea]:rounded-2xl [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white/90 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:shadow-sm [&_textarea]:transition [&_textarea]:placeholder:text-slate-400 [&_textarea]:focus:border-emerald-400 [&_textarea]:focus:ring-4 [&_textarea]:focus:ring-emerald-100">
                            <input
                                className={editorFieldClass}
                                type="number"
                                min="0"
                                max="60"
                                step="0.1"
                                inputMode="decimal"
                                placeholder="Total Experience Years"
                                value={form.totalExperienceYears}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d*(\.\d{0,1})?$/.test(value)) {
                                    setForm((p) => ({ ...p, totalExperienceYears: value }));
                                  }
                                }}
                            />
                            {(form.experienceHistory || []).map((item, idx) => (
                                <div key={`experience-${idx}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900">Experience {idx + 1}</p>
                                    <button
                                    type="button"
                                    onClick={() =>
                                        setForm((p) => ({
                                        ...p,
                                        experienceHistory: p.experienceHistory.filter((_, i) => i !== idx)
                                        }))
                                    }
                                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"
                                    >
                                    Delete
                                    </button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <input type="text" autoComplete="organization" className="rounded-md border p-2" placeholder="Company Name" value={item.companyName || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, companyName: e.target.value } : x)) }))} />
                                    <input type="text" autoComplete="off" className="rounded-md border p-2" placeholder="Company Business" value={item.companyBusiness || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, companyBusiness: e.target.value } : x)) }))} />
                                    <input type="text" autoComplete="organization-title" className="rounded-md border p-2" placeholder="Designation" value={item.designation || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, designation: e.target.value } : x)) }))} />
                                    <input type="text" autoComplete="organization-title" className="rounded-md border p-2" placeholder="Department" value={item.department || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, department: e.target.value } : x)) }))} />
                                    <input type="text" autoComplete="off" className="rounded-md border p-2" placeholder="Employment Period (e.g. 2021–2024)" value={item.employmentPeriod || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, employmentPeriod: e.target.value } : x)) }))} />
                                    <input type="text" autoComplete="off" className="rounded-md border p-2" placeholder="Area of Expertise" value={item.areaOfExpertise || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, areaOfExpertise: e.target.value } : x)) }))} />
                                    <input type="text" autoComplete="street-address" className="rounded-md border p-2" placeholder="Company Location" value={item.companyLocation || ""} onChange={(e) => setForm((p) => ({ ...p, experienceHistory: p.experienceHistory.map((x, i) => (i === idx ? { ...x, companyLocation: e.target.value } : x)) }))} />
                                    <FileInput label="Company Clearance" id="cv-upload" value={docs.cv} onChange={(e) => setDocs((p) => ({ ...p, cv: e.target.files?.[0] || null }))} onClear={() => setDocs((p) => ({ ...p, cv: null }))} />
                                    <FileInput label="Company Id Card" id="experience-letter-upload" value={docs.experienceLetter} onChange={(e) => setDocs((p) => ({ ...p, experienceLetter: e.target.files?.[0] || null }))} onClear={() => setDocs((p) => ({ ...p, experienceLetter: null }))} />
                                    <FileInput label="Appointment Letter" id="company-id-card-upload" value={docs.companyIdCard} onChange={(e) => setDocs((p) => ({ ...p, companyIdCard: e.target.files?.[0] || null }))} onClear={() => setDocs((p) => ({ ...p, companyIdCard: null }))} />
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
                                className={secondaryButtonClass}
                            >
                                +Add experience(if require)
                            </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Experience Summary</p>
                              <p className="mt-2 text-sm text-slate-700">Total Experience Years: <span className="font-semibold text-slate-900">{form.totalExperienceYears || "N/A"}</span></p>
                            </div>
                            {(form.experienceHistory || []).length === 0 ? <p className="text-sm text-slate-700">N/A</p> : null}
                            {(form.experienceHistory || []).map((item, idx) => (
                                <div key={`experience-view-${idx}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{item.designation || `Experience ${idx + 1}`}</p>
                                    <p className="mt-1 text-sm text-slate-600">{item.companyName || "N/A"}{item.department ? ` • ${item.department}` : ""}</p>
                                  </div>
                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                    {item.employmentPeriod || "N/A"}
                                  </span>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-2 [&_p]:rounded-2xl [&_p]:border [&_p]:border-slate-200 [&_p]:bg-slate-50/80 [&_p]:p-4 [&_p]:text-sm [&_p]:text-slate-700">
                                  <p>Company Name: {item.companyName || "N/A"}</p>
                                  <p>Company Business: {item.companyBusiness || "N/A"}</p>
                                  <p>Designation: {item.designation || "N/A"}</p>
                                  <p>Department: {item.department || "N/A"}</p>
                                  <p>Area of Expertise: {item.areaOfExpertise || "N/A"}</p>
                                  <p>Company Location: {item.companyLocation || "N/A"}</p>
                                  <p className="md:col-span-2">Responsibilities: {item.responsibilities || "N/A"}</p>
                                </div>
                                </div>
                            ))}
                            </div>
                        )
                        )}

                        {activeSection === "courseIntern" && (
                        isEditing ? (
                            <div className="space-y-4 [&_input]:w-full [&_input]:rounded-2xl [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white/90 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:shadow-sm [&_input]:transition [&_input]:placeholder:text-slate-400 [&_input]:focus:border-emerald-400 [&_input]:focus:ring-4 [&_input]:focus:ring-emerald-100 [&_select]:w-full [&_select]:rounded-2xl [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white/90 [&_select]:px-4 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:shadow-sm [&_select]:transition [&_select]:focus:border-emerald-400 [&_select]:focus:ring-4 [&_select]:focus:ring-emerald-100">
                            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4">
                              <p className="text-sm font-semibold text-slate-900">Your expertise</p>
                              <p className="mt-1 text-xs text-slate-600">Add comma-separated skills, for example: React, Node.js, MongoDB.</p>
                              <textarea className="mt-3 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" rows="3" placeholder="Skills" value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} />
                            </div>
                            {(form.coursesOrInternships || []).map((item, idx) => (
                                <div key={`course-intern-${idx}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900">{(item.type || 'Course/Intern') + ' ' + (idx + 1)}</p>
                                    <button
                                    type="button"
                                    onClick={() =>
                                        setForm((p) => ({
                                        ...p,
                                        coursesOrInternships: p.coursesOrInternships.filter((_, i) => i !== idx)
                                        }))
                                    }
                                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"
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
                                      onClear={() => setForm(p => ({
                                        ...p,
                                        coursesOrInternships: p.coursesOrInternships.map((ci, i) => i === idx ? { ...ci, certificateFile: null, certificate: "" } : ci)
                                      }))}
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
                                className={secondaryButtonClass}
                            >
                                + Add Course/Internship
                            </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {(form.coursesOrInternships || []).length === 0 ? <p className="text-sm text-slate-700">N/A</p> : null}
                            {(form.coursesOrInternships || []).map((item, idx) => (
                                <div key={`course-intern-view-${idx}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{item.name || `${item.type || "Course/Intern"} ${idx + 1}`}</p>
                                    <p className="mt-1 text-sm text-slate-600">{item.type || "N/A"}</p>
                                  </div>
                                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    item.type === "Internship"
                                      ? "bg-cyan-50 text-cyan-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}>
                                    {item.type || "N/A"}
                                  </span>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-2 [&_p]:rounded-2xl [&_p]:border [&_p]:border-slate-200 [&_p]:bg-slate-50/80 [&_p]:p-4 [&_p]:text-sm [&_p]:text-slate-700">
                                  <p>{item.type === 'Internship' ? "Company" : "Course Name"}: {item.name || "N/A"}</p>
                                  <p>Duration: {item.duration || "N/A"}</p>
                                  <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
                                    <span className="font-medium">Certificate:</span>{" "}
                                    {item.certificate ? (
                                      <a href={item.certificate} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                                        View
                                      </a>
                                    ) : item.certificateFile ? "File ready for upload" : "N/A"}
                                  </div>
                                </div>
                                </div>
                            ))}
                            </div>
                        )
                        )}
                    {isEditing && (
                        <div className="mt-6 flex gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                        <button type="button" onClick={() => saveDraft().then(() => setEditingSection(""))} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5">
                            Save
                        </button>
                        <button type="button" onClick={() => setEditingSection("")} className={secondaryButtonClass}>
                            Cancel
                        </button>
                        </div>
                    )}
                    {!sectionLoading ? (
                      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                        <button
                          type="button"
                          onClick={() => goToStep(activeStep - 1)}
                          disabled={activeStep === 0}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back
                        </button>
                        {isReviewStep ? (
                          <button
                            type="button"
                            onClick={onSubmitForPayment}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5"
                          >
                            Submit for review
                            <Check className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={saveAndNext}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5"
                          >
                            Save & Continue
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : null}
                          </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
};

export default PremiumProfileForm;
