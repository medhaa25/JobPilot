import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

interface Common {
  label?: string;
  error?: string;
}

function Field({ id, label, error, children }: Common & { id: string; children: ReactNode }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const tone = (error?: string) => (error ? "border-red-400" : "border-slate-300");

export function Input({ label, error, className, id, ...props }: ComponentProps<"input"> & Common) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field id={fieldId} label={label} error={error}>
      <input id={fieldId} aria-invalid={!!error} className={cn(base, tone(error), className)} {...props} />
    </Field>
  );
}

export function Select({ label, error, className, id, children, ...props }: ComponentProps<"select"> & Common) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field id={fieldId} label={label} error={error}>
      <select id={fieldId} aria-invalid={!!error} className={cn(base, tone(error), className)} {...props}>
        {children}
      </select>
    </Field>
  );
}

export function Textarea({ label, error, className, id, ...props }: ComponentProps<"textarea"> & Common) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field id={fieldId} label={label} error={error}>
      <textarea id={fieldId} rows={4} aria-invalid={!!error} className={cn(base, tone(error), className)} {...props} />
    </Field>
  );
}
