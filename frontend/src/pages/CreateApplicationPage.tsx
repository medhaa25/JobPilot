import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import ApplicationForm from "@/features/applications/components/ApplicationForm";
import { useCreateApplication } from "@/features/applications/hooks/useApplications";
import { toPayload } from "@/features/applications/schemas/applicationSchema";
import { errorMessage } from "@/lib/utils";

export default function CreateApplicationPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const create = useCreateApplication();

  // Opened from a job listing: /applications/new?jobId=…&company=…&jobTitle=…&jobUrl=…
  const jobId = params.get("jobId");
  const defaults = {
    company: params.get("company") ?? "",
    jobTitle: params.get("jobTitle") ?? "",
    jobUrl: params.get("jobUrl") ?? "",
  };

  return (
    <PageContainer title="New Application">
      <Link to="/applications" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={14} /> Back to applications
      </Link>
      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
        {jobId && <p className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">Prefilled from the job listing.</p>}
        <ApplicationForm
          defaultValues={defaults}
          submitting={create.isPending}
          error={create.isError ? errorMessage(create.error) : undefined}
          onCancel={() => navigate(-1)}
          onSubmit={(values) =>
            create.mutate(
              { ...toPayload(values), jobId },
              { onSuccess: (app) => navigate(`/applications/${app.id}`, { replace: true }) },
            )
          }
        />
      </div>
    </PageContainer>
  );
}
