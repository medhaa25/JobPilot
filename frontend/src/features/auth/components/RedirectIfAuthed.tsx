import { Navigate, Outlet } from "react-router-dom";
import { PageSpinner } from "@/components/ui/Spinner";
import { useMe } from "../hooks/useAuth";

/** Wraps /login and /signup: logged-in users go to /dashboard. */
export default function RedirectIfAuthed() {
  const { data: user, isLoading } = useMe();
  if (isLoading) return <PageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
