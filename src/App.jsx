import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/HomeFinal";
import Jobs from "./pages/JobsModern";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJobSchemaForm";
import MyJobs from "./pages/MyJobsEnhanced";
import MyJobDetails from "./pages/MyJobDetails";
import MyApplications from "./pages/MyApplications";
import SavedJobs from "./pages/SavedJobs";
import AdminDashboard from "./pages/AdminDashboard";
import SeekerProfile from "./pages/SeekerProfile";
import SeekerResume from "./pages/SeekerResume";
import EmployerProfile from "./pages/EmployerProfile";
import EmployerApplications from "./pages/EmployerApplicationsEnhanced";
import EmployerCandidateProfile from "./pages/EmployerCandidateProfile";
import AppointExpertise from "./pages/AppointExpertiseEnhanced";
import AppointExpertiseDetails from "./pages/AppointExpertiseDetails";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import LoaderShowcase from "./pages/LoaderShowcase";
import Expert from "./dashboard/Expert";
import AdminPremiumQueue from "./dashboard/AdminPremiumQueue";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/loader-showcase" element={<LoaderShowcase />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/appoint-expertise" element={<AppointExpertise />} />
        <Route path="/appoint-expertise/:id" element={<AppointExpertiseDetails />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute roles={["employer", "admin"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute roles={["employer", "admin"]}>
              <MyJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs/:id"
          element={
            <ProtectedRoute roles={["employer", "admin"]}>
              <MyJobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer-profile"
          element={
            <ProtectedRoute roles={["employer", "admin"]}>
              <EmployerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer-applications"
          element={
            <ProtectedRoute roles={["employer", "admin"]}>
              <EmployerApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/candidate/:id"
          element={
            <ProtectedRoute roles={["employer", "admin"]}>
              <EmployerCandidateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute roles={["seeker", "admin"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute roles={["seeker", "admin"]}>
              <SavedJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seeker-profile"
          element={
            <ProtectedRoute roles={["seeker", "admin"]}>
              <SeekerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seeker-resume"
          element={
            <ProtectedRoute roles={["seeker", "admin"]}>
              <SeekerResume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expert-profile"
          element={
            <ProtectedRoute roles={["seeker"]}>
              <Expert />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/premium/form"
          element={
            <Navigate to="/expert-profile" replace />
          }
        />
        <Route path="/dashboard/premium" element={<Navigate to="/expert-profile" replace />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/premium-queue"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPremiumQueue />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
