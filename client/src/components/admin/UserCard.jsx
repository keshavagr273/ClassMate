import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge, Card, IconButton, cn } from "../ui";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

/**
 * Note: this card previously rendered Edit and Delete buttons that had no
 * onClick handlers at all — they did nothing. They are left out rather than
 * given invented behaviour; wiring real admin mutations is a separate change.
 */
const UserCard = React.memo(function UserCard({ user }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const createdAt = useMemo(() => formatDate(user?.createdAt), [user?.createdAt]);
  const updatedAt = useMemo(() => formatDate(user?.updatedAt), [user?.updatedAt]);

  if (!user) return null;

  const initial =
    user.name?.charAt(0)?.toUpperCase() ||
    user.username?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line-2 bg-surface-2 font-display font-bold text-ink-2">
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-ui font-medium text-ink">
            {user.name || "Unnamed"}
          </p>
          <p className="truncate text-micro text-ink-4">{user.email}</p>
        </div>

        <IconButton
          icon={ChevronDown}
          label={isExpanded ? "Show less" : "Show more"}
          size="sm"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={cn(
            "shrink-0 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      {user.roles?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {user.roles.map((role) => (
            <Badge key={role} tone={role === "admin" ? "accent" : "neutral"}>
              {role}
            </Badge>
          ))}
        </div>
      )}

      {isExpanded && (
        <dl className="border-t border-line text-meta">
          {[
            ["ID", user.id],
            ["Branch", user.branch],
            ["Semester", user.semester],
            ["Registration", user.registration_number],
            ["Joined", createdAt],
            ["Updated", updatedAt],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline gap-3 border-b border-line py-2 last:border-0"
            >
              <dt className="w-28 shrink-0 text-ink-4">{label}</dt>
              <dd className="min-w-0 flex-1 truncate text-ink-2">
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
});

export default UserCard;
