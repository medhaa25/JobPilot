import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useDebounce } from "@/hooks/useDebounce";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, JOB_SOURCES } from "../constants";
import type { JobFilters as Filters, JobSort } from "../types";

interface Props {
  value: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

export default function JobFilters({ value, onChange, onReset }: Props) {
  // Typing is local state; the filter updates once the user pauses.
  const [q, setQ] = useState(value.q);
  const [location, setLocation] = useState(value.location);
  const debouncedQ = useDebounce(q);
  const debouncedLocation = useDebounce(location);

  useEffect(() => {
    if (debouncedQ !== value.q) onChange({ q: debouncedQ });
  }, [debouncedQ]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debouncedLocation !== value.location) onChange({ location: debouncedLocation });
  }, [debouncedLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label="Search by job title or company"
          placeholder="Search by job title or company"
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          aria-label="Location"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Select
          aria-label="Experience level"
          value={value.experienceLevel}
          onChange={(e) => onChange({ experienceLevel: e.target.value })}
        >
          <option value="">Any experience</option>
          {EXPERIENCE_LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </Select>
        <Select
          aria-label="Employment type"
          value={value.employmentType}
          onChange={(e) => onChange({ employmentType: e.target.value })}
        >
          <option value="">Any type</option>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
        <Select aria-label="Source" value={value.source} onChange={(e) => onChange({ source: e.target.value })}>
          <option value="">Any source</option>
          {JOB_SOURCES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select
          aria-label="Sort by posting date"
          value={value.sort}
          onChange={(e) => onChange({ sort: e.target.value as JobSort })}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQ("");
            setLocation("");
            onReset();
          }}
        >
          Reset filters
        </Button>
      </div>
    </div>
  );
}
