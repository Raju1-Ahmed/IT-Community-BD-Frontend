import { Link, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import brandLogo from "../asset/brand-logo.svg";
import {
  BriefcaseBusiness,
  Contact,
  FileText,
  LogIn,
  LogOut,
  Bookmark,
  User,
  LayoutDashboard,
  CircleUserRound,
  PlusCircle,
  FolderKanban,
  UserSearch,
  UserPlus,
  Gem
} from "lucide-react";

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm ${
    isActive ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const profileImageUrl = useMemo(() => {
    if (!user?.profileImage) return "";
    return user.profileImage.startsWith("http")
      ? user.profileImage
      : `${BACKEND_ORIGIN}${user.profileImage}`;
  }, [user]);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={brandLogo} alt="IT Community BD logo" className="h-10 w-auto object-contain" />
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/jobs" className={linkClass}>
            <BriefcaseBusiness size={15} />
            Jobs
          </NavLink>
          <NavLink to="/experties" className={linkClass}>
            <Gem size={15} />
            Experties
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            <Contact size={15} />
            Contact
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            <FileText size={15} />
            About
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
              <LayoutDashboard size={15} />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-slate-200"
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
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                  <p className="px-2 py-1 text-xs text-slate-500">{user.name}</p>
                  <p className="px-2 pb-2 text-xs text-slate-500">{user.role}</p>
                  {user.role === "seeker" ? (
                    <>
                      <Link
                        to="/seeker-profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <User size={15} />
                        My Profile
                      </Link>
                      <Link
                        to="/seeker-resume"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <FileText size={15} />
                        My Resume
                      </Link>
                      <Link
                        to="/my-applications"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <FolderKanban size={15} />
                        My Applications
                      </Link>
                      <Link
                        to="/saved-jobs"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <Bookmark size={15} />
                        Saved Jobs
                      </Link>
                      <Link
                        to="/expert-profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <Gem size={15} />
                        Expert
                      </Link>
                    </>
                  ) : null}
                  {user.role === "employer" ? (
                    <>
                      <Link
                        to="/employer-profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <CircleUserRound size={15} />
                        Employer Profile
                      </Link>
                      <Link
                        to="/post-job"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <PlusCircle size={15} />
                        Post Job
                      </Link>
                      <Link
                        to="/my-jobs"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <FolderKanban size={15} />
                        My Jobs
                      </Link>
                      <Link
                        to="/employer-applications"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <UserSearch size={15} />
                        Job Seeker Applications
                      </Link>
                    </>
                  ) : null}
                  {user.role === "admin" ? (
                    <Link
                      to="/admin/premium-queue"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Gem size={15} />
                      Premium Queue
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                <LogIn size={15} />
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                <UserPlus size={15} />
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
