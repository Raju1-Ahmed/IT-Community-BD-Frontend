import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import brandLogo from "../asset/brand-logo.svg";
import {
  Bookmark,
  BriefcaseBusiness,
  CircleUserRound,
  Contact,
  FileText,
  FolderKanban,
  Gem,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  User,
  UserPlus,
  UserSearch,
  X
} from "lucide-react";

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-emerald-600 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-emerald-600 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  }`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const profileImageUrl = useMemo(() => {
    if (!user?.profileImage) return "";
    const imageUrl = user.profileImage.startsWith("http")
      ? user.profileImage
      : `${BACKEND_ORIGIN}${user.profileImage}`;
    const version = user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();
    return `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}v=${version}`;
  }, [user]);

  const primaryLinks = [
    { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { to: "/appoint-expertise", label: "Appoint Expertise", icon: Gem },
    ...(user ? [{ to: "/messages", label: "Message", icon: MessageSquare }] : []),
    { to: "/contact", label: "Contact", icon: Contact },
    { to: "/about", label: "About", icon: FileText },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin", icon: LayoutDashboard }] : [])
  ];

  const seekerMenuItems = [
    { to: "/my-profile", label: "My Profile", icon: User },
    { to: "/seeker-resume", label: "My Resume", icon: FileText },
    { to: "/my-applications", label: "My Applications", icon: FolderKanban },
    { to: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
    { to: "/expert-profile", label: "Expert", icon: Gem }
  ];

  const employerMenuItems = [
    { to: "/employer-profile", label: "Employer Profile", icon: CircleUserRound },
    { to: "/post-job", label: "Post Job", icon: PlusCircle },
    { to: "/my-jobs", label: "My Jobs", icon: FolderKanban },
    { to: "/employer-applications", label: "Job Seeker Applications", icon: UserSearch }
  ];

  const adminMenuItems = [{ to: "/admin/premium-queue", label: "Premium Queue", icon: Gem }];

  const profileMenuItems =
    user?.role === "seeker"
      ? seekerMenuItems
      : user?.role === "employer"
        ? employerMenuItems
        : user?.role === "admin"
          ? adminMenuItems
          : [];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src={brandLogo} alt="IT Community BD logo" className="h-10 w-auto object-contain sm:h-11" />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                <Icon size={15} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="relative z-[60]">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-slate-200 transition hover:ring-emerald-300"
                  title={`${user.name} (${user.role})`}
                >
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-emerald-600 text-sm font-semibold text-white">
                      {(user.name || "U").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 z-[70] mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)]">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{user.role}</p>
                    </div>

                    <div className="mt-2 space-y-1">
                      {profileMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <Icon size={16} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-2 border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <NavLink to="/login" className={linkClass}>
                <LogIn size={15} />
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                <UserPlus size={15} />
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-slate-200/80 bg-white/95 px-4 pb-4 pt-3 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)] lg:hidden">
          <div className="mx-auto max-w-6xl space-y-4">
            <nav className="grid gap-2">
              {primaryLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {user ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                      {(user.name || "U").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{user.role}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  {profileMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <Icon size={17} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid gap-2">
                <NavLink to="/login" className={mobileLinkClass}>
                  <LogIn size={18} />
                  Login
                </NavLink>
                <NavLink to="/register" className={mobileLinkClass}>
                  <UserPlus size={18} />
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
