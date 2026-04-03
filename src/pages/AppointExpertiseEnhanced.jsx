import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  Search,
  SlidersHorizontal
} from "lucide-react";
import api from "../api/client";
import ExpertiseDocumentCarousel from "../components/ExpertiseDocumentCarousel";
import { Skeleton } from "../components/loaders/Skeleton";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const listOrFallback = (arr) => (Array.isArray(arr) ? arr : []);

const toAbsoluteUrl = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("http")) return value;
  return `${BACKEND_ORIGIN}${value}`;
};

const buildDocumentSlides = (profile) => {
  const slides = [];

  if (profile?.cvUrl) {
    slides.push({ label: "Company Clearance", url: toAbsoluteUrl(profile.cvUrl) });
  }
  if (profile?.experienceLetterUrl) {
    slides.push({ label: "Company ID Card", url: toAbsoluteUrl(profile.experienceLetterUrl) });
  }
  if (profile?.companyIdCardUrl) {
    slides.push({ label: "Appointment Letter", url: toAbsoluteUrl(profile.companyIdCardUrl) });
  }

  listOrFallback(profile?.coursesOrInternships).forEach((item, idx) => {
    if (!item?.certificate) return;
    slides.push({
      label: `${item?.type || "Course/Intern"} Certificate ${idx + 1}`,
      url: toAbsoluteUrl(item.certificate)
    });
  });

  return slides;
};

const getTotalCompanies = (profile) => {
  const entries = listOrFallback(profile?.experienceHistory);
  if (entries.length === 0) return 0;

  const uniqueCompanies = new Set(
    entries
      .map((item) => String(item?.companyName || item?.company || "").trim())
      .filter(Boolean)
  );

  return uniqueCompanies.size > 0 ? uniqueCompanies.size : entries.length;
};

const ExpertiseListSkeleton = () => (
  <div className="space-y-5">
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-12 w-44 rounded-2xl" />
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl lg:w-56" />
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`expertise-skeleton-${index}`}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <Skeleton className="h-32 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AppointExpertiseEnhanced = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/premium/expertise");
        setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
        setMessage("");
      } catch (error) {
        setMessage(error?.response?.data?.message || "Failed to load appoint expertise data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProfiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;

    return profiles.filter((profile) => {
      const seeker = profile?.seeker || {};
      const skills = [...listOrFallback(profile?.skills), ...listOrFallback(seeker?.skills)]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const bag = [
        seeker?.name,
        seeker?.jobCategory,
        seeker?.jobRole,
        seeker?.jobSpecialization,
        profile?.preferredRole,
        profile?.location,
        seeker?.location,
        profile?.summary,
        seeker?.bio,
        skills
      ]
        .join(" ")
        .toLowerCase();

      return bag.includes(q);
    });
  }, [profiles, query]);

  return (
    <section className="space-y-5 pb-4">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Appoint Expertise</h1>
            <p className="mt-1 text-sm text-slate-600">
              Search and review expert profiles for fast employer shortlisting.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span className="font-semibold text-slate-900">{filteredProfiles.length}</span>{" "}
            {query.trim() ? `matching profile${filteredProfiles.length === 1 ? "" : "s"}` : "profiles available"}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, role, skill, location"
              className="w-full rounded-2xl border border-slate-300 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <SlidersHorizontal size={16} className="text-slate-400" />
            Employer filtering view
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
      ) : null}

      {loading ? <ExpertiseListSkeleton /> : null}

      {!loading ? <div className="grid gap-4 md:grid-cols-3">
        {filteredProfiles.map((profile) => {
          const seeker = profile?.seeker || {};
          const seekerImage = seeker?.profileImage ? toAbsoluteUrl(seeker.profileImage) : "";
          const jobCategoryName =
            seeker?.jobCategory ||
            seeker?.jobRole ||
            seeker?.jobSpecialization ||
            profile?.preferredRole ||
            seeker?.currentPosition ||
            "N/A";
          const address = profile?.location || seeker?.location || "N/A";
          const totalCompanies = getTotalCompanies(profile);
          const totalExperienceYears = Number(profile?.totalExperienceYears) || Number(seeker?.experienceYears) || 0;
          const expectedSalary = Number(profile?.expectedSalary) || Number(seeker?.expectedSalary) || 0;
          const documentSlides = buildDocumentSlides(profile);
          const combinedSkills = [...listOrFallback(profile?.skills), ...listOrFallback(seeker?.skills)]
            .map((item) => String(item || "").trim())
            .filter(Boolean)
            .slice(0, 3);

          return (
            <article
              key={profile._id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/appoint-expertise/${profile._id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/appoint-expertise/${profile._id}`);
                }
              }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <div className="border-b border-slate-100 bg-slate-50/70 p-2.5">
                <ExpertiseDocumentCarousel documents={documentSlides} heightClass="h-32" />
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200">
                      {seekerImage ? (
                        <img src={seekerImage} alt={seeker?.name || "Candidate"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-600">
                          {(seeker?.name || "C").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-[15px] font-semibold leading-tight text-slate-900 transition group-hover:text-emerald-700">
                        {seeker?.name || "N/A"}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs font-medium text-emerald-700">{jobCategoryName}</p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin size={12} /> {address}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full bg-slate-50 p-2 text-slate-500 ring-1 ring-slate-200 transition group-hover:text-emerald-700">
                    <ArrowRight size={15} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-700">
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[11px] text-slate-500">Companies</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{totalCompanies}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[11px] text-slate-500">Experience</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{totalExperienceYears} yrs</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[11px] text-slate-500">Salary</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{expectedSalary} BDT</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <BriefcaseBusiness size={14} />
                    Skills
                  </div>
                  <div className="flex min-h-[32px] flex-wrap gap-1.5">
                    {combinedSkills.length > 0 ? (
                      combinedSkills.map((skill) => (
                        <span
                          key={`${profile._id}-${skill}`}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">Skills not added yet</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="text-[11px] text-slate-500">
                    {documentSlides.length} document{documentSlides.length === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    View details
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div> : null}

      {!loading && filteredProfiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="text-lg font-semibold text-slate-900">No matching expertise found.</p>
          <p className="mt-2 text-sm text-slate-600">Try a different role, skill, category, or location keyword.</p>
        </div>
      ) : null}
    </section>
  );
};

export default AppointExpertiseEnhanced;
