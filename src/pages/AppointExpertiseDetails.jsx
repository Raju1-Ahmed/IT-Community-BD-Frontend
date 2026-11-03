import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Building2, CheckCircle2, ChevronLeft, ChevronRight, Download, ExternalLink, GraduationCap, MapPin, MessageCircle, X } from "lucide-react";
import api from "../api/client";
import { Skeleton, SkeletonText } from "../components/loaders/Skeleton";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const listOrFallback = (value) => (Array.isArray(value) ? value : []);
const hasText = (value) => String(value ?? "").trim().length > 0;
const textOrNA = (value) => (hasText(value) ? String(value).trim() : "N/A");
const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const toAbsoluteUrl = (url) => { const value = String(url || "").trim(); if (!value) return ""; return value.startsWith("http") || value.startsWith("data:") ? value : `${BACKEND_ORIGIN}${value}`; };
const isImageDocument = (url = "") => /^data:image\//i.test(url) || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);

const buildExperienceDocumentItems = (experience, profile, experienceIndex) => [
  ["Company Clearance", experience?.companyClearanceUrl || (experienceIndex === 0 ? profile?.cvUrl : ""), "Employment proof"],
  ["Company ID Card", experience?.companyIdCardUrl || (experienceIndex === 0 ? profile?.experienceLetterUrl : ""), "Identity proof"],
  ["Appointment Letter", experience?.appointmentLetterUrl || (experienceIndex === 0 ? profile?.companyIdCardUrl : ""), "Employment proof"]
].filter(([, url]) => url).map(([label, url, type]) => ({ label, url: toAbsoluteUrl(url), type }));

const getTotalCompanies = (profile) => {
  const entries = listOrFallback(profile?.experienceHistory);
  const companies = new Set(entries.map((item) => String(item?.companyName || item?.company || "").trim()).filter(Boolean));
  return companies.size || entries.length;
};

const getExperienceDate = (item) => {
  const value = item?.startDate || item?.joiningDate || item?.from || item?.endDate || item?.endingDate || item?.to;
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const Section = ({ icon: Icon, eyebrow, title, hint, children }) => (
  <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6 sm:ring-0 md:border md:border-slate-200">
    <div className="mb-5 flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon size={19} /></div><div>{eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p> : null}<h2 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>{hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}</div></div>
    {children}
  </section>
);

const Metric = ({ label, value, tone = "slate" }) => {
  const tones = { slate: "bg-slate-50 text-slate-900", emerald: "bg-emerald-50 text-emerald-900", cyan: "bg-cyan-50 text-cyan-900", amber: "bg-amber-50 text-amber-900" };
  return <div className={`rounded-2xl p-3 sm:p-4 ${tones[tone] || tones.slate}`}><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 text-base font-bold sm:text-lg">{value}</p></div>;
};

const Tag = ({ children }) => <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">{children}</span>;

const ExperienceDocumentSlider = ({ experience, profile, experienceIndex, onPreview }) => {
  const documents = buildExperienceDocumentItems(experience, profile, experienceIndex);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    setActiveIndex(0);
  }, [experience?.companyClearanceUrl, experience?.companyIdCardUrl, experience?.appointmentLetterUrl, profile?.cvUrl, profile?.experienceLetterUrl, profile?.companyIdCardUrl]);
  useEffect(() => {
    if (documents.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % documents.length), 3500);
    return () => window.clearInterval(timer);
  }, [documents.length]);
  if (!documents.length) return null;

  const document = documents[activeIndex];
  const previous = (event) => { event.stopPropagation(); setActiveIndex((index) => (index - 1 + documents.length) % documents.length); };
  const next = (event) => { event.stopPropagation(); setActiveIndex((index) => (index + 1) % documents.length); };

  return <div className="group relative w-[7.5rem] shrink-0">
    <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">{document.label}</p>
    <div className="relative h-[4.25rem] w-[7.5rem] overflow-hidden rounded-lg bg-slate-100 shadow-sm ring-1 ring-slate-200 transition hover:ring-emerald-400">
      <div
      role="button"
      tabIndex={0}
      aria-label={`Preview ${document.label}`}
      onClick={() => onPreview(document)}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onPreview(document); }}
      className="h-full w-full cursor-pointer overflow-hidden"
    >
      <div className="flex h-full overflow-hidden transition-transform duration-500 ease-out" style={{ width: `${documents.length * 100}%`, transform: `translateX(-${activeIndex * (100 / documents.length)}%)` }}>
        {documents.map((item) => <div key={item.label} className="h-full shrink-0 overflow-hidden" style={{ width: `${100 / documents.length}%` }}><div className="h-full w-full overflow-hidden">{isImageDocument(item.url) ? <img src={item.url} alt="" className="h-full w-full object-cover" /> : <iframe title={item.label} src={item.url} tabIndex={-1} className="pointer-events-none h-full w-full border-0 bg-white" />}</div></div>)}
      </div>
      </div>
      {documents.length > 1 ? <><button type="button" onClick={previous} className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/65 p-0.5 text-white opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100" aria-label="Previous document"><ChevronLeft size={13} /></button><button type="button" onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/65 p-0.5 text-white opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100" aria-label="Next document"><ChevronRight size={13} /></button></> : null}
    </div>
  </div>;
};

const SkeletonSection = ({ rows = 3, tall = false }) => (
  <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6 sm:ring-0 md:border md:border-slate-200">
    <div className="mb-5 flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-2xl" /><div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-6 w-44" /></div></div>
    {tall ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{Array.from({ length: rows }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}</div> : <div className="space-y-3">{Array.from({ length: rows }).map((_, index) => <Skeleton key={index} className={index === rows - 1 ? "h-20 rounded-2xl" : "h-12 rounded-2xl"} />)}</div>}
  </div>
);

const DetailsSkeleton = () => (
  <section className="mx-[-1rem] min-h-[70vh] space-y-5 bg-slate-50 px-4 py-4 sm:mx-0 sm:rounded-3xl sm:border sm:border-slate-200 sm:bg-white sm:p-6">
    <div className="flex items-center justify-between gap-3"><div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-48 rounded-full" /></div><Skeleton className="h-10 w-32 rounded-full" /></div>
    <div className="rounded-3xl bg-white p-4 shadow-sm sm:border sm:border-slate-200 sm:p-6"><div className="flex items-center gap-4"><Skeleton className="h-24 w-24 rounded-3xl" /><div className="flex-1 space-y-3"><Skeleton className="h-8 w-52" /><Skeleton className="h-4 w-64 max-w-full" /><Skeleton className="h-3 w-40" /></div></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 rounded-2xl" />)}</div><SkeletonText lines={3} className="mt-5" /></div>
    <SkeletonSection rows={4} />
    <SkeletonSection rows={2} />
    <SkeletonSection rows={4} tall />
    <SkeletonSection rows={3} />
    <Skeleton className="h-14 w-full rounded-2xl" />
  </section>
);

const DocumentModal = ({ document, onClose }) => document ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label={document.label}><div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"><div><p className="text-sm font-bold text-slate-900">{document.label}</p><p className="text-xs text-slate-500">{document.type}</p></div><button type="button" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" aria-label="Close preview"><X size={18} /></button></div><div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3 sm:p-5">{isImageDocument(document.url) ? <img src={document.url} alt={document.label} className="mx-auto max-h-[70vh] max-w-full rounded-xl object-contain" /> : <iframe title={document.label} src={document.url} className="h-[70vh] min-h-[420px] w-full rounded-xl bg-white" />}</div><div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3"><a href={document.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"><ExternalLink size={14} />Open</a><a href={document.url} download className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"><Download size={14} />Download</a></div></div></div> : null;

const ResumeExperience = ({ experiences, profile, onPreview }) => experiences.length ? (
  <div className="relative ml-2 border-l border-slate-200 pl-6 sm:ml-4 sm:pl-8">
    {experiences.map((item, index) => (
      <article key={`experience-${index}`} className="relative pb-8 last:pb-0">
        <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-600 ring-4 ring-emerald-100 sm:-left-[39px]" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{textOrNA(item.employmentPeriod)}</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{textOrNA(item.designation || item.role)}</h3>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600"><Building2 size={15} />{textOrNA(item.companyName || item.company)}</p>
          </div>
          <ExperienceDocumentSlider experience={item} profile={profile} experienceIndex={index} onPreview={onPreview} />
          <p className="text-xs font-medium text-slate-500 sm:max-w-[14rem] sm:text-right">{textOrNA(item.companyBusiness)}{hasText(item.department) ? ` · ${item.department}` : ""}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
          {hasText(item.areaOfExpertise) ? <span><strong className="font-semibold text-slate-700">Expertise:</strong> {item.areaOfExpertise}</span> : null}
          {hasText(item.companyLocation) ? <span><strong className="font-semibold text-slate-700">Location:</strong> {item.companyLocation}</span> : null}
        </div>
        {hasText(item.responsibilities) ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{item.responsibilities}</p> : null}
      </article>
    ))}
  </div>
) : <p className="text-sm text-slate-500">No employment history added yet.</p>;

const ResumeEducation = ({ academics, learning }) => academics.length || learning.length ? (
  <div className="space-y-7">
    {academics.length ? <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Education</h3>
      <div className="divide-y divide-slate-100">
        {academics.map((item, index) => <article key={`academic-${index}`} className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[8rem_1fr_auto] sm:items-start sm:gap-5"><p className="text-sm font-semibold text-emerald-700">{textOrNA(item.yearOfPassing)}</p><div><h4 className="font-bold text-slate-900">{textOrNA(item.examDegreeTitle || item.levelOfEducation)}</h4><p className="mt-1 text-sm text-slate-600">{textOrNA(item.instituteName)}</p><p className="mt-2 text-xs text-slate-500">{textOrNA(item.concentrationMajorGroup)}{hasText(item.durationYears) ? ` · ${item.durationYears}` : ""}{hasText(item.result) ? ` · ${item.result}` : ""}</p></div></article>)}
      </div>
    </div> : null}
    {learning.length ? <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Certifications, courses & internships</h3>
      <div className="divide-y divide-slate-100">
        {learning.map((item, index) => <article key={`learning-${index}`} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-5"><div><h4 className="font-bold text-slate-900">{textOrNA(item.name || item.type || `Learning record ${index + 1}`)}</h4><p className="mt-1 text-sm text-slate-600">{textOrNA(item.organization || item.institute || item.companyName)}</p><p className="mt-2 text-xs text-slate-500">Duration: {textOrNA(item.duration)}{hasText(item.achievementNote || item.details) ? ` · ${item.achievementNote || item.details}` : ""}</p></div>{item.certificate ? <a href={toAbsoluteUrl(item.certificate)} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800">View certificate ↗</a> : null}</article>)}
      </div>
    </div> : null}
  </div>
) : <p className="text-sm text-slate-500">No education or certification records added yet.</p>;

const AppointExpertiseDetails = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);

  useEffect(() => { const load = async () => { setLoading(true); try { const { data } = await api.get(`/premium/expertise/${id}`); setProfile(data.profile || null); setMessage(""); } catch (error) { setMessage(error?.response?.data?.message || "Failed to load expertise details."); } finally { setLoading(false); } }; load(); }, [id]);
  if (loading) return <DetailsSkeleton />;
  if (!profile) return <section className="rounded-2xl bg-red-50 p-5 text-sm text-red-700 sm:border sm:border-red-200">{message || "Expertise profile not found."}</section>;

  const seeker = profile.seeker || {};
  const skills = [...new Set([...listOrFallback(profile.skills), ...listOrFallback(seeker.skills)].map((item) => String(item || "").trim()).filter(Boolean))];
  const projects = listOrFallback(seeker.projects);
  const academics = listOrFallback(profile.academics);
  const experiences = listOrFallback(profile.experienceHistory).slice().sort((a, b) => getExperienceDate(b) - getExperienceDate(a));
  const learning = listOrFallback(profile.coursesOrInternships);
  const experienceYears = toNumber(profile.totalExperienceYears) || toNumber(seeker.experienceYears);
  const expectedSalary = toNumber(profile.expectedSalary) || toNumber(seeker.expectedSalary);
  const totalCompanies = getTotalCompanies(profile);
  const headline = profile.headline || seeker.headline || seeker.currentPosition || profile.preferredRole || seeker.jobRole || "Professional";
  const location = profile.location || seeker.location;
  const imageUrl = toAbsoluteUrl(seeker.profileImage);

  return <section className="mx-[-1rem] min-w-0 space-y-5 bg-slate-50 px-4 py-2 pb-5 sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Expert Profile</p><h1 className="mt-1 text-2xl font-bold text-slate-900">{textOrNA(seeker.name)}</h1></div><Link to="/appoint-expertise" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"><ArrowLeft size={16} />Back to experts</Link></header>

    <Section icon={CheckCircle2} eyebrow="First impression" title={headline} hint={location ? `Based in ${location}` : "Professional expert profile"}><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-emerald-50 ring-4 ring-emerald-50">{imageUrl ? <img src={imageUrl} alt={seeker.name || "Expert"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl font-bold text-emerald-700">{(seeker.name || "E").slice(0, 1).toUpperCase()}</div>}</div><div className="min-w-0 flex-1"><h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{textOrNA(seeker.name)}</h2><p className="mt-1 text-base font-semibold text-emerald-700">{headline}</p>{location ? <p className="mt-2 flex items-center gap-1 text-sm text-slate-500"><MapPin size={15} />{location}</p> : null}<p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{textOrNA(profile.summary || seeker.bio)}</p></div></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Experience" value={`${experienceYears} years`} tone="emerald" /><Metric label="Expected salary" value={expectedSalary ? `${expectedSalary} BDT` : "Negotiable"} tone="amber" /><Metric label="Primary location" value={textOrNA(location)} tone="slate" /><Metric label="Projects completed" value={projects.length} tone="cyan" /></div></Section>

    <Section icon={BriefcaseBusiness} eyebrow="Competency proof" title="Core skills & tech stack" hint="Primary and supporting skills available for recruiter scanning.">{skills.length ? <div className="flex flex-wrap gap-2">{skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div> : <p className="text-sm text-slate-500">No skills listed yet.</p>}</Section>

    <Section icon={Building2} eyebrow="Work history" title="Proved expertise & experience" hint="Most recent experience is shown first."><ResumeExperience experiences={experiences} profile={profile} onPreview={setPreviewDocument} /></Section>

    <Section icon={GraduationCap} eyebrow="Academic foundation" title="Education & certifications"><ResumeEducation academics={academics} learning={learning} /></Section>

    <Section icon={MessageCircle} eyebrow="Next step" title="Hiring communication flow" hint="Start a direct workspace conversation with this expert."><Link to={`/messages/${seeker._id || seeker.id || ""}`} state={{ candidateName: seeker.name || "", candidateRole: headline, candidateEmail: seeker.email || profile.primaryEmail || "", expertiseProfileId: id }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"><MessageCircle size={18} />Message {seeker.name ? seeker.name.split(" ")[0] : "Expert"}</Link></Section>
    {previewDocument ? <DocumentModal document={previewDocument} onClose={() => setPreviewDocument(null)} /> : null}
  </section>;
};

export default AppointExpertiseDetails;
