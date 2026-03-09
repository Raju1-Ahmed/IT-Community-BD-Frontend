import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const AppointExpertise = () => {
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
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-slate-900">Appoint Expertise</h2>
        <p className="mt-1 text-sm text-slate-600">
          Browse expert profiles and appoint the right candidate for your team.
        </p>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, category, role, skill, location"
          className="mt-4 w-full rounded-md border border-slate-300 p-2 text-sm md:max-w-lg"
        />
      </div>

      {loading ? <p className="text-sm text-slate-700">Loading appoint expertise...</p> : null}
      {message ? <p className="text-sm text-red-600">{message}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {filteredProfiles.map((profile) => {
          const seeker = profile?.seeker || {};
          const seekerImage = seeker?.profileImage ? toAbsoluteUrl(seeker.profileImage) : "";
          const jobCategoryName =
            seeker?.jobCategory || seeker?.jobRole || seeker?.jobSpecialization || profile?.preferredRole || seeker?.currentPosition || "N/A";
          const address = profile?.location || seeker?.location || "N/A";
          const totalCompanies = getTotalCompanies(profile);
          const totalExperienceYears = Number(profile?.totalExperienceYears) || Number(seeker?.experienceYears) || 0;
          const expectedSalary = Number(profile?.expectedSalary) || Number(seeker?.expectedSalary) || 0;
          const documentSlides = buildDocumentSlides(profile);

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
              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <ExpertiseDocumentCarousel documents={documentSlides} heightClass="h-40" />

              <div className="mt-3 flex items-center gap-2">
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
                  <h3 className="text-base font-semibold text-slate-900">{seeker?.name || "N/A"}</h3>
                  <p className="text-xs font-medium text-emerald-700">{jobCategoryName}</p>
                  <p className="text-xs text-slate-500">{address}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-700">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Companies</p>
                  <p className="font-semibold">{totalCompanies}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Experience</p>
                  <p className="font-semibold">{totalExperienceYears} years</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Expected Salary</p>
                  <p className="font-semibold">{expectedSalary} BDT</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && filteredProfiles.length === 0 ? (
        <p className="text-sm text-slate-600">No matching expertise found.</p>
      ) : null}
    </section>
  );
};

export default AppointExpertise;
