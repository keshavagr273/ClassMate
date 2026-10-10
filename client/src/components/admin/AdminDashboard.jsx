import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LayoutGrid, List, Search, UserPlus, Users } from "lucide-react";
import { fetchAllUsers } from "../../slices/authSlice";
import UserCard from "./UserCard";
import ErrorDisplay from "../../utils/ErrorDisplay";
import {
  Card,
  EmptyState,
  Eyebrow,
  IconButton,
  Input,
  SectionHeader,
  Select,
  SkeletonCard,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "../ui";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { allUsers = [], isLoading, error } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allUsers
      .filter(
        (user) =>
          !term ||
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.id?.toString().includes(searchTerm)
      )
      .sort((a, b) => {
        switch (sortOption) {
          case "oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "alphabetical":
            return (a.name || "").localeCompare(b.name || "");
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [allUsers, searchTerm, sortOption]);

  const recentUsers = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return allUsers.filter((user) => new Date(user.createdAt) > oneWeekAgo)
      .length;
  }, [allUsers]);

  return (
    <div>
      <SectionHeader
        eyebrow="Users"
        title="User control"
        description="Everyone with a ClassMate account, and when they joined."
        size="h2"
      />

      {/* Two stat tiles. The old grid declared four columns for two tiles. */}
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          [Users, "Total users", allUsers.length],
          [UserPlus, "Joined this week", recentUsers],
        ].map(([Icon, label, value]) => (
          <Card key={label} className="flex items-center gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-chip border border-line-2 bg-surface-2 text-ink-3">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <div>
              <dd className="numeric font-display text-h3 font-bold text-ink">
                {value}
              </dd>
              <dt className="text-eyebrow uppercase text-ink-4">{label}</dt>
            </div>
          </Card>
        ))}
      </dl>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Search by name, email or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leadingIcon={Search}
          wrapperClassName="flex-1"
        />
        <Select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="sm:w-44"
          aria-label="Sort order"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="alphabetical">Name (A–Z)</option>
        </Select>
        <div className="flex gap-1 rounded-chip border border-line p-0.5">
          <IconButton
            icon={LayoutGrid}
            label="Grid view"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={
              viewMode === "grid" ? "bg-surface-3 text-ink" : undefined
            }
          />
          <IconButton
            icon={List}
            label="List view"
            size="sm"
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list" ? "bg-surface-3 text-ink" : undefined
            }
          />
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorDisplay
            error={error}
            onRetry={() => dispatch(fetchAllUsers())}
            messagePrefix="Users: "
          />
        </div>
      )}

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <Eyebrow>Accounts</Eyebrow>
          <span className="numeric text-micro text-ink-4">
            {filteredUsers.length}
            {searchTerm && allUsers.length ? ` of ${allUsers.length}` : ""}
          </span>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchTerm ? "Nobody matches that search" : "No users yet"}
              description={
                searchTerm
                  ? "Try a different name, email or ID."
                  : "Accounts will appear here as students sign up."
              }
            />
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Joined</TH>
                </TR>
              </THead>
              <TBody>
                {filteredUsers.map((user) => (
                  <TR key={user.id} interactive>
                    <TD className="font-medium text-ink">{user.name || "—"}</TD>
                    <TD>{user.email}</TD>
                    <TD>
                      <time>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </time>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
