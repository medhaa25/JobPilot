import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/utils";
import { useSignup } from "../hooks/useAuth";
import { signupSchema, type SignupValues } from "../schemas/authSchemas";

export default function SignupForm() {
  const navigate = useNavigate();
  const signup = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = handleSubmit(({ name, email, password }) =>
    signup.mutate({ name, email, password }, { onSuccess: () => navigate("/dashboard", { replace: true }) }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
        <p className="text-sm text-slate-500">Track every application in one place.</p>
      </div>
      <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {signup.isError && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage(signup.error)}
        </p>
      )}
      <Button type="submit" loading={signup.isPending} className="w-full">
        Sign up
      </Button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
