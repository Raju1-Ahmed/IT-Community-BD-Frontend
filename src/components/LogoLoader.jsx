import brandIcon from "../asset/brand-icon.svg";

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-14 w-14",
  lg: "h-20 w-20"
};

const wrapperClasses = {
  inline: "inline-flex",
  section:
    "flex w-full justify-center rounded-[32px] border border-slate-200/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(240,253,250,0.92))] p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm",
  page:
    "flex min-h-[60vh] w-full items-center justify-center rounded-[36px] border border-slate-200/70 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),rgba(255,255,255,0.94)_42%)] p-10 shadow-[0_28px_80px_rgba(15,23,42,0.1)] backdrop-blur-sm"
};

const orbitSpeedClasses = {
  slow: "animate-[spin_3.6s_linear_infinite]",
  normal: "animate-[spin_2.4s_linear_infinite]",
  fast: "animate-[spin_1.2s_linear_infinite]"
};

const LogoLoader = ({
  label = "Loading...",
  size = "md",
  variant = "section",
  speed = "normal",
  className = ""
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`${wrapperClasses[variant] || wrapperClasses.section} ${className}`}
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Brand Loader
        </div>

        <div className="relative flex items-center justify-center rounded-[28px] border border-white/70 bg-white/80 px-8 py-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
          <div className="absolute inset-0 scale-[1.55] rounded-full bg-emerald-400/12 blur-2xl" />
          <div className="absolute inset-[-10px] rounded-full border border-emerald-100/80" />
          <div
            className={`logo-loader-ring relative rounded-full p-[3px] shadow-[0_10px_30px_rgba(16,185,129,0.18)] ${orbitSpeedClasses[speed] || orbitSpeedClasses.normal}`}
          >
            <div className="rounded-full bg-white p-3">
              <img
                src={brandIcon}
                alt="Loading"
                className={`logo-loader-icon ${sizeClasses[size] || sizeClasses.md}`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-800">{label}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Please wait</p>
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ButtonLogoSpinner = ({ label = "Processing..." }) => (
  <span className="inline-flex items-center gap-2">
    <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-emerald-200 bg-white shadow-sm">
      <span className="absolute inset-0 animate-[spin_1s_linear_infinite] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />
      <span className="relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white">
        <img src={brandIcon} alt="" aria-hidden="true" className="h-2.5 w-2.5" />
      </span>
    </span>
    <span className="text-sm font-medium text-current">{label}</span>
  </span>
);

export default LogoLoader;
