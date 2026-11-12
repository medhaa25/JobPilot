import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return <LoaderCircle size={size} className={cn("animate-spin", className)} aria-label="Loading" />;
}

export function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center text-indigo-600">
      <Spinner size={32} />
    </div>
  );
}
