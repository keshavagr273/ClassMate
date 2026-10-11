import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Dialog, DialogPanel } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Briefcase,
  CalendarDays,
  CalendarRange,
  CornerDownLeft,
  CreditCard,
  LogIn,
  LogOut,
  Phone,
  SearchCheck,
  Search as SearchIcon,
  Share2,
  ShoppingBag,
  Table2,
  User,
} from "lucide-react";
import { Eyebrow, cn } from "../../ui";

const ease = [0.16, 1, 0.3, 1];

/**
 * The nav previously rendered a search control that did nothing at all — a
 * dead affordance, which is worse than having none. This is that control made
 * real: a keyboard-first jump list over every tool, document and account
 * action in the app.
 *
 * Opens on Cmd/Ctrl+K or "/", navigates with the arrow keys, Enter to go.
 */
const useCommands = (isAuthenticated) =>
  useMemo(() => {
    const tools = [
      { label: "SkillSwap", hint: "Teach and learn from peers", to: "/skill-exchange", icon: BookOpenCheck, group: "Tools", keywords: "skill exchange swap teach learn" },
      { label: "ClassPulse", hint: "Attendance, per subject", to: "/attendance", icon: CalendarDays, group: "Tools", keywords: "attendance class percentage 75" },
      { label: "CampusBazaar", hint: "Buy and sell on campus", to: "/marketplace", icon: ShoppingBag, group: "Tools", keywords: "marketplace buy sell listing shop" },
      { label: "FoundIt!", hint: "Lost and found", to: "/lost-found", icon: SearchCheck, group: "Tools", keywords: "lost found missing item" },
      { label: "RideLoop", hint: "Share a cab, split the fare", to: "/rides", icon: Share2, group: "Tools", keywords: "ride share cab travel station airport" },
      { label: "JobConnect", hint: "Internships and jobs", to: "/job-connect", icon: Briefcase, group: "Tools", keywords: "job internship work career stipend" },
    ];

    const documents = [
      { label: "Academic calendar", href: "/calendar.pdf", icon: CalendarRange, group: "Campus", keywords: "calendar dates semester holiday" },
      { label: "Exam timetable", href: "/timetable.pdf", icon: Table2, group: "Campus", keywords: "exam timetable schedule" },
      { label: "Important contacts", href: "/contact.pdf", icon: Phone, group: "Campus", keywords: "contact phone number emergency" },
      { label: "Fee payment", href: "https://www.onlinesbi.sbi/sbicollect/", icon: CreditCard, group: "Campus", keywords: "fee payment pay sbi money" },
    ];

    const account = isAuthenticated
      ? [
          { label: "Your profile", hint: "Branch, semester, hostel", to: "/profile", icon: User, group: "Account", keywords: "profile account settings me" },
          { label: "Sign out", to: "/profile", icon: LogOut, group: "Account", keywords: "sign out logout leave" },
        ]
      : [
          { label: "Sign in", hint: "Use your institute email", to: "/login", icon: LogIn, group: "Account", keywords: "sign in login register account" },
        ];

    return [...tools, ...documents, ...account];
  }, [isAuthenticated]);

const CommandPalette = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const commands = useCommands(isAuthenticated);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.hint || ""} ${c.keywords || ""}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset whenever it reopens, and keep the cursor inside the result range.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);
  useEffect(() => setActive(0), [query]);

  const run = useCallback(
    (command) => {
      if (!command) return;
      onClose();
      if (command.href) {
        window.open(command.href, "_blank", "noopener,noreferrer");
      } else if (command.to) {
        navigate(command.to);
      }
    },
    [navigate, onClose]
  );

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(results[active]);
    }
  };

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let lastGroup = null;

  return (
    <AnimatePresence>
      {open && (
        <Dialog static open={open} onClose={onClose} className="relative z-[70]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-canvas/80 backdrop-blur-sm"
            aria-hidden
          />
          <div className="fixed inset-0 flex items-start justify-center px-4 pt-[12vh]">
            {/* DialogPanel stays plain; the motion wrapper goes inside. See
                the note in ui/Modal.jsx — `as={motion.div}` here makes
                Headless UI v2 throw under `static`. */}
            <DialogPanel className="w-full max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.16, ease }}
                className="overflow-hidden rounded-card border border-line-2 bg-surface shadow-overlay"
              >
                <div className="flex items-center gap-3 border-b border-line px-4">
                  <SearchIcon className="size-4 shrink-0 text-ink-4" aria-hidden />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Jump to a tool, document or page…"
                    aria-label="Search ClassMate"
                    className="h-14 w-full bg-transparent text-ui text-ink placeholder:text-ink-4 focus:outline-none"
                  />
                  <kbd className="shrink-0 rounded border border-line-2 bg-surface-2 px-1.5 py-0.5 font-sans text-[10px] text-ink-4">
                    esc
                  </kbd>
                </div>

                <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
                  {results.length === 0 ? (
                    <p className="px-3 py-8 text-center text-meta text-ink-4">
                      Nothing matches &ldquo;{query}&rdquo;.
                    </p>
                  ) : (
                    results.map((command, index) => {
                      const Icon = command.icon;
                      const showGroup = command.group !== lastGroup;
                      lastGroup = command.group;

                      return (
                        <React.Fragment key={command.label}>
                          {showGroup && (
                            <Eyebrow className="px-3 pb-1.5 pt-3">
                              {command.group}
                            </Eyebrow>
                          )}
                          <button
                            type="button"
                            data-index={index}
                            onMouseEnter={() => setActive(index)}
                            onClick={() => run(command)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-chip px-3 py-2.5 text-left transition-colors duration-100",
                              index === active
                                ? "bg-surface-3 text-ink"
                                : "text-ink-2 hover:bg-surface-2"
                            )}
                          >
                            <Icon className="size-4 shrink-0 text-ink-4" aria-hidden />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-ui">
                                {command.label}
                              </span>
                              {command.hint && (
                                <span className="block truncate text-micro text-ink-4">
                                  {command.hint}
                                </span>
                              )}
                            </span>
                            {index === active && (
                              <CornerDownLeft
                                className="size-3.5 shrink-0 text-ink-4"
                                aria-hidden
                              />
                            )}
                          </button>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                <footer className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-micro text-ink-4">
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="size-3 rotate-90" aria-hidden />
                    <ArrowRight className="size-3 -rotate-90" aria-hidden />
                    to navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CornerDownLeft className="size-3" aria-hidden />
                    to open
                  </span>
                    <span className="ml-auto">{results.length} results</span>
                </footer>
              </motion.div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
