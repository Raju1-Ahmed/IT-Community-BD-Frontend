import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Building2, CheckCircle2, Download, ExternalLink, FileCheck2, FileText, GraduationCap, MapPin, MessageCircle, X } from "lucide-react";
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

const buildDocumentItems = (profile) => {
  const documents = [];
  const add = (label, url, type) => { if (url) documents.push({ label, url: toAbsoluteUrl(url), type }); };
  add("CV / Resume", profile?.cvUrl, "Resume");
  add("Company Clearance", profile?.companyClearanceUrl || profile?.clearanceUrl, "Employment proof");
  add("Experience Letter", profile?.experienceLetterUrl, "Employment proof");
  add("Company ID Card", profile?.companyIdCardUrl, "Identity proof");
  add("Appointment Letter", profile?.appointmentLetterUrl, "Employment proof");
  add("Additional Document", profile?.additionalDocUrl, "Supporting document");
  listOrFallback(profile?.coursesOrInternships).forEach((item, index) => { if (item?.certificate) add(`${item?.type || "Course"} Certificate ${index + 1}`, item.certificate, "Certificate"); });
  return documents;
};

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

const DocumentGrid = ({ documents, onPreview }) => documents.length ? (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{documents.map((document) => (
    <button type="button" key={`${document.label}-${document.url}`} onClick={() => onPreview(document)} className="group overflow-hidden rounded-2xl bg-slate-50 text-left ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:ring-emerald-300">
      <div className="flex h-24 items-center justify-center overflow-hidden bg-slate-100 sm:h-28">{isImageDocument(document.url) ? <img src={document.url} alt={document.label} className="h-full w-full object-cover transition group-hover:scale-105" /> : <div className="flex flex-col items-center gap-2 text-slate-500"><FileText size={28} /><span className="text-[10px] font-bold tracking-widest">PDF / FILE</span></div>}</div>
      <div className="p-3"><p className="line-clamp-2 text-xs font-semibold text-slate-800">{document.label}</p><p className="mt-1 text-[11px] text-emerald-700">Preview document</p></div>
    </button>
  ))}</div>
) : <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No verification documents uploaded yet.</div>;

const DetailsSkeleton = () => <section className="mx-[-1rem] min-h-[70vh] space-y-5 bg-slate-50 px-4 py-4 sm:mx-0 sm:rounded-3xl sm:border sm:border-slate-200 sm:bg-white sm:p-6"><div className="flex items-center justify-between gap-3"><Skeleton className="h-8 w-48 rounded-full" /><Skeleton className="h-10 w-28 rounded-full" /></div><div className="rounded-3xl bg-white p-4 shadow-sm sm:border sm:border-slate-200 sm:p-6"><div className="flex items-center gap-4"><Skeleton className="h-20 w-20 rounded-3xl" /><div className="flex-1 space-y-3"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-64 max-w-full" /><Skeleton className="h-3 w-40" /></div></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 rounded-2xl" />)}</div><SkeletonText lines={4} className="mt-5" /></div><div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-60 rounded-3xl" /><Skeleton className="h-60 rounded-3xl" /></div></section>;

const DocumentModal = ({ document, onClose }) => document ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label={document.label}><div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"><div><p className="text-sm font-bold text-slate-900">{document.label}</p><p className="text-xs text-slate-500">{document.type}</p></div><button type="button" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" aria-label="Close preview"><X size={18} /></button></div><div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3 sm:p-5">{isImageDocument(document.url) ? <img src={document.url} alt={document.label} className="mx-auto max-h-[70vh] max-w-full rounded-xl object-contain" /> : <iframe title={document.label} src={document.url} className="h-[70vh] min-h-[420px] w-full rounded-xl bg-white" />}</div><div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3"><a href={document.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"><ExternalLink size={14} />Open</a><a href={document.url} download className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"><Download size={14} />Download</a></div></div></div> : null;

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
  const documents = buildDocumentItems(profile);
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

    <Section icon={Building2} eyebrow="Work history" title="Proved expertise & experience" hint="Most recent experience is shown first.">{experiences.length ? <div className="space-y-5">{experiences.map((item, index) => <article key={`experience-${index}`} className="rounded-2xl bg-slate-50 p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Experience {index + 1}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{textOrNA(item.designation || item.role)}</h3><p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600"><Building2 size={15} />{textOrNA(item.companyName || item.company)}</p></div>{hasText(item.employmentPeriod) ? <Tag>{item.employmentPeriod}</Tag> : null}</div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Business / industry" value={textOrNA(item.companyBusiness)} /><Metric label="Department" value={textOrNA(item.department)} /><Metric label="Period" value={textOrNA(item.employmentPeriod)} tone="cyan" /><Metric label="Expertise" value={textOrNA(item.areaOfExpertise)} tone="emerald" /></div>{hasText(item.responsibilities) ? <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Responsibilities</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{item.responsibilities}</p></div> : null}</article>)}</div> : <p className="text-sm text-slate-500">No employment history added yet.</p>}</Section>

    <Section icon={FileCheck2} eyebrow="Trust & authenticity" title="Documents & verification proof" hint="Click any document to preview it in a focused viewer."><DocumentGrid documents={documents} onPreview={setPreviewDocument} /></Section>

    <Section icon={GraduationCap} eyebrow="Academic foundation" title="Education & certifications"><div className="space-y-5">{academics.length ? <div className="space-y-3"><h3 className="text-sm font-bold text-slate-900">Educational background</h3>{academics.map((item, index) => <div key={`academic-${index}`} className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-base font-bold text-slate-900">{textOrNA(item.examDegreeTitle || item.levelOfEducation)}</p><p className="mt-1 text-sm text-slate-600">{textOrNA(item.instituteName)}</p></div><Tag>{textOrNA(item.yearOfPassing)}</Tag></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"><Metric label="Major / group" value={textOrNA(item.concentrationMajorGroup)} /><Metric label="Duration" value={textOrNA(item.durationYears)} tone="cyan" /><Metric label="Result" value={textOrNA(item.result)} tone="emerald" /></div></div>)}</div> : null}{learning.length ? <div className="space-y-3"><h3 className="text-sm font-bold text-slate-900">Courses & internships</h3>{learning.map((item, index) => <div key={`learning-${index}`} className="rounded-2xl bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{textOrNA(item.name || item.type || `Learning record ${index + 1}`)}</p><p className="mt-1 text-sm text-slate-500">Organization: {textOrNA(item.organization || item.institute || item.companyName)}</p></div>{item.certificate ? <a href={toAbsoluteUrl(item.certificate)} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Certificate</a> : null}</div><p className="mt-2 text-sm text-slate-600">Duration: {textOrNA(item.duration)}</p>{hasText(item.achievementNote || item.details) ? <p className="mt-2 text-sm leading-6 text-slate-700">{item.achievementNote || item.details}</p> : null}</div>)}</div> : null}{!academics.length && !learning.length ? <p className="text-sm text-slate-500">No education or certification records added yet.</p> : null}</div></Section>

    <Section icon={MessageCircle} eyebrow="Next step" title="Hiring communication flow" hint="Start a direct workspace conversation with this expert."><Link to={`/messages/${seeker._id || seeker.id || ""}`} state={{ candidateName: seeker.name || "", candidateRole: headline, candidateEmail: seeker.email || profile.primaryEmail || "", expertiseProfileId: id }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"><MessageCircle size={18} />Message {seeker.name ? seeker.name.split(" ")[0] : "Expert"}</Link></Section>
    {previewDocument ? <DocumentModal document={previewDocument} onClose={() => setPreviewDocument(null)} /> : null}
  </section>;
};

export default AppointExpertiseDetails;
