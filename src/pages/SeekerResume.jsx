import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCategoryResumeSections } from "../data/categoryProfileConfig";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const SeekerResume = () => {
  const { user } = useAuth();

  const resumeData = {
    fullName: user?.name || "Your Name",
    jobTitle: user?.currentPosition || "Professional",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.location || "",
    summary: user?.bio || "",
    portfolio: user?.portfolio || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    jobCategory: user?.jobCategory || "",
    categoryProfile: user?.categoryProfile || {},
    skills: normalizeArray(user?.skills),
    experience: normalizeArray(user?.experience),
    education: normalizeArray(user?.educationEntries),
    projects: normalizeArray(user?.projects),
    languages: normalizeArray(user?.languages),
    certifications: normalizeArray(user?.certifications),
    volunteer: normalizeArray(user?.volunteer)
  };

  const imageUrl = user?.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : `${BACKEND_ORIGIN}${user.profileImage}`
    : "";
  const categorySections = getCategoryResumeSections(resumeData.jobCategory, resumeData.categoryProfile);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="mx-auto max-w-5xl">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 8mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: #fff !important;
            }
            .no-print {
              display: none !important;
            }
            .resume-print-root {
              max-width: 100% !important;
              border: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            .resume-print-root * {
              font-size: 11px !important;
              line-height: 1.35 !important;
            }
            .resume-print-root h1 {
              font-size: 17px !important;
            }
            .resume-print-root h2 {
              font-size: 14px !important;
            }
            .resume-print-root h3 {
              font-size: 12px !important;
            }
            .resume-print-root aside,
            .resume-print-root main {
              padding: 16px !important;
            }
            .resume-print-root section,
            .resume-print-root .mb-6,
            .resume-print-root .mb-5,
            .resume-print-root .mb-4,
            .resume-print-root .mb-3 {
              margin-bottom: 10px !important;
            }
          }
        `}
      </style>

      <div className="no-print mb-4 flex items-center justify-end gap-2">
        <Link to="/seeker-profile" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Edit Resume
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Print Resume
        </button>
      </div>

      <div className="resume-print-root rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex flex-wrap">
        <aside className="w-full rounded-t-2xl bg-gray-800 p-8 text-white md:w-1/3 md:rounded-l-2xl md:rounded-tr-none">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-700 ring-2 ring-gray-600">
              {imageUrl ? (
                <img src={imageUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xl font-bold">
                  {resumeData.fullName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">{resumeData.fullName}</h1>
              <p className="text-sm text-blue-300">{resumeData.jobTitle}</p>
            </div>
          </div>

          <div className="mb-7 space-y-2 text-sm">
            {hasText(resumeData.email) ? (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${resumeData.email}`} className="hover:underline">
                  {resumeData.email}
                </a>
              </div>
            ) : null}
            {hasText(resumeData.phone) ? (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <p>{resumeData.phone}</p>
              </div>
            ) : null}
            {hasText(resumeData.address) ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <p>{resumeData.address}</p>
              </div>
            ) : null}
            {hasText(resumeData.portfolio) ? (
              <a href={resumeData.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                <Globe className="h-4 w-4" />
                Portfolio
              </a>
            ) : null}
            {hasText(resumeData.linkedin) ? (
              <a href={resumeData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            ) : null}
            {hasText(resumeData.github) ? (
              <a href={resumeData.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                <Github className="h-4 w-4" />
                GitHub
              </a>
            ) : null}
          </div>

          {resumeData.skills.length > 0 ? (
            <>
              <h2 className="mb-3 border-b border-gray-600 pb-1 text-lg font-semibold">SKILLS</h2>
              <div className="mb-7 flex flex-wrap gap-2">
                {resumeData.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-gray-700 px-3 py-1 text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </>
          ) : null}

          {resumeData.education.length > 0 ? (
            <>
              <h2 className="mb-3 border-b border-gray-600 pb-1 text-lg font-semibold">EDUCATION</h2>
              {resumeData.education.map((edu, index) => (
                <div key={`edu-${index}`} className="mb-4 text-sm">
                  {hasText(edu.institute) ? <p className="font-semibold">{edu.institute}</p> : null}
                  {hasText(edu.degree) ? <p className="italic text-xs">{edu.degree}</p> : null}
                  {hasText(edu.year) ? <p className="text-xs">{edu.year}</p> : null}
                </div>
              ))}
            </>
          ) : null}

          {resumeData.languages.length > 0 ? (
            <>
              <h2 className="mb-3 mt-6 border-b border-gray-600 pb-1 text-lg font-semibold">LANGUAGES</h2>
              {resumeData.languages.map((lang, index) => (
                <p key={`lang-${index}`} className="text-sm">
                  {lang.lang}
                  {hasText(lang.level) ? ` (${lang.level})` : ""}
                </p>
              ))}
            </>
          ) : null}
        </aside>

        <main className="w-full p-8 md:w-2/3">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Resume</h2>
          </div>

          {hasText(resumeData.summary) ? (
            <section className="mb-6">
              <h3 className="mb-3 border-b-2 border-gray-300 pb-1 text-lg font-semibold text-gray-700">SUMMARY</h3>
              <p className="text-sm leading-6 text-slate-700">{resumeData.summary}</p>
            </section>
          ) : null}

          {resumeData.experience.length > 0 ? (
            <section className="mb-6">
              <h3 className="mb-4 border-b-2 border-gray-300 pb-1 text-lg font-semibold text-gray-700">EXPERIENCE</h3>
              {resumeData.experience.map((exp, index) => (
                <div key={`exp-${index}`} className="relative mb-5 border-l-4 border-blue-500 pl-4">
                  {hasText(exp.role) ? <p className="font-bold text-slate-900">{exp.role}</p> : null}
                  {hasText(exp.company) ? <p className="text-sm italic text-slate-700">{exp.company}</p> : null}
                  {hasText(exp.duration) ? <p className="mb-2 text-xs text-gray-500">{exp.duration}</p> : null}
                  {hasText(exp.desc || exp.description) ? <p className="text-sm text-slate-700">{exp.desc || exp.description}</p> : null}
                </div>
              ))}
            </section>
          ) : null}

          {resumeData.projects.length > 0 ? (
            <section className="mb-6">
              <h3 className="mb-4 border-b-2 border-gray-300 pb-1 text-lg font-semibold text-gray-700">PROJECTS</h3>
              {resumeData.projects.map((proj, index) => (
                <div key={`proj-${index}`} className="mb-5">
                  <p className="font-bold text-slate-900">
                    {index + 1}. {proj.title || "Project"}
                    {hasText(proj.link) ? (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="ml-2 text-blue-600 hover:underline">
                        Demo
                      </a>
                    ) : null}
                  </p>
                  {hasText(proj.description) ? <p className="text-sm text-slate-700">{proj.description}</p> : null}
                </div>
              ))}
            </section>
          ) : null}

          {categorySections.length > 0
            ? categorySections.map((section) => (
                <section key={section.key} className="mb-6">
                  <h3 className="mb-3 border-b-2 border-gray-300 pb-1 text-lg font-semibold text-gray-700">
                    {section.label.toUpperCase()}
                  </h3>
                  {section.items.map((item, index) => (
                    <div key={`${section.key}-${index}`} className="mb-4 rounded-md border border-slate-200 p-3 text-sm text-slate-700">
                      {section.fields.map((field) =>
                        hasText(item[field.key]) ? (
                          <p key={`${section.key}-${index}-${field.key}`} className="mb-1">
                            <span className="font-semibold text-slate-900">{field.label}:</span>{" "}
                            {field.type === "url" ? (
                              <a href={item[field.key]} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                {item[field.key]}
                              </a>
                            ) : (
                              item[field.key]
                            )}
                          </p>
                        ) : null
                      )}
                    </div>
                  ))}
                </section>
              ))
            : null}

          {resumeData.certifications.length > 0 ? (
            <section className="mb-6">
              <h3 className="mb-3 border-b-2 border-gray-300 pb-1 text-lg font-semibold text-gray-700">CERTIFICATIONS</h3>
              {resumeData.certifications.map((cert, index) => (
                <p key={`cert-${index}`} className="mb-1 text-sm text-slate-700">
                  {cert.title}
                  {hasText(cert.year) ? ` | ${cert.year}` : ""}
                </p>
              ))}
            </section>
          ) : null}

          {resumeData.volunteer.length > 0 ? (
            <section>
              <h3 className="mb-3 border-b-2 border-gray-300 pb-1 text-lg font-semibold text-gray-700">VOLUNTEER WORK</h3>
              {resumeData.volunteer.map((vol, index) => (
                <div key={`vol-${index}`} className="mb-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">
                    {vol.role || "Volunteer"}
                    {hasText(vol.organization) ? ` | ${vol.organization}` : ""}
                  </p>
                  {hasText(vol.details) ? <p>{vol.details}</p> : null}
                </div>
              ))}
            </section>
          ) : null}
        </main>
      </div>
      </div>
    </section>
  );
};

export default SeekerResume;
