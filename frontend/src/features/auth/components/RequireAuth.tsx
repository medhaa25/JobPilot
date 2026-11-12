import { Navigate, Outlet } from "react-router-dom";
import { PageSpinner } from "@/components/ui/Spinner";
import { useMe } from "../hooks/useAuth";

/** Guards every dashboard route: logged-out users go to /login. */
export default function RequireAuth() {
  const { data: user, isLoading } = useMe();
  if (isLoading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
