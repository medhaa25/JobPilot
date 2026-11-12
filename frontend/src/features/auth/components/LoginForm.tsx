import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/utils";
import { useLogin } from "../hooks/useAuth";
import { loginSchema, type LoginValues } from "../schemas/authSchemas";

export default function LoginForm() {
  const navigate = useNavigate();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, { onSuccess: () => navigate("/dashboard", { replace: true }) }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-500">Log in to manage your job search.</p>
      </div>
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {login.isError && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage(login.error)}
        </p>
      )}
      <Button type="submit" loading={login.isPending} className="w-full">
        Log in
      </Button>
      <p className="text-center text-sm text-slate-600">
        No account?{" "}
        <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
