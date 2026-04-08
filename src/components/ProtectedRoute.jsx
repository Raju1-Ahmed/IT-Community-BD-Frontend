import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoLoader from "./LogoLoader";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const useNeutralSkeleton =
    location.pathname === "/seeker-profile" ||
    location.pathname === "/seeker-resume" ||
    location.pathname === "/my-applications" ||
    location.pathname === "/saved-jobs" ||
    location.pathname === "/expert-profile" ||
    location.pathname === "/employer-profile" ||
    location.pathname === "/post-job" ||
    location.pathname === "/my-jobs" ||
    location.pathname === "/employer-applications" ||
    location.pathname.startsWith("/messages/") ||
    location.pathname.startsWith("/hire-invite/") ||
    location.pathname.startsWith("/direct-mail/") ||
    location.pathname.startsWith("/my-jobs/") ||
    location.pathname.startsWith("/employer/candidate/") ||
    location.pathname === "/admin";

  if (loading && useNeutralSkeleton) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-40 rounded-xl bg-slate-200" />
          <div className="h-4 w-72 max-w-full rounded bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-40 rounded-2xl bg-slate-100" />
            <div className="h-40 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LogoLoader variant="page" label="Checking access..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
