import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  FileText,
  MapPin,
  Sparkles,
  User
} from "lucide-react";
import api from "../api/client";
import ExpertiseDocumentCarousel from "../components/ExpertiseDocumentCarousel";
import { Skeleton, SkeletonText } from "../components/loaders/Skeleton";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const listOrFallback = (arr) => (Array.isArray(arr) ? arr : []);
const toAbsoluteUrl = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("data:")) return value;
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
  <div className={`rounded-3xl border-0 bg-white p-3 shadow-none sm:rounded-2xl sm:border sm:border-slate-200 sm:p-5 sm:shadow-sm ${className}`}>
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
  <div className="rounded-2xl bg-slate-50 p-3 sm:rounded-xl sm:border sm:border-slate-200 sm:p-4">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50/80 px-3 py-2 sm:rounded-lg sm:border sm:border-slate-200 sm:bg-white/80">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-800">{textOrNA(value)}</p>
  </div>
);

const Badge = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-50 text-slate-700 md:border md:border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 md:border md:border-emerald-200",
    cyan: "bg-cyan-50 text-cyan-700 md:border md:border-cyan-200",
    amber: "bg-amber-50 text-amber-700 md:border md:border-amber-200"
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium md:border ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
};

const EmptyState = ({ title, text }) => (
  <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center sm:border sm:border-dashed sm:border-slate-300">
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    <p className="mt-1 text-xs text-slate-500">{text}</p>
  </div>
);

const MiniStat = ({ label, value, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-50 text-slate-900 md:border md:border-slate-200",
    emerald: "bg-emerald-50 text-emerald-900 md:border md:border-emerald-200",
    cyan: "bg-cyan-50 text-cyan-900 md:border md:border-cyan-200",
    amber: "bg-amber-50 text-amber-900 md:border md:border-amber-200"
  };

  return (
    <div className={`rounded-2xl px-3 py-2 sm:rounded-xl sm:px-4 sm:py-3 md:border ${tones[tone] || tones.slate}`}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
};

const ExpertiseDetailsSkeleton = () => (
  <section className="mx-[-1rem] min-h-[60vh] space-y-4 bg-slate-50 px-4 py-2 sm:mx-0 sm:space-y-6 sm:rounded-3xl sm:border sm:border-slate-200 sm:bg-white sm:p-6 sm:shadow-sm lg:p-8">
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl sm:w-48" />
    </div>

    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-50 p-3 sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:p-4">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        <div className="rounded-3xl bg-slate-50 p-3 shadow-none sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:p-4 sm:shadow-sm">
          <Skeleton className="h-6 w-40" />
          <SkeletonText lines={4} className="mt-4" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-50 p-3 shadow-none sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:p-4 sm:shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    </div>

    <div className="rounded-3xl bg-slate-50 p-3 shadow-none sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:p-4 sm:shadow-sm">
      <Skeleton className="h-6 w-44" />
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={`personal-skeleton-${index}`} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  </section>
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
  const courses = coursesOrInternships.filter((item) => String(item?.type || "").toLowerCase().includes("course"));
  const internships = coursesOrInternships.filter((item) => String(item?.type || "").toLowerCase().includes("intern"));
  const otherLearningItems = coursesOrInternships.filter((item) => {
    const type = String(item?.type || "").toLowerCase();
    return !type.includes("course") && !type.includes("intern");
  });

  const experienceYears =
    toNumberOrZero(profile?.totalExperienceYears) || toNumberOrZero(seeker?.experienceYears);
  const expectedSalary =
    toNumberOrZero(profile?.expectedSalary) || toNumberOrZero(seeker?.expectedSalary);
  const totalCompanies = getTotalCompanies(profile);

  const liveProjectCount = projects.filter((project) => hasText(project?.link)).length;
  const explainedProjectCount = projects.filter((project) => hasText(project?.description)).length;
  const directMailEmail = String(seeker?.email || profile?.primaryEmail || "").trim();
  const directMailUrl = useMemo(() => {
    if (!directMailEmail) return "";
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: directMailEmail,
      su: `Hiring discussion with ${seeker?.name || "candidate"}`,
      body: `Hello ${seeker?.name || "there"},\n\nI would like to discuss a hiring opportunity with you.\n\nRegards`
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }, [directMailEmail, seeker?.name]);

  if (loading) {
    return <ExpertiseDetailsSkeleton />;
  }

  if (!profile) {
    return (
      <section className="rounded-2xl bg-red-50 p-5 text-sm text-red-700 sm:border sm:border-red-200">
        {message || "Expertise profile not found."}
      </section>
    );
  }

  return (
    <section className="relative isolate mx-[-1rem] overflow-hidden bg-slate-50 sm:mx-0 sm:rounded-3xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-[0_24px_80px_-30px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute -left-24 top-0 h-60 w-60 rounded-full bg-emerald-100 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-cyan-100 blur-3xl" />

      <div className="relative space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:border sm:border-emerald-200">
              <Sparkles size={14} /> Employer Ready Profile
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">Expertise Details</h2>
            <p className="text-sm text-slate-600">Complete professional overview with verified profile inputs.</p>
          </div>

          <Link
            to="/appoint-expertise"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-100 sm:w-auto sm:rounded-md sm:border sm:ring-0"
          >
            <ArrowLeft size={16} /> Back to Appoint Expertise
          </Link>
        </div>

        <section className="rounded-3xl border-0 bg-white p-3 shadow-none sm:border sm:border-slate-200 sm:bg-gradient-to-br sm:from-white sm:via-slate-50 sm:to-emerald-50/40 sm:p-4 sm:shadow-sm md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <div className="h-20 w-20 overflow-hidden rounded-3xl bg-slate-100 ring-2 ring-slate-200 sm:h-24 sm:w-24">
                  {seekerImage ? (
                    <img src={seekerImage} alt={seeker?.name || "Candidate"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-600">
                      {(seeker?.name || "C").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Decision Header</p>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{textOrNA(seeker?.name)}</h1>
                  <p className="mt-2 text-base font-medium text-slate-700">
                    {textOrNA(profile?.preferredRole || seeker?.jobRole || seeker?.currentPosition || seeker?.jobCategory)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200 sm:border sm:shadow-none sm:ring-0">
                      <MapPin size={14} /> {textOrNA(profile?.location || seeker?.location)}
                    </span>
                    <Badge tone="emerald">{textOrNA(seeker?.jobCategory)}</Badge>
                    {hasText(profile?.headline || seeker?.currentPosition) ? <Badge tone="cyan">{textOrNA(profile?.headline || seeker?.currentPosition)}</Badge> : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard label="Expected Salary" value={`${expectedSalary} BDT`} />
                <StatCard label="Experience" value={`${experienceYears} years`} />
                <StatCard label="Projects" value={projects.length} />
                <StatCard label="Companies" value={totalCompanies} />
              </div>

              <div className="rounded-3xl bg-slate-50 p-3 sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Professional Summary</p>
                    <p className="mt-1 text-xs text-slate-500">What this candidate can do and how they create value.</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <DetailItem label="Headline" value={profile?.headline || seeker?.currentPosition} />
                    <DetailItem label="Preferred Role" value={profile?.preferredRole || seeker?.jobRole} />
                    <DetailItem label="Job Category" value={seeker?.jobCategory} />
                    <DetailItem label="Location" value={profile?.location || seeker?.location} />
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {textOrNA(profile?.summary || seeker?.bio)}
                </p>
              </div>

              <SectionCard icon={Sparkles} title="Hiring Snapshot" hint="Fast signals for shortlist and evaluation">
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  <MiniStat label="Skills Listed" value={skills.length} tone="amber" />
                  <MiniStat label="Live Demos" value={liveProjectCount} tone="emerald" />
                  <MiniStat label="Portfolio Signals" value={explainedProjectCount} tone="cyan" />
                  <MiniStat label="Academic Records" value={academics.length} tone="slate" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.length === 0 ? <span className="text-sm text-slate-500">No skills listed</span> : null}
                  {skills.slice(0, 12).map((skill) => (
                    <span key={skill} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </SectionCard>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl bg-slate-50 p-3 sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:p-4">
                <p className="text-sm font-semibold text-slate-900">Documents & Proof</p>
                <p className="mt-1 text-xs text-slate-500">Resume and supporting materials for verification.</p>
                <div className="mt-4">
                  <ExpertiseDocumentCarousel documents={documentSlides} heightClass="h-48 sm:h-56" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {documentSlides.length === 0 ? <span className="text-xs text-slate-500">No documents uploaded</span> : null}
                  {documentSlides.map((doc, idx) => (
                    <a
                      key={`${doc.label}-${idx}`}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 sm:border sm:shadow-none sm:ring-0"
                    >
                      {doc.label}
                    </a>
                  ))}
                </div>
              </div>

              <SectionCard icon={Sparkles} title="Hiring Communication Flow" hint="Start structured communication for appointment and hiring">
                <div className="space-y-3">
                  <Link
                    to={`/messages/${seeker?._id || seeker?.id || ""}`}
                    state={{
                      candidateName: seeker?.name || "",
                      candidateRole: profile?.preferredRole || seeker?.jobRole || seeker?.currentPosition || "",
                      candidateEmail: seeker?.email || profile?.primaryEmail || "",
                      expertiseProfileId: id
                    }}
                    className="flex flex-col gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100 transition hover:bg-emerald-50/60 sm:flex-row sm:items-start sm:justify-between sm:border sm:border-slate-200 sm:bg-slate-50 sm:shadow-none sm:ring-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Message</p>
                      <p className="mt-1 text-xs text-slate-500">Open the direct messaging workspace with file sharing support.</p>
                    </div>
                    <span className="inline-flex w-full justify-center rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white sm:w-auto sm:py-1">Open</span>
                  </Link>

                  <Link
                    to={`/hire-invite/${id}`}
                    state={{ candidateName: seeker?.name || "", candidateRole: profile?.preferredRole || seeker?.jobRole || seeker?.currentPosition || "", candidateEmail: seeker?.email || profile?.primaryEmail || "" }}
                    className="flex flex-col gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100 transition hover:bg-cyan-50/60 sm:flex-row sm:items-start sm:justify-between sm:border sm:border-slate-200 sm:bg-slate-50 sm:shadow-none sm:ring-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Invite for Hire</p>
                      <p className="mt-1 text-xs text-slate-500">Send a structured hiring invite with budget, scope, and start timeline.</p>
                    </div>
                    <span className="inline-flex w-full justify-center rounded-full bg-cyan-600 px-3 py-2 text-xs font-semibold text-white sm:w-auto sm:py-1">Invite</span>
                  </Link>

                  <a
                    href={directMailUrl || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex flex-col gap-3 rounded-2xl px-3 py-3 shadow-sm ring-1 ring-slate-100 transition sm:flex-row sm:items-start sm:justify-between sm:border sm:px-4 sm:shadow-none sm:ring-0 ${
                      directMailUrl
                        ? "bg-white hover:bg-amber-50/60 sm:border-slate-200 sm:bg-slate-50"
                        : "pointer-events-none bg-slate-100 opacity-60 sm:border-slate-200"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Direct Mail</p>
                      <p className="mt-1 text-xs text-slate-500">Prepare a formal outreach email from the same hiring communication workspace.</p>
                    </div>
                    <span className="inline-flex w-full justify-center rounded-full bg-amber-600 px-3 py-2 text-xs font-semibold text-white sm:w-auto sm:py-1">Compose</span>
                  </a>
                </div>
              </SectionCard>
            </aside>
          </div>
        </section>

        <div className="space-y-6">
          <SectionCard
            icon={BookOpen}
            title="Education/Train"
            hint={`Academic and training history${academics.length ? ` · ${academics.length} record${academics.length > 1 ? "s" : ""}` : ""}`}
            className=""
          >
            <div className="space-y-4">
              {academics.length === 0 ? (
                <EmptyState title="No academic history added yet" text="Education or training details will appear here once provided." />
              ) : null}

              {academics.length > 0 ? (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <MiniStat label="Academic Records" value={academics.length} tone="emerald" />
                  <MiniStat
                    label="Foreign Institutes"
                    value={academics.filter((item) => item?.isForeignInstitute).length}
                    tone="cyan"
                  />
                  <MiniStat
                    label="Latest Passing Year"
                    value={academics.map((item) => String(item?.yearOfPassing || "").trim()).filter(Boolean)[0] || "N/A"}
                    tone="slate"
                  />
                </div>
              ) : null}

              {academics.map((item, idx) => (
                <div
                  key={`edu-${idx}`}
                  className="border-b-0 pb-4 last:pb-0 sm:border-b sm:border-slate-200 sm:last:border-b-0"
                >
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

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniStat label="Education Level" value={textOrNA(item?.levelOfEducation)} tone="emerald" />
                    <MiniStat label="Major / Group" value={textOrNA(item?.concentrationMajorGroup)} tone="cyan" />
                    <MiniStat label="Result" value={textOrNA(item?.result)} tone="slate" />
                    <MiniStat label="Duration" value={textOrNA(item?.durationYears)} tone="amber" />
                  </div>

                  {hasText(item?.achievementNote) ? (
                    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Achievement Note</p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{item.achievementNote}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={Briefcase}
            title="Employment"
            hint={`Work and responsibility timeline${experiences.length ? ` · ${experiences.length} role${experiences.length > 1 ? "s" : ""}` : ""}`}
            className=""
          >
            <div className="space-y-4">
              {experiences.length === 0 ? (
                <EmptyState title="No employment history added yet" text="Experience entries will appear here once the candidate adds them." />
              ) : null}

              {experiences.length > 0 ? (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <MiniStat label="Roles Listed" value={experiences.length} tone="cyan" />
                  <MiniStat label="Companies" value={totalCompanies} tone="emerald" />
                  <MiniStat label="Total Experience" value={`${experienceYears} years`} tone="slate" />
                </div>
              ) : null}

              {experiences.map((item, idx) => (
                <div
                  key={`exp-${idx}`}
                  className="border-b-0 pb-4 last:pb-0 sm:border-b sm:border-slate-200 sm:last:border-b-0"
                >
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

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniStat label="Department" value={textOrNA(item?.department)} tone="slate" />
                    <MiniStat label="Business" value={textOrNA(item?.companyBusiness)} tone="cyan" />
                    <MiniStat label="Location" value={textOrNA(item?.companyLocation)} tone="amber" />
                    <MiniStat label="Expertise" value={textOrNA(item?.areaOfExpertise)} tone="emerald" />
                  </div>

                  {hasText(item?.responsibilities) ? (
                    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Responsibilities</p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{item.responsibilities}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={FileText}
            title="Course/Intern"
            hint="Courses, internships and certificate references"
            className=""
          >
            <div className="grid gap-4 lg:grid-cols-2">
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

              <div className="space-y-4 text-sm text-slate-700">
                {coursesOrInternships.length === 0 ? (
                  <EmptyState title="No course or internship data" text="Course, internship, and certificate references will appear here." />
                ) : null}

                {courses.length > 0 ? (
                  <div className="rounded-2xl bg-emerald-50/60 p-3 sm:border sm:border-emerald-200 sm:bg-emerald-50/40 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Courses</p>
                        <p className="text-sm text-slate-600">Structured learning, upskilling, and technical coursework.</p>
                      </div>
                      <Badge tone="emerald">{courses.length}</Badge>
                    </div>

                    <div className="space-y-3">
                      {courses.map((item, idx) => (
                        <div key={`course-${idx}`} className="rounded-xl bg-white p-3 shadow-sm sm:border sm:border-emerald-100 sm:shadow-none">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{textOrNA(item?.name || `Course ${idx + 1}`)}</p>
                              <p className="mt-1 text-xs text-slate-500">Duration: {textOrNA(item?.duration)}</p>
                            </div>
                            {item?.certificate ? (
                              <a href={toAbsoluteUrl(item.certificate)} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                                Certificate
                              </a>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {internships.length > 0 ? (
                  <div className="rounded-2xl bg-cyan-50/60 p-3 sm:border sm:border-cyan-200 sm:bg-cyan-50/40 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Internships</p>
                        <p className="text-sm text-slate-600">Hands-on workplace exposure and practical experience.</p>
                      </div>
                      <Badge tone="cyan">{internships.length}</Badge>
                    </div>

                    <div className="space-y-3">
                      {internships.map((item, idx) => (
                        <div key={`intern-${idx}`} className="rounded-xl bg-white p-3 shadow-sm sm:border sm:border-cyan-100 sm:shadow-none">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{textOrNA(item?.name || `Internship ${idx + 1}`)}</p>
                              <p className="mt-1 text-xs text-slate-500">Duration: {textOrNA(item?.duration)}</p>
                            </div>
                            {item?.certificate ? (
                              <a href={toAbsoluteUrl(item.certificate)} target="_blank" rel="noreferrer" className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-100">
                                Letter
                              </a>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {otherLearningItems.length > 0 ? (
                  <div className="rounded-2xl bg-slate-100 p-3 sm:border sm:border-slate-200 sm:bg-slate-50 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">Other Learning</p>
                        <p className="text-sm text-slate-600">Additional learning records shared by the candidate.</p>
                      </div>
                      <Badge tone="slate">{otherLearningItems.length}</Badge>
                    </div>

                    <div className="space-y-3">
                      {otherLearningItems.map((item, idx) => (
                        <div key={`other-learning-${idx}`} className="rounded-xl bg-white p-3 shadow-sm sm:border sm:border-slate-200 sm:shadow-none">
                          <p className="font-semibold text-slate-900">{textOrNA(item?.type)}: {textOrNA(item?.name)}</p>
                          <p className="mt-1 text-xs text-slate-500">Duration: {textOrNA(item?.duration)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Briefcase}
            title="Projects"
            hint="Projects shared from seeker resume"
            className=""
          >
            {projects.length === 0 ? (
              <EmptyState title="No projects shared yet" text="Portfolio projects and work samples will appear here once the candidate adds them." />
            ) : (
              <>
                <div className="mb-4 grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <MiniStat label="Projects" value={projects.length} tone="cyan" />
                  <MiniStat label="Live Demos" value={liveProjectCount} tone="emerald" />
                  <MiniStat label="Portfolio Signals" value={explainedProjectCount} tone="slate" />
                </div>

                <div className="space-y-4">
                  {projects.map((project, idx) => (
                    <div key={`project-${idx}`} className="border-b-0 pb-4 text-sm text-slate-700 last:pb-0 sm:border-b sm:border-slate-200 sm:last:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Project {idx + 1}</p>
                          <p className="mt-1 font-semibold text-slate-900">{textOrNA(project?.title || "Project")}</p>
                        </div>
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

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone="cyan">{hasText(project?.link) ? "Service Demo Ready" : "Case Study Only"}</Badge>
                        <Badge tone="emerald">{hasText(project?.description) ? "Impact Explained" : "Summary Missing"}</Badge>
                      </div>

                      <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Project Value</p>
                        <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">{textOrNA(project?.description)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
};

export default AppointExpertiseDetails;
