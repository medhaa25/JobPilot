import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import RedirectIfAuthed from "@/features/auth/components/RedirectIfAuthed";
import RequireAuth from "@/features/auth/components/RequireAuth";
import ApplicationDetailsPage from "@/pages/ApplicationDetailsPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import CreateApplicationPage from "@/pages/CreateApplicationPage";
import DashboardPage from "@/pages/DashboardPage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import JobsPage from "@/pages/JobsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import SavedJobsPage from "@/pages/SavedJobsPage";
import SignupPage from "@/pages/SignupPage";


export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  {
    element: <RedirectIfAuthed />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/signup", element: <SignupPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/jobs", element: <JobsPage /> },
          { path: "/jobs/:jobId", element: <JobDetailsPage /> },
          { path: "/saved-jobs", element: <SavedJobsPage /> },
          { path: "/applications", element: <ApplicationsPage /> },
          { path: "/applications/new", element: <CreateApplicationPage /> },
          { path: "/applications/:id", element: <ApplicationDetailsPage /> },
          // Built after the backend's core is stable
          // { path: "/interviews", element: later("Interviews") },
          // { path: "/analytics", element: later("Analytics") },
          // { path: "/profile", element: later("Profile") },
          // { path: "/settings", element: later("Account Settings") },
          // { path: "/settings/preferences", element: later("Job Preferences") },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
