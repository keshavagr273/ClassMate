import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button, Eyebrow, PageShell } from "../../components/ui";

const suggestions = [
  { label: "Attendance", to: "/attendance" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "Rides", to: "/rides" },
  { label: "Lost and found", to: "/lost-found" },
];

const NotFoundPage = () => {
  const { pathname } = useLocation();

  return (
    <PageShell width="default" className="py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>Error 404</Eyebrow>

          <p className="numeric mt-6 font-display text-display font-bold text-ink-4 select-none">
            404
          </p>

          <h1 className="mt-4 text-h2 text-ink">This page does not exist.</h1>

          <p className="mt-4 max-w-prose text-body text-ink-3">
            Nothing is served at{" "}
            <code className="rounded border border-line-2 bg-surface-2 px-1.5 py-0.5 text-meta text-ink-2">
              {pathname}
            </code>
            . It may have been renamed, or the link that brought you here was
            wrong.
          </p>

          <div className="mt-8">
            <Button as={Link} to="/" leadingIcon={ArrowLeft}>
              Back to home
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <Eyebrow>Try instead</Eyebrow>
          <ul className="mt-4 border-t border-line">
            {suggestions.map((item) => (
              <li key={item.to} className="border-b border-line">
                <Link
                  to={item.to}
                  className="flex items-center justify-between py-3.5 text-ui text-ink-2 transition-colors duration-150 hover:text-ink"
                >
                  {item.label}
                  <span className="text-ink-4" aria-hidden>
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
};

export default NotFoundPage;
