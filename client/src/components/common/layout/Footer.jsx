import React from "react";
import { Link } from "react-router-dom";
import { Eyebrow } from "../../ui";

const groups = [
  {
    heading: "Tools",
    links: [
      { label: "Skill exchange", to: "/skill-exchange" },
      { label: "Attendance", to: "/attendance" },
      { label: "Marketplace", to: "/marketplace" },
      { label: "Lost and found", to: "/lost-found" },
      { label: "Rides", to: "/rides" },
      { label: "Internships", to: "/job-connect" },
    ],
  },
  {
    heading: "Campus",
    links: [
      { label: "Academic calendar", href: "/calendar.pdf" },
      { label: "Exam timetable", href: "/timetable.pdf" },
      { label: "Important contacts", href: "/contact.pdf" },
      { label: "Fee payment", href: "https://www.onlinesbi.sbi/sbicollect/" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Your profile", to: "/profile" },
      { label: "Sign in", to: "/login" },
    ],
  },
];

const year = new Date().getFullYear();

/** There was no footer before this. */
const Footer = () => (
  <footer className="mt-auto border-t border-line">
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <p className="font-display text-h4 font-bold tracking-tight text-ink">
            ClassMate
          </p>
          <p className="mt-2 text-meta text-ink-3">
            One login for campus life at IIIT Sonepat. Built by students, for
            students.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.heading} className="flex flex-col gap-3">
              <Eyebrow>{group.heading}</Eyebrow>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-meta text-ink-3 transition-colors duration-150 hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-meta text-ink-3 transition-colors duration-150 hover:text-ink"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-micro text-ink-4">
          &copy; {year} ClassMate &middot; IIIT Sonepat
        </p>
        <p className="text-micro text-ink-4">Built on campus.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
