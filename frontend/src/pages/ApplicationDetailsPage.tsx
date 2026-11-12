import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
// import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import ApplicationForm from "@/features/applications/components/ApplicationForm";
import StatusBadge from "@/features/applications/components/StatusBadge";
import { STATUS_OPTIONS, statusMeta } from "@/features/applications/constants";
import {
  useApplication,
  useApplicationEvents,
  // useApplicationInterviews,
  useDeleteApplication,
  useUpdateApplication,
} from "@/features/applications/hooks/useApplications";
import { toPayload } from "@/features/applications/schemas/applicationSchema";
import { errorMessage, formatDate, formatDateTime } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

export default function ApplicationDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: app, isLoading, isError, error, refetch } = useApplication(id);
  const events = useApplicationEvents(id);
  // const interviews = useApplicationInterviews(id);
  const update = useUpdateApplication();
  const remove = useDeleteApplication();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const back = (
    <Link to="/applications" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
      <ArrowLeft size={14} /> Back to applications
    </Link>
  );

  if (isLoading)
    return (
      <PageContainer title="Application Details">
        <Skeleton className="h-72" />
      </PageContainer>
    );

  if (isError || !app)
    return (
      <PageContainer title="Application Details">
        {back}
        <ErrorState message={errorMessage(error, "Application not found")} onRetry={() => void refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer
      title={app.jobTitle}
      description={app.company}
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil size={14} /> Edit
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      }
    >
      {back}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-56">
              <Select
                label="Status"
                value={app.status}
                disabled={update.isPending}
                onChange={(e) => update.mutate({ id, data: { status: e.target.value as ApplicationStatus } })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <StatusBadge status={app.status} />
          </div>
          {update.isError && (
            <p role="alert" className="text-sm text-red-600">
              {errorMessage(update.error)}
            </p>
          )}

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Company</dt>
              <dd className="font-medium text-slate-800">{app.company}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Job title</dt>
              <dd className="font-medium text-slate-800">{app.jobTitle}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Application date</dt>
              <dd className="font-medium text-slate-800">{formatDate(app.appliedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Job URL</dt>
              <dd className="font-medium">
                {app.jobUrl ? (
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                    Open listing <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-slate-800">—</span>
                )}
              </dd>
            </div>
          </dl>

          <div>
            <h2 className="mb-1 text-sm font-semibold text-slate-900">Notes</h2>
            <p className="whitespace-pre-line text-sm text-slate-700">{app.notes ?? "No notes yet."}</p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 font-semibold text-slate-900">Status history</h2>
            {events.isLoading ? (
              <Skeleton className="h-20" />
            ) : events.isError ? (
              <ErrorState message={errorMessage(events.error)} onRetry={() => void events.refetch()} />
            ) : (
              <ol className="space-y-3 border-l border-slate-200 pl-4">
                {events.data?.map((e) => (
                  <li key={e.id} className="text-sm">
                    <p className="font-medium text-slate-800">
                      {e.fromStatus ? `${statusMeta(e.fromStatus).label} → ` : "Created as "}
                      {statusMeta(e.toStatus).label}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(e.createdAt)}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 font-semibold text-slate-900">Interview rounds</h2>
            {interviews.isLoading ? (
              <Skeleton className="h-20" />
            ) : interviews.isError ? (
              <ErrorState message={errorMessage(interviews.error)} onRetry={() => void interviews.refetch()} />
            ) : !interviews.data || interviews.data.length === 0 ? (
              <p className="text-sm text-slate-500">No interviews scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {interviews.data.map((i) => (
                  <li key={i.id} className="text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">
                        {i.round} · {i.type}
                      </span>
                      <Badge tone={i.completed ? "green" : "amber"}>{i.completed ? "Done" : "Upcoming"}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{formatDateTime(i.scheduledAt)}</p>
                    {i.meetingLink && (
                      <a href={i.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                        Meeting link
                      </a>
                    )}
                    {i.notes && <p className="mt-1 text-xs text-slate-600">{i.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section> */}
        </aside>
      </div>

      <Modal open={editing} title="Edit application" onClose={() => setEditing(false)}>
        <ApplicationForm
          defaultValues={{
            company: app.company,
            jobTitle: app.jobTitle,
            jobUrl: app.jobUrl ?? "",
            appliedAt: app.appliedAt?.slice(0, 10) ?? "",
            status: app.status,
            notes: app.notes ?? "",
          }}
          submitLabel="Save changes"
          submitting={update.isPending}
          error={update.isError ? errorMessage(update.error) : undefined}
          onCancel={() => setEditing(false)}
          onSubmit={(values) => update.mutate({ id, data: toPayload(values) }, { onSuccess: () => setEditing(false) })}
        />
      </Modal>

      <Modal open={confirmDelete} title="Delete application?" onClose={() => setConfirmDelete(false)}>
        <p className="text-sm text-slate-600">
          This permanently removes <strong>{app.jobTitle}</strong> at {app.company}, along with its history.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={() => remove.mutate(id, { onSuccess: () => navigate("/applications", { replace: true }) })}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
