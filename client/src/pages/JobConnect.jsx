import React, { useState } from "react";
import axios from "axios";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Clock3,
  Globe,
  MapPin,
  Search,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Eyebrow,
  Input,
  PageShell,
  SectionHeader,
  Select,
  SkeletonCard,
} from "../components/ui";

const defaultFilters = {
  job_category: "Software Development",
  location: "",
  work_from_home: false,
  stipend: "",
  radius: "",
};

const radiusOptions = [
  { value: "", label: "Any distance" },
  { value: "0", label: "Exact location" },
  { value: "4", label: "Within 4 km" },
  { value: "8", label: "Within 8 km" },
  { value: "16", label: "Within 16 km" },
  { value: "26", label: "Within 26 km" },
  { value: "40", label: "Within 40 km" },
  { value: "80", label: "Within 80 km" },
];

/* ------------------------------------------------------------------ JobCard */

const JobCard = ({ job }) => (
  <Card interactive className="flex flex-col gap-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-h4 text-ink">{job.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-meta text-ink-3">
          <Building2 className="size-3.5 shrink-0" aria-hidden />
          {job.company}
        </p>
      </div>
      <Badge tone={job.work_from_home ? "accent" : "neutral"}>
        {job.work_from_home ? "Remote" : "On-site"}
      </Badge>
    </div>

    <dl className="flex flex-col gap-1.5 border-t border-line pt-3 text-meta">
      {[
        [MapPin, "Location", job.location],
        [Wallet, "Stipend", job.stipend],
        [Clock3, "Duration", job.duration],
      ].map(([Icon, label, value]) =>
        value ? (
          <div key={label} className="flex items-center gap-2">
            <Icon className="size-3.5 shrink-0 text-ink-4" aria-hidden />
            <dt className="text-ink-4">{label}</dt>
            <dd className="ml-auto text-right text-ink-2">{value}</dd>
          </div>
        ) : null
      )}
    </dl>

    <Button
      as="a"
      href={job.apply_link}
      target="_blank"
      rel="noopener noreferrer"
      variant="outline"
      size="sm"
      trailingIcon={ArrowUpRight}
      className="mt-auto self-start"
    >
      Apply
    </Button>
  </Card>
);

/* --------------------------------------------------------------- JobConnect */

export default function JobConnect() {
  const [filters, setFilters] = useState(defaultFilters);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Keyed by `name`, so the five name attributes below must keep matching the
  // keys of defaultFilters.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const fetchInternships = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInternships([]);
    setSearched(true);

    try {
      const payload = { ...filters, max_results: 12 };
      const apiBase = import.meta.env.VITE_API_URL || "";

      const { data } = await axios.post(
        `${apiBase}/internships/fetch`,
        payload,
        {
          timeout: 180000,
          headers: { "Content-Type": "application/json" },
        }
      );

      setInternships(data.internships);
    } catch (err) {
      let errorMessage = "Failed to fetch jobs.";
      if (err.code === "ECONNABORTED") {
        errorMessage =
          "The request timed out. Searching can take a while — try again.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell width="wide">
      <SectionHeader
        eyebrow="JobConnect"
        tone="jobs"
        rule
        title="Internships and jobs"
        description="Pulled from trusted boards and filtered by field, city, pay and remote status."
        size="h2"
      />

      <Card padding="lg" className="mt-10">
        <form onSubmit={fetchInternships} className="flex flex-col gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              name="job_category"
              label="Field of interest"
              value={filters.job_category}
              onChange={handleChange}
              placeholder="e.g. Web Development"
            />
            <Input
              name="location"
              label="Location"
              value={filters.location}
              onChange={handleChange}
              placeholder="e.g. Delhi, Remote"
            />
            <Input
              name="stipend"
              label="Minimum pay"
              inputMode="numeric"
              value={filters.stipend}
              onChange={handleChange}
              placeholder="e.g. 5000"
              hint="In rupees per month"
            />
            <Select
              name="radius"
              label="Search radius"
              value={filters.radius}
              onChange={handleChange}
            >
              {radiusOptions.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-5 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Checkbox
              name="work_from_home"
              label="Remote roles only"
              checked={filters.work_from_home}
              onChange={handleChange}
            />
            <Button
              type="submit"
              loading={loading}
              leadingIcon={Search}
              className="sm:w-auto"
            >
              {loading ? "Searching…" : "Find jobs"}
            </Button>
          </div>
        </form>
      </Card>

      <section className="mt-12">
        {loading && (
          <>
            <Eyebrow>Searching</Eyebrow>
            <p className="mt-2 text-ui text-ink-3">
              Querying job boards. This can take up to a minute.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        )}

        {!loading && error && (
          <EmptyState
            tone="critical"
            title="That search did not go through"
            description={error}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchInternships({ preventDefault() {} })}
              >
                Try again
              </Button>
            }
          />
        )}

        {!loading && !error && internships.length > 0 && (
          <>
            <SectionHeader
              eyebrow={`${internships.length} results`}
              title="Matches"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {internships.map((job, idx) => (
                <JobCard key={`${job.title}-${idx}`} job={job} />
              ))}
            </div>
          </>
        )}

        {!loading && !error && searched && internships.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nothing matched those filters"
            description="Try widening the search radius, lowering the minimum pay, or using a broader field."
          />
        )}

        {!loading && !error && !searched && (
          <EmptyState
            icon={Globe}
            title="Set your filters and search"
            description="Results come from live job boards, so they change day to day."
          />
        )}
      </section>
    </PageShell>
  );
}
