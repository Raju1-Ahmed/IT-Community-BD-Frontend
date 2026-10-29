import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Skeleton, SkeletonText } from "./loaders/Skeleton";

const ProtectedRoute = ({ children, roles, loadingVariant = "default" }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    if (loadingVariant === "profile" || loadingVariant === "resume" || loadingVariant === "expert") {
      return (
        <div className="mx-[-1rem] min-h-[60vh] bg-white px-4 py-4 sm:mx-0 sm:rounded-3xl sm:border sm:border-slate-200 sm:px-6 sm:py-6 sm:shadow-sm">
          <div className="animate-pulse space-y-5">
            {loadingVariant === "profile" ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="h-7 w-44 rounded-full bg-slate-200" />
                  <div className="h-8 w-24 rounded-full bg-slate-100" />
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 sm:border sm:border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 shrink-0 rounded-3xl bg-slate-200" />
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="h-4 w-3/5 rounded-full bg-slate-200" />
                      <div className="h-3 w-2/5 rounded-full bg-slate-100" />
                      <div className="h-9 w-36 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 sm:border sm:border-slate-200">
                  <div className="mb-4 h-5 w-40 rounded-full bg-slate-200" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-11 rounded-2xl bg-white" />)}
                  </div>
                </div>
                {["Experience", "Projects", "Education", "Languages", "Certifications"].map((section) => (
                  <div key={section} className="rounded-3xl bg-slate-50 p-4 sm:border sm:border-slate-200">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="h-5 w-32 rounded-full bg-slate-200" />
                      <div className="h-8 w-16 rounded-full bg-slate-100" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-11 rounded-2xl bg-white" />
                      <div className="h-11 rounded-2xl bg-white" />
                      <div className="h-20 rounded-2xl bg-white" />
                    </div>
                  </div>
                ))}
                <div className="h-12 rounded-2xl bg-slate-200" />
                <div className="h-12 rounded-2xl bg-slate-100" />
              </>
            ) : loadingVariant === "resume" ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="h-7 w-40 rounded-full bg-slate-200" />
                  <div className="h-9 w-24 rounded-full bg-slate-100" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((item) => <div key={item} className="h-20 rounded-2xl bg-slate-100" />)}
                </div>
                <div className="h-10 w-48 rounded-full bg-slate-200" />
                <div className="h-64 rounded-3xl bg-slate-100" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2"><div className="h-3 w-28 rounded-full bg-slate-200" /><div className="h-7 w-48 rounded-full bg-slate-200" /></div>
                  <div className="h-9 w-24 rounded-full bg-slate-100" />
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 sm:border sm:border-slate-200">
                  <div className="mb-4 h-4 w-52 rounded-full bg-slate-200" />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 rounded-2xl bg-white" />)}
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 sm:border sm:border-slate-200">
                  <div className="mb-4 h-5 w-40 rounded-full bg-slate-200" />
                  <div className="space-y-3">
                    <div className="h-12 rounded-2xl bg-white" />
                    <div className="h-12 rounded-2xl bg-white" />
                    <div className="h-12 rounded-2xl bg-white" />
                    <div className="h-24 rounded-2xl bg-white" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="h-11 rounded-2xl bg-slate-200" />
                  <div className="h-11 rounded-2xl bg-slate-100" />
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

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
