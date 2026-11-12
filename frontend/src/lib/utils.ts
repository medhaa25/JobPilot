import axios from "axios";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const dateFmt = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

function parseDate(value: string): Date {
  // "2026-10-28" should be a local calendar day, not UTC midnight.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = parseDate(value);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateTimeFmt.format(d);
}

export function formatSalary(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  const f = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min != null && max != null) return `${f(min)} – ${f(max)}`;
  return f((min ?? max) as number);
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(err)) return (err.response?.data as { message?: string } | undefined)?.message ?? err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}
