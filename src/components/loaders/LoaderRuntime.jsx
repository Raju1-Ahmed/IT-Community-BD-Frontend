import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LogoLoader from "../LogoLoader";
import { bindApiLoader } from "../../api/client";
import { useLoader } from "../../hooks/useLoader";
import TopProgressBar from "./TopProgressBar";

const LoaderRuntime = () => {
  const { increment, decrement, visible, pendingCount, routeLoading } = useLoader();
  const location = useLocation();
  const suppressBrandOverlay =
    location.pathname === "/my-profile" ||
    location.pathname === "/seeker-profile" ||
    location.pathname === "/seeker-resume" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/contact" ||
    location.pathname === "/about" ||
    location.pathname === "/forum" ||
    location.pathname === "/my-applications" ||
    location.pathname === "/saved-jobs" ||
    location.pathname === "/expert-profile" ||
    location.pathname === "/employer-profile" ||
    location.pathname === "/post-job" ||
    location.pathname === "/my-jobs" ||
    location.pathname === "/employer-applications" ||
    location.pathname === "/messages" ||
    location.pathname.startsWith("/messages/") ||
    location.pathname.startsWith("/hire-invite/") ||
    location.pathname.startsWith("/direct-mail/") ||
    location.pathname.startsWith("/my-jobs/") ||
    location.pathname.startsWith("/employer/candidate/") ||
    location.pathname === "/admin" ||
    location.pathname.startsWith("/jobs/");

  useEffect(() => {
    bindApiLoader({ increment, decrement });
    return () => bindApiLoader(null);
  }, [increment, decrement]);

  const shouldShowOverlay = visible && routeLoading && pendingCount === 0 && !suppressBrandOverlay;

  return (
    <>
      <TopProgressBar />
      {shouldShowOverlay ? (
        <div className="pointer-events-none fixed inset-0 z-[110] flex items-start justify-center bg-white/35 px-4 pt-24 backdrop-blur-[2px]">
          <LogoLoader
            variant="inline"
            size="sm"
            speed="fast"
            label="Loading page..."
            className="rounded-full border border-white/70 bg-white/90 px-5 py-3 shadow-lg"
          />
        </div>
      ) : null}
    </>
  );
};

export default LoaderRuntime;
