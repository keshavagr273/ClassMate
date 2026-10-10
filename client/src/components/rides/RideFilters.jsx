import React, { useState } from "react";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  Clock,
  GraduationCap,
  School,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { Button, Chip, Input, Select, cn } from "../ui";

/**
 * Note on the contract: onSearchChange receives the VALUE, not the event.
 * The page's handler previously read e.target.value from it, which would have
 * thrown the moment this component was actually rendered.
 *
 * The quick filters used emoji as their icons; they are lucide glyphs now.
 */
const quickFilters = [
  { label: "Today", icon: Clock, value: "today", type: "dateRange" },
  { label: "Tomorrow", icon: CalendarDays, value: "tomorrow", type: "dateRange" },
  { label: "This week", icon: CalendarDays, value: "week", type: "dateRange" },
  { label: "2+ seats", icon: Users, value: 2, type: "minSeats" },
  { label: "Under ₹100", icon: Banknote, value: 100, type: "maxPrice" },
  {
    label: "To college",
    icon: GraduationCap,
    value: "toCollege",
    type: "direction",
  },
  {
    label: "From college",
    icon: School,
    value: "fromCollege",
    type: "direction",
  },
];

const dateOptions = [
  { label: "Any date", value: "" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This week", value: "week" },
  { label: "Next week", value: "nextWeek" },
  { label: "Custom range", value: "custom" },
];

const RideFilters = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  clearAllFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount =
    Object.entries(filters).reduce((acc, [key, value]) => {
      if (key !== "sortBy" && value !== null && value !== "all" && value !== "")
        return acc + 1;
      return acc;
    }, 0) + (searchTerm ? 1 : 0);

  const isActive = (type, value) => filters[type] === value;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          placeholder="Search by pickup or drop location"
          value={searchTerm || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={Search}
          wrapperClassName="flex-1"
        />
        <Button
          variant="outline"
          leadingIcon={SlidersHorizontal}
          onClick={() => setShowAdvanced((prev) => !prev)}
          aria-expanded={showAdvanced}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="numeric ml-1 rounded-full bg-accent px-1.5 text-micro text-canvas">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" leadingIcon={X} onClick={clearAllFilters}>
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => {
          const active = isActive(filter.type, filter.value);
          return (
            <Chip
              key={filter.label}
              icon={filter.icon}
              active={active}
              onClick={() =>
                onFilterChange(filter.type, active ? null : filter.value)
              }
            >
              {filter.label}
            </Chip>
          );
        })}
      </div>

      {showAdvanced && (
        <div
          className={cn(
            "grid gap-4 rounded-card border border-line bg-surface p-4",
            "sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          <Select
            label="Date"
            value={filters.dateRange || ""}
            onChange={(e) => onFilterChange("dateRange", e.target.value || null)}
          >
            {dateOptions.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <Select
            label="Direction"
            value={filters.direction || ""}
            onChange={(e) => onFilterChange("direction", e.target.value || null)}
          >
            <option value="">Any direction</option>
            <option value="toCollege">To college</option>
            <option value="fromCollege">From college</option>
          </Select>

          <Input
            label="Minimum seats"
            type="number"
            min="1"
            max="8"
            value={filters.minSeats ?? ""}
            onChange={(e) =>
              onFilterChange("minSeats", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Any"
          />

          <Input
            label="Maximum price"
            type="number"
            min="0"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onFilterChange("maxPrice", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Any"
          />

          {filters.dateRange === "custom" && (
            <>
              <Input
                label="From"
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  onFilterChange("startDate", e.target.value || null)
                }
              />
              <div className="flex items-end pb-3 text-ink-4 max-sm:hidden">
                <ArrowRight className="size-4" aria-hidden />
              </div>
              <Input
                label="To"
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  onFilterChange("endDate", e.target.value || null)
                }
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RideFilters;
