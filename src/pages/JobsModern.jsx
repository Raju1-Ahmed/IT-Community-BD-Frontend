import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users
} from "lucide-react";
import api from "../api/client";
import { IT_JOBS } from "../data/itJobs";
import { SkeletonCard } from "../components/loaders/Skeleton";

const jobTypeOptions = [
  { value: "", label: "All types" },
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" }
];

const experienceOptions = [
  { value: "", label: "All levels" },
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" }
];

const workplaceOptions = [
  { value: "", label: "All workplaces" },
  { value: "office", label: "Office" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" }
];

const SAVED_FILTERS_KEY = "itbd-saved-job-filters";

const getSavedFilters = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || "{}") || {};
  } catch (_error) {
    return {};
  }
};

const genderOptions = [
  { value: "", label: "All gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" }
];

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const BACKEND_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const resolveProfileImage = (image) => {
  if (!image) return "";
  return image.startsWith("http") || image.startsWith("data:") ? image : `${BACKEND_ORIGIN}${image}`;
};

const formatSalary = (job) => {
  if (!job.salaryMin && !job.salaryMax) return "Negotiable";
  return `BDT ${job.salaryMin || 0} - ${job.salaryMax || 0}`;
};

const formatJobType = (value) => String(value || "").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const MetaPill = ({ icon, text }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
    {icon}
    <span>{text}</span>
  </div>
);

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const normalizeResponsibilities = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(/[;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const classifyJobTaxonomy = (job) => {
  const haystack = [
    job?.title,
    job?.description,
    job?.responsibilities,
    job?.additionalRequirements,
    job?.businessArea,
    ...(Array.isArray(job?.skills) ? job.skills : [])
  ]
    .map(normalizeText)
    .join(" ");

  let bestMatch = { category: "", role: "", score: 0 };

  IT_JOBS.forEach((categoryItem) => {
    categoryItem.roles.forEach((roleItem) => {
      let score = 0;
      const roleTerms = [roleItem.role, ...roleItem.specializations];

      roleTerms.forEach((term) => {
        const normalizedTerm = normalizeText(term);
        if (!normalizedTerm) return;

        if (haystack.includes(normalizedTerm)) {
          score += normalizedTerm === normalizeText(roleItem.role) ? 3 : 1;
        }
      });

      if (score > bestMatch.score) {
        bestMatch = {
          category: categoryItem.category,
          role: roleItem.role,
          score
        };
      }
    });
  });

  return {
    category: bestMatch.score > 0 ? bestMatch.category : "",
    role: bestMatch.score > 0 ? bestMatch.role : ""
  };
};

const JobsModern = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(() => ({
    q: "",
    location: "",
    category: "",
    role: "",
    jobType: "",
    experienceLevel: "",
    genderPreference: "",
    workplace: "",
    ...getSavedFilters()
  }));
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtersSaved, setFiltersSaved] = useState(false);

  const loadJobs = async ({
    q = "",
    location = "",
    jobType = "",
    experienceLevel = "",
    genderPreference = ""
  } = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (location) params.location = location;
      if (jobType) params.jobType = jobType;
      if (experienceLevel) params.experienceLevel = experienceLevel;
      if (genderPreference) params.genderPreference = genderPreference;

      const { data } = await api.get("/jobs", { params });
      setJobs(data.jobs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedFilters = getSavedFilters();
    const hasUrlFilters = Array.from(searchParams.keys()).length > 0;
    const nextFilters = {
      q: searchParams.get("q") || "",
      location: searchParams.get("location") || "",
      category: searchParams.get("category") || "",
      role: searchParams.get("role") || "",
      jobType: searchParams.get("jobType") || "",
      experienceLevel: searchParams.get("experienceLevel") || "",
      genderPreference: searchParams.get("genderPreference") || "",
      workplace: searchParams.get("workplace") || "",
      ...(hasUrlFilters ? {} : savedFilters)
    };

    setFilters(nextFilters);
    loadJobs(nextFilters);
  }, [searchParams]);

  const jobsWithTaxonomy = useMemo(() => {
    return jobs.map((job) => ({
      ...job,
      taxonomy: classifyJobTaxonomy(job)
    }));
  }, [jobs]);

  const categoryOptions = useMemo(() => {
    return IT_JOBS.map((item) => item.category);
  }, []);

  const roleOptions = useMemo(() => {
    if (!filters.category) return [];
    return IT_JOBS.find((item) => item.category === filters.category)?.roles.map((item) => item.role) || [];
  }, [filters.category]);

  const filteredJobs = useMemo(() => {
    return jobsWithTaxonomy.filter((job) => {
      const workplaceMatch = filters.workplace ? job.workplace === filters.workplace : true;
      const categoryMatch = filters.category ? job.taxonomy.category === filters.category : true;
      const roleMatch = filters.role ? job.taxonomy.role === filters.role : true;

      return workplaceMatch && categoryMatch && roleMatch;
    });
  }, [jobsWithTaxonomy, filters.category, filters.role, filters.workplace]);

  const syncSearchParams = (nextFilters) => {
    const nextParams = {};

    Object.entries(nextFilters).forEach(([key, value]) => {
      const trimmed = typeof value === "string" ? value.trim() : value;
      if (trimmed) nextParams[key] = trimmed;
    });

    setSearchParams(nextParams);
  };

  const handleFilterChange = (key, value) => {
    const nextFilters = {
      ...filters,
      [key]: value
    };

    if (key === "category") {
      nextFilters.role = "";
    }

    setFilters(nextFilters);
    syncSearchParams(nextFilters);
  };

  const resetFilters = () => {
    const nextFilters = {
      q: "",
      location: "",
      category: "",
      role: "",
      jobType: "",
      experienceLevel: "",
      genderPreference: "",
      workplace: ""
    };
    setFilters(nextFilters);
    setSearchParams({});
    setFiltersSaved(false);
  };

  const saveFilters = () => {
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
    setFiltersSaved(true);
    window.setTimeout(() => setFiltersSaved(false), 1800);
  };

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={() => setFilterOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm sm:hidden"
      >
        <SlidersHorizontal size={17} />
        Open Filters
      </button>

      <div className={`${filterOpen ? "fixed inset-0 z-[80] overflow-y-auto bg-slate-900/40 p-4" : "hidden"} sm:static sm:block sm:overflow-visible sm:bg-transparent sm:p-0`}>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Sparkles size={14} />
                Modern Filtering
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">Filter jobs faster and more precisely</h3>
              <p className="mt-1 text-sm text-slate-600">
                Search by keyword and narrow results by category, role, type, level, gender, workplace, and location.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:hidden"
              >
                Close
              </button>
              <button
                type="button"
                onClick={saveFilters}
                className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                {filtersSaved ? "Filters Saved" : "Save Filters"}
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <RotateCcw size={16} />
                Clear Filters
              </button>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} />
                Filters apply instantly
              </div>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(6,minmax(0,1fr))]">
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Search by title, company, or skill"
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
              />
            </div>

            <div className="relative">
              <MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              />
            </div>

            <select
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              disabled={!filters.category}
            >
              <option value="">All roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              value={filters.jobType}
              onChange={(e) => handleFilterChange("jobType", e.target.value)}
            >
              {jobTypeOptions.map((option) => (
                <option key={option.value || "all-job-type"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              value={filters.experienceLevel}
              onChange={(e) => handleFilterChange("experienceLevel", e.target.value)}
            >
              {experienceOptions.map((option) => (
                <option key={option.value || "all-experience"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="relative">
              <Users size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                value={filters.genderPreference}
                onChange={(e) => handleFilterChange("genderPreference", e.target.value)}
              >
                {genderOptions.map((option) => (
                  <option key={option.value || "all-gender"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              value={filters.workplace}
              onChange={(e) => handleFilterChange("workplace", e.target.value)}
            >
              {workplaceOptions.map((option) => (
                <option key={option.value || "all-workplace"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={`job-skeleton-${index}`} />
            ))}
          </div>
        </div>
      ) : null}

      {!loading ? <div className="space-y-4">
        {filteredJobs.map((job) => (
          <article
            key={job._id}
            className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                {job.status || "active"}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                {formatJobType(job.jobType)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                {job.experienceLevel}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                {job.workplace || "office"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                {job.genderPreference === "male"
                  ? "Male"
                  : job.genderPreference === "female"
                    ? "Female"
                    : "Male/Female"}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                  {resolveProfileImage(job.postedBy?.profileImage) ? (
                    <img
                      src={resolveProfileImage(job.postedBy.profileImage)}
                      alt={`${job.companyName || "Company"} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (job.companyName || job.postedBy?.name || "C").slice(0, 1).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-emerald-700">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{job.companyName}</p>
                </div>
              </div>
              {job.taxonomy.category ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                    {job.taxonomy.category}
                  </span>
                  {job.taxonomy.role ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      {job.taxonomy.role}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <MetaPill icon={<MapPin size={14} className="text-emerald-700" />} text={job.location} />
              <MetaPill icon={<CircleDollarSign size={14} className="text-emerald-700" />} text={formatSalary(job)} />
              <MetaPill
                icon={<CalendarClock size={14} className="text-emerald-700" />}
                text={`Deadline: ${formatDate(job.applicationDeadline)}`}
              />
              <MetaPill
                icon={<CalendarClock size={14} className="text-emerald-700" />}
                text={`Published: ${formatDateTime(job.createdAt)}`}
              />
            </div>

            {normalizeResponsibilities(job.responsibilities).length > 0 ? (
              <div className="mt-3 max-h-10 overflow-hidden text-sm leading-5 text-slate-600">
                {normalizeResponsibilities(job.responsibilities).join("; ")}
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {Array.isArray(job.skills) && job.skills.length > 0 ? job.skills.slice(0, 3).join(", ") : null}
              </p>
              <Link
                to={`/jobs/${job._id}`}
                className="inline-flex shrink-0 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div> : null}

      {!loading && filteredJobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <BriefcaseBusiness size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No jobs found</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try another search term or clear the filters to browse all current job openings.
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default JobsModern;
