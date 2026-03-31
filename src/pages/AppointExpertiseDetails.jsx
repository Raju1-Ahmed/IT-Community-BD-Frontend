import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  FileText,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User
} from "lucide-react";
import api from "../api/client";
import ExpertiseDocumentCarousel from "../components/ExpertiseDocumentCarousel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const listOrFallback = (arr) => (Array.isArray(arr) ? arr : []);
const toAbsoluteUrl = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("http")) return value;
  return `${BACKEND_ORIGIN}${value}`;
};

const textOrNA = (value) => {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : "N/A";
};

const hasText = (value) => String(value ?? "").trim().length > 0;

const toNumberOrZero = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getTotalCompanies = (profile) => {
  const entries = listOrFallback(profile?.experienceHistory);
  const uniqueCompanies = new Set(
    entries
      .map((item) => String(item?.companyName || "").trim())
      .filter(Boolean)
  );

  return uniqueCompanies.size > 0 ? uniqueCompanies.size : entries.length;
};

const buildDocumentSlides = (profile) => {
  const slides = [];

  if (profile?.cvUrl) slides.push({ label: "CV", url: toAbsoluteUrl(profile.cvUrl) });
  if (profile?.experienceLetterUrl) slides.push({ label: "Experience Letter", url: toAbsoluteUrl(profile.experienceLetterUrl) });
  if (profile?.companyIdCardUrl) slides.push({ label: "Company ID Card", url: toAbsoluteUrl(profile.companyIdCardUrl) });
  if (profile?.additionalDocUrl) slides.push({ label: "Additional Document", url: toAbsoluteUrl(profile.additionalDocUrl) });

  listOrFallback(profile?.coursesOrInternships).forEach((item, idx) => {
    if (!item?.certificate) return;
    slides.push({
      label: `${item?.type || "Course/Intern"} Certificate ${idx + 1}`,
      url: toAbsoluteUrl(item.certificate)
    });
  });

  return slides;
};

const SectionCard = ({ icon: Icon, title, hint, children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
    <div className="mb-3 flex items-start gap-3">
      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
    {children}
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-800">{textOrNA(value)}</p>
  </div>
);

const Badge = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700"
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
};

const EmptyState = ({ title, text }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    <p className="mt-1 text-xs text-slate-500">{text}</p>
  </div>
);

const AppointExpertiseDetails = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/premium/expertise/${id}`);
        setProfile(data.profile || null);
        setMessage("");
      } catch (error) {
        setMessage(error?.response?.data?.message || "Failed to load expertise details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const seeker = profile?.seeker || {};
  const documentSlides = useMemo(() => buildDocumentSlides(profile), [profile]);
  const seekerImage = seeker?.profileImage ? toAbsoluteUrl(seeker.profileImage) : "";
  const skills = [
    ...new Set(
      [...listOrFallback(profile?.skills), ...listOrFallback(seeker?.skills)]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    )
  ];
  const projects = listOrFallback(seeker?.projects);
  const academics = listOrFallback(profile?.academics);
  const experiences = listOrFallback(profile?.experienceHistory);
  const coursesOrInternships = listOrFallback(profile?.coursesOrInternships);

  const experienceYears =
    toNumberOrZero(profile?.totalExperienceYears) || toNumberOrZero(seeker?.experienceYears);
  const expectedSalary =
    toNumberOrZero(profile?.expectedSalary) || toNumberOrZero(seeker?.expectedSalary);
  const totalCompanies = getTotalCompanies(profile);

  const phoneRaw = String(profile?.primaryMobile || seeker?.phone || "").trim();
  const emailRaw = String(profile?.primaryEmail || seeker?.email || "").trim();

  const personalInfo = [
    { label: "Headline", value: profile?.headline || seeker?.currentPosition },
    { label: "Preferred Role", value: profile?.preferredRole || seeker?.jobRole },
    { label: "Job Category", value: seeker?.jobCategory },
    { label: "Location", value: profile?.location || seeker?.location },
    { label: "First Name", value: profile?.firstName },
    { label: "Last Name", value: profile?.lastName },
    { label: "Father's Name", value: profile?.fatherName },
    { label: "Mother's Name", value: profile?.motherName },
    { label: "Date of Birth", value: profile?.dateOfBirth },
    { label: "Gender", value: profile?.gender },
    { label: "Religion", value: profile?.religion },
    { label: "Marital Status", value: profile?.maritalStatus },
    { label: "Division", value: profile?.divisionName },
    { label: "District", value: profile?.districtName },
    { label: "Thana", value: profile?.upazilaName },
    { label: "Union", value: profile?.unionName },
    { label: "National ID", value: profile?.nationalId },
    { label: "Primary Mobile", value: profile?.primaryMobile || seeker?.phone },
    { label: "Secondary Mobile", value: profile?.secondaryMobile },
    { label: "Emergency Contact", value: profile?.emergencyContact },
    { label: "Primary Email", value: profile?.primaryEmail || seeker?.email },
    { label: "Alternate Email", value: profile?.alternateEmail },
    { label: "Blood Group", value: profile?.bloodGroup },
    { label: "Height (meters)", value: profile?.heightMeters },
    { label: "Weight (kg)", value: profile?.weightKg }
  ];

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3 animate-pulse">
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="h-4 w-80 rounded bg-slate-200" />
          <div className="h-64 w-full rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {message || "Expertise profile not found."}
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_-30px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute -left-24 top-0 h-60 w-60 rounded-full bg-emerald-100 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-cyan-100 blur-3xl" />

      <div className="relative space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles size={14} /> Employer Ready Profile
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Expertise Details</h2>
            <p className="text-sm text-slate-600">Complete professional overview with verified profile inputs.</p>
          </div>

          <Link
            to="/appoint-expertise"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            <ArrowLeft size={16} /> Back to Appoint Expertise
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <div className="space-y-4 xl:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
              <ExpertiseDocumentCarousel documents={documentSlides} heightClass="h-72" />
              <div className="mt-3 flex flex-wrap gap-2">
                {documentSlides.length === 0 ? <span className="text-xs text-slate-500">No documents uploaded</span> : null}
                {documentSlides.map((doc, idx) => (
                  <a
                    key={`${doc.label}-${idx}`}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {doc.label}
                  </a>
                ))}
              </div>
            </div>

            <SectionCard icon={FileText} title="Professional Summary" hint="From expert profile">
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {textOrNA(profile?.summary || seeker?.bio)}
              </p>
            </SectionCard>
          </div>

          <aside className="space-y-4 xl:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-slate-200">
                  {seekerImage ? (
                    <img src={seekerImage} alt={seeker?.name || "Candidate"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-600">
                      {(seeker?.name || "C").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{textOrNA(seeker?.name)}</h3>
                  <p className="text-sm text-slate-700">
                    {textOrNA(seeker?.jobCategory || seeker?.jobRole || profile?.preferredRole || seeker?.currentPosition)}
                  </p>
                  <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} /> {textOrNA(profile?.location || seeker?.location)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <a
                  href={phoneRaw ? `tel:${phoneRaw}` : undefined}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    phoneRaw
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "pointer-events-none border border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  <Phone size={14} /> {phoneRaw || "No phone"}
                </a>
                <a
                  href={emailRaw ? `mailto:${emailRaw}` : undefined}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    emailRaw
                      ? "border border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                      : "pointer-events-none border border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  <Mail size={14} /> {emailRaw || "No email"}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Expected Salary" value={`${expectedSalary} BDT`} />
              <StatCard label="Experience" value={`${experienceYears} years`} />
              <StatCard label="Skills" value={skills.length} />
              <StatCard label="Companies" value={totalCompanies} />
            </div>
          </aside>
        </div>

        <SectionCard
          icon={User}
          title="Personal Information"
          hint="Personal data collected from expert-profile form"
        >
          <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            {personalInfo.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-1 font-medium text-slate-800">{textOrNA(item.value)}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            icon={BookOpen}
            title="Education/Train"
            hint={`Academic and training history${academics.length ? ` · ${academics.length} record${academics.length > 1 ? "s" : ""}` : ""}`}
          >
            <div className="space-y-4">
              {academics.length === 0 ? (
                <EmptyState title="No academic history added yet" text="Education or training details will appear here once provided." />
              ) : null}

              {academics.map((item, idx) => (
                <div
                  key={`edu-${idx}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/40"
                >
                  <div className="border-b border-slate-200 bg-white/80 px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Academic {idx + 1}</p>
                        <h4 className="mt-1 text-base font-semibold text-slate-900">
                          {textOrNA(item?.examDegreeTitle || item?.levelOfEducation)}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">{textOrNA(item?.instituteName)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge tone="emerald">{item?.isForeignInstitute ? "Foreign Institute" : "Local Institute"}</Badge>
                        {hasText(item?.yearOfPassing) ? <Badge tone="cyan">Passing Year: {item.yearOfPassing}</Badge> : null}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <DetailItem label="Level of Education" value={item?.levelOfEducation} />
                      <DetailItem label="Concentration / Major / Group" value={item?.concentrationMajorGroup} />
                      <DetailItem label="Result" value={item?.result} />
                      <DetailItem label="Duration (Years)" value={item?.durationYears} />
                    </div>

                    {hasText(item?.achievementNote) ? (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Achievement Note</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{item.achievementNote}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={Briefcase}
            title="Employment"
            hint={`Work and responsibility timeline${experiences.length ? ` · ${experiences.length} role${experiences.length > 1 ? "s" : ""}` : ""}`}
          >
            <div className="space-y-4">
              {experiences.length === 0 ? (
                <EmptyState title="No employment history added yet" text="Experience entries will appear here once the candidate adds them." />
              ) : null}

              {experiences.map((item, idx) => (
                <div
                  key={`exp-${idx}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/60 to-cyan-50/40"
                >
                  <div className="border-b border-slate-200 bg-white/80 px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Experience {idx + 1}</p>
                        <h4 className="mt-1 text-base font-semibold text-slate-900">
                          {textOrNA(item?.designation || item?.role)}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">{textOrNA(item?.companyName)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {hasText(item?.employmentPeriod) ? <Badge tone="cyan">{item.employmentPeriod}</Badge> : null}
                        {hasText(item?.areaOfExpertise) ? <Badge tone="emerald">{item.areaOfExpertise}</Badge> : null}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <DetailItem label="Company Business" value={item?.companyBusiness} />
                      <DetailItem label="Department" value={item?.department} />
                      <DetailItem label="Company Location" value={item?.companyLocation} />
                      <DetailItem label="Area of Expertise" value={item?.areaOfExpertise} />
                    </div>

                    {hasText(item?.responsibilities) ? (
                      <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Responsibilities</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{item.responsibilities}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={FileText}
            title="Course/Intern"
            hint="Courses, internships and certificate references"
            className="xl:col-span-2"
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-900">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 ? <span className="text-sm text-slate-500">No skills listed</span> : null}
                  {skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                      {skill}
                    </span>
                  ))}
                </div>

                {listOrFallback(profile?.skillDetails).length > 0 ? (
                  <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                    <p className="mb-2 font-semibold text-slate-900">Skill Details</p>
                    {listOrFallback(profile?.skillDetails).map((item, idx) => (
                      <p key={`skill-detail-${idx}`}>
                        {textOrNA(item?.skill)} {item?.learnedBy ? `(${textOrNA(item.learnedBy)})` : ""}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                {coursesOrInternships.length === 0 ? (
                  <EmptyState title="No course or internship data" text="Course, internship, and certificate references will appear here." />
                ) : null}
                {coursesOrInternships.map((item, idx) => (
                  <div key={`ci-${idx}`} className="rounded-xl border border-slate-200 p-3">
                    <p className="mb-2 font-semibold text-slate-900">
                      {textOrNA(item?.type)} {idx + 1}
                    </p>
                    <p>Name: {textOrNA(item?.name)}</p>
                    <p>Duration: {textOrNA(item?.duration)}</p>
                    <p>
                      Certificate: {item?.certificate ? (
                        <a href={toAbsoluteUrl(item.certificate)} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                          View
                        </a>
                      ) : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {projects.length > 0 ? (
            <SectionCard
              icon={Briefcase}
              title="Projects"
              hint="Projects shared from seeker resume"
              className="xl:col-span-2"
            >
              <div className="grid gap-3 md:grid-cols-2">
                {projects.map((project, idx) => (
                  <div key={`project-${idx}`} className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-900">
                        {idx + 1}. {textOrNA(project?.title || "Project")}
                      </p>
                      {hasText(project?.link) ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-100"
                        >
                          Demo
                        </a>
                      ) : null}
                    </div>

                    <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">
                      {textOrNA(project?.description)}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default AppointExpertiseDetails;
