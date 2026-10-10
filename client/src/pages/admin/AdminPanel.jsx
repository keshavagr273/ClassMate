import React, { useState } from "react";
import { Bell, LayoutDashboard, Menu, X } from "lucide-react";
import NotificationsAdmin from "../../components/admin/NotificationsAdmin";
import AdminDashboard from "../../components/admin/AdminDashboard";
import { Eyebrow, IconButton, cn } from "../../components/ui";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "notifications", label: "Notifications", icon: Bell },
];

/**
 * Admin chrome. The sidebar used to be positioned by a window.resize listener
 * writing to React state; it is pure CSS now, so there is no resize handler
 * and no state to get out of sync with the viewport.
 */
const AdminPanel = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-60 shrink-0 border-r border-line bg-surface pt-20",
          "transition-transform duration-200 ease-standard",
          "lg:sticky lg:top-14 lg:z-0 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:pt-6",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5">
          <Eyebrow>Admin</Eyebrow>
        </div>
        <nav className="mt-4 flex flex-col gap-0.5 px-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActivePage(id);
                setIsSidebarOpen(false);
              }}
              aria-current={activePage === id ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-chip px-3 py-2.5 text-ui font-medium",
                "transition-colors duration-150 ease-standard",
                activePage === id
                  ? "bg-surface-3 text-ink"
                  : "text-ink-3 hover:bg-surface-2 hover:text-ink"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile controls */}
      <IconButton
        icon={isSidebarOpen ? X : Menu}
        label={isSidebarOpen ? "Close admin menu" : "Open admin menu"}
        variant="subtle"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="fixed left-4 top-20 z-40 lg:hidden"
      />
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          className="fixed inset-0 z-20 bg-canvas/70 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="min-w-0 flex-1 px-5 py-10 pt-20 sm:px-8 lg:pt-10">
        {activePage === "notifications" ? (
          <NotificationsAdmin />
        ) : (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
