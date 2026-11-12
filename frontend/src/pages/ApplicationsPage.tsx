import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { buttonStyles } from "@/components/ui/Button";
import KanbanBoard from "@/features/applications/components/KanbanBoard";
import { useApplications, useMoveApplication } from "@/features/applications/hooks/useApplications";
import { errorMessage } from "@/lib/utils";

export default function ApplicationsPage() {
  const { data, isLoading, isError, error, refetch } = useApplications();
  const move = useMoveApplication();

  const newButton = (
    <Link to="/applications/new" className={buttonStyles("primary")}>
      <Plus size={16} /> New application
    </Link>
  );

  return (
    <PageContainer
      title="My Applications"
      description="Drag cards between columns to update their status."
      actions={newButton}
    >
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-72 w-72 shrink-0" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Add your first application to start tracking your progress."
          action={newButton}
        />
      ) : (
        <>
          {move.isError && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              Couldn't update that application: {errorMessage(move.error)}
            </p>
          )}
          <KanbanBoard applications={data} onMove={(id, status) => move.mutate({ id, status })} />
        </>
      )}
    </PageContainer>
  );
}
