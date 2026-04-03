import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoaderRuntime from "../components/loaders/LoaderRuntime";
import { useLoader } from "../hooks/useLoader";

const MainLayout = () => {
  const location = useLocation();
  const { beginRouteLoad, endRouteLoad } = useLoader();

  useEffect(() => {
    beginRouteLoad();
    const timer = setTimeout(() => {
      endRouteLoad();
    }, 220);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search, beginRouteLoad, endRouteLoad]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-teal-50 via-white to-white">
      <LoaderRuntime />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
