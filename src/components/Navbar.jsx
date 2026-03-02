import { Link, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import brandLogo from "../asset/brand-logo.svg";

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm ${isActive ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-slate-100"}`;
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
            Jobs
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
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
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/seeker-resume"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        My Resume
                      </Link>
                      <Link
                        to="/my-applications"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        My Applications
                      </Link>
                    </>
                  ) : null}
                  {user.role === "employer" ? (
                    <>
                      <Link
                        to="/employer-profile"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Employer Profile
                      </Link>
                      <Link
                        to="/post-job"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Post Job
                      </Link>
                      <Link
                        to="/my-jobs"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        My Jobs
                      </Link>
                      <Link
                        to="/employer-applications"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Job Seeker Applications
                      </Link>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
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
