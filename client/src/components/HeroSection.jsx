import React, { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowDown } from "lucide-react";
import { Button, Eyebrow } from "./ui";

/** The only entry point to three.js in the app. Keeps it out of the main chunk. */
const HeroLattice = lazy(() => import("./three/HeroLattice"));

const stats = [
  { value: "6", label: "Tools" },
  { value: "1", label: "Login" },
  { value: "IIIT", label: "Sonepat" },
];

/** CSS-only stand-in: used while the scene loads, and permanently if WebGL fails. */
const LatticeFallback = () => (
  <div
    aria-hidden
    className="absolute inset-0 hairline-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]"
  />
);

const HeroSection = ({ onExploreClick }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [bigScreen, setBigScreen] = useState(false);

  // Both checks happen before the lazy boundary, so on a phone — or with
  // reduced motion on — the three.js chunk is never fetched at all. On a
  // narrow screen the scene would sit directly behind the headline and wreck
  // its legibility, so it is desktop-only by design, not just by performance.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");

    const sync = () => {
      setReducedMotion(motion.matches);
      setBigScreen(wide.matches);
    };
    sync();

    motion.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* The scene sits behind the type, bleeding to the right. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] lg:block">
        {bigScreen && (
          <Suspense fallback={<LatticeFallback />}>
            <HeroLattice reducedMotion={reducedMotion} />
          </Suspense>
        )}
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32 lg:px-10">
        <div className="max-w-2xl">
          <Eyebrow>For IIIT Sonepat</Eyebrow>

          <h1 className="mt-6 font-display text-display text-ink">
            One campus.
            <br />
            Every tool.
          </h1>

          <p className="mt-6 max-w-md text-body text-ink-3">
            Attendance, skill swaps, rides, listings, lost property and
            internships &mdash; in one place, behind one login.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button onClick={onExploreClick} trailingIcon={ArrowDown}>
              Explore tools
            </Button>
            {!isAuthenticated && (
              <Button as={Link} to="/login" variant="link">
                Sign in &rarr;
              </Button>
            )}
          </div>

          <dl className="mt-16 flex items-end gap-10 border-t border-line pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="numeric font-display text-h3 font-bold text-ink">
                  {stat.value}
                </dd>
                <dt className="mt-0.5 text-eyebrow uppercase text-ink-4">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
