import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Skeleton, SkeletonText } from "./loaders/Skeleton";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-44 rounded-2xl" />
            <SkeletonText lines={2} className="max-w-xl" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
