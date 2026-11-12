import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useLogout, useMe } from "@/features/auth/hooks/useAuth";

export default function Header() {
  const { data: user } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <span className="text-sm text-slate-500">
        Welcome back{user ? <span className="font-medium text-slate-800">, {user.name}</span> : null}
      </span>
      <Button
        variant="ghost"
        size="sm"
        loading={logout.isPending}
        onClick={() => logout.mutate(undefined, { onSuccess: () => navigate("/login", { replace: true }) })}
      >
        <LogOut size={16} /> Log out
      </Button>
    </header>
  );
}
