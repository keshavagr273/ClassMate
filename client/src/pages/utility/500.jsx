import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCw } from "lucide-react";
import { Button, Eyebrow, PageShell } from "../../components/ui";

const ServerError = () => (
  <PageShell width="default" className="py-20 md:py-28">
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Eyebrow>Error 500</Eyebrow>

        <p className="numeric mt-6 font-display text-display font-bold text-ink-4 select-none">
          500
        </p>

        <h1 className="mt-4 text-h2 text-ink">Something broke on our side.</h1>

        <p className="mt-4 max-w-prose text-body text-ink-3">
          The request reached the server but it could not finish. This is not
          something you did wrong. Retrying often works, since most of these are
          momentary.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            leadingIcon={RotateCw}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
          <Button as={Link} to="/" variant="outline" leadingIcon={ArrowLeft}>
            Back to home
          </Button>
        </div>
      </div>

      <div className="lg:col-span-4 lg:col-start-9">
        <Eyebrow>If it keeps happening</Eyebrow>
        <p className="mt-4 border-t border-line pt-4 text-ui text-ink-3">
          Note what you were doing when it failed and report it to the ClassMate
          team. Details about the exact page and action make it far quicker to
          track down.
        </p>
      </div>
    </div>
  </PageShell>
);

export default ServerError;
