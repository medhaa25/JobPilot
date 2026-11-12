import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { STATUS_OPTIONS } from "../constants";
import { applicationSchema, type ApplicationFormValues } from "../schemas/applicationSchema";

interface Props {
  defaultValues?: Partial<ApplicationFormValues>;
  onSubmit: (values: ApplicationFormValues) => void;
  submitting?: boolean;
  submitLabel?: string;
  error?: string;
  onCancel?: () => void;
}

/** Used for both "Create application" and "Edit application". */
export default function ApplicationForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = "Save application",
  error,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { company: "", jobTitle: "", jobUrl: "", appliedAt: "", status: "SAVED", notes: "", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input label="Company" error={errors.company?.message} {...register("company")} />
      <Input label="Job title" error={errors.jobTitle?.message} {...register("jobTitle")} />
      <Input label="Job URL" type="url" placeholder="https://" error={errors.jobUrl?.message} {...register("jobUrl")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Application date" type="date" error={errors.appliedAt?.message} {...register("appliedAt")} />
        <Select label="Current status" error={errors.status?.message} {...register("status")}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <Textarea label="Notes" placeholder="Referrals, contacts, things to prepare…" error={errors.notes?.message} {...register("notes")} />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
