import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Bell, Menu, Search, User, X } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "../../../slices/notificationSlice";
import { Badge, Eyebrow, IconButton, cn } from "../../ui";
import CommandPalette from "./CommandPalette";

const navLinks = [
  { name: "SkillSwap", path: "/skill-exchange" },
  { name: "ClassPulse", path: "/attendance" },
  { name: "CampusBazaar", path: "/marketplace" },
  { name: "FoundIt!", path: "/lost-found" },
  { name: "RideLoop", path: "/rides" },
  { name: "JobConnect", path: "/job-connect" },
];

const ease = [0.16, 1, 0.3, 1];

/* ------------------------------------------------------- notification panel */

const NotificationPanel = ({ notifications, loading, onMarkAllRead }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.16, ease }}
    className={cn(
      "absolute right-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))]",
      "overflow-hidden rounded-card border border-line-2 bg-surface shadow-overlay"
    )}
  >
    <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
      <Eyebrow>Notifications</Eyebrow>
      <button
        type="button"
        onClick={onMarkAllRead}
        className="text-micro text-ink-3 transition-colors hover:text-ink"
      >
        Mark all read
      </button>
    </header>

    <div className="max-h-[22rem] overflow-y-auto">
      {loading ? (
        <p className="px-4 py-6 text-meta text-ink-4">Loading…</p>
      ) : notifications?.length ? (
        notifications.map((notif) => (
          <article
            key={notif.id}
            className={cn(
              "border-b border-line px-4 py-3 last:border-0",
              !notif.is_read && "bg-surface-2"
            )}
          >
            <p className="text-meta text-ink">{notif.message}</p>
            <time className="mt-1 block text-micro text-ink-4">
              {formatDistanceToNow(new Date(notif.createdAt), {
                addSuffix: true,
              })}
            </time>
          </article>
        ))
      ) : (
        <p className="px-4 py-6 text-meta text-ink-4">You are all caught up.</p>
      )}
    </div>
  </motion.div>
);

/* ------------------------------------------------------------------ navbar  */

function NavBar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
  } = useSelector((state) => state.notifications);

  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const notificationPanelRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) dispatch(getNotifications());
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(
        event.target?.tagName || ""
      ) || event.target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close the drawer on navigation, and lock scroll while it is open.
  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const linkClass = ({ isActive }) =>
    cn(
      "relative py-1 text-meta font-medium transition-colors duration-150",
      "after:absolute after:-bottom-px after:left-0 after:h-px after:bg-accent after:transition-all after:duration-200",
      isActive
        ? "text-ink after:w-full"
        : "text-ink-3 hover:text-ink after:w-0 hover:after:w-full"
    );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="ClassMate home"
          >
            <img
              src="/favicon.png"
              alt=""
              className="size-7 rounded-chip object-contain"
            />
            <span className="font-display text-h4 font-bold tracking-tight text-ink">
              ClassMate
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={linkClass}>
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            {/* A search affordance rather than an always-open field: the old
                input carried a `form-input` class that resolved to nothing. */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search ClassMate"
              className={cn(
                "hidden items-center gap-2 rounded-full border border-line-2 bg-surface-2 py-1.5 pl-3 pr-2",
                "text-meta text-ink-4 transition-colors duration-150 hover:border-line-3 hover:text-ink-2 sm:flex"
              )}
            >
              <Search className="size-3.5" aria-hidden />
              <span>Search</span>
              <kbd className="ml-2 rounded border border-line-2 bg-surface-3 px-1.5 py-0.5 font-sans text-[10px] text-ink-4">
                /
              </kbd>
            </button>

            {/* Notifications are for signed-in users only. The bell used to
                render for everyone, so a signed-out visitor on the landing
                page could fire markAllNotificationsAsRead — whose thunk raises
                its own "Error marking all notifications as read" toast. */}
            {isAuthenticated && (
              <div className="relative" ref={notificationPanelRef}>
                <IconButton
                  icon={Bell}
                  label="Notifications"
                  variant="subtle"
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  className="relative"
                />
                {unreadCount > 0 && (
                  <span
                    className="pointer-events-none absolute right-1.5 top-1.5 size-2 rounded-full bg-critical ring-2 ring-canvas"
                    aria-hidden
                  />
                )}
                <AnimatePresence>
                  {isNotificationOpen && (
                    <NotificationPanel
                      notifications={notifications}
                      loading={notificationsLoading}
                      onMarkAllRead={() =>
                        dispatch(markAllNotificationsAsRead())
                      }
                    />
                  )}
                </AnimatePresence>
              </div>
            )}

            {isAuthenticated && user ? (
              <Link
                to="/profile"
                aria-label="Your profile"
                className="ml-0.5 shrink-0"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="size-8 rounded-full border border-line-2 object-cover"
                  />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full border border-line-2 bg-surface-2 text-ink-2">
                    <User className="size-4" aria-hidden />
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="ml-1 hidden rounded-full bg-btn px-4 py-1.5 text-meta font-medium text-canvas transition-colors duration-150 hover:bg-btn-hover sm:block"
              >
                Sign in
              </Link>
            )}

            <IconButton
              icon={Search}
              label="Search"
              variant="subtle"
              onClick={() => setPaletteOpen(true)}
              className="sm:hidden"
            />

            <IconButton
              icon={isMenuOpen ? X : Menu}
              label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="lg:hidden"
            />
          </div>
        </div>
      </header>

      <CommandPalette
        open={isPaletteOpen}
        onClose={() => setPaletteOpen(false)}
      />

      {/* Mobile drawer. There was no mobile menu at all before this. */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 top-14 z-30 bg-canvas lg:hidden"
          >
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease }}
              className="flex h-full flex-col overflow-y-auto px-5 py-6 sm:px-8"
            >
              <Eyebrow className="mb-4">Tools</Eyebrow>
              <ul className="flex flex-col">
                {navLinks.map((link) => (
                  <li key={link.name} className="border-b border-line">
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-between py-4 font-display text-h3 transition-colors",
                          isActive ? "text-accent" : "text-ink hover:text-accent"
                        )
                      }
                    >
                      {link.name}
                      {link.path === location.pathname && (
                        <Badge tone="accent">Current</Badge>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-btn text-ui font-medium text-canvas"
                >
                  Sign in
                </Link>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default NavBar;
