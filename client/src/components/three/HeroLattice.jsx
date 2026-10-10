import React, { useEffect, useRef, useState } from "react";
import { createLattice } from "./lattice";

/**
 * React mount point for the hero scene. This module is only ever reached
 * through React.lazy, so `three` stays out of the entry chunk.
 *
 * StrictMode double-invokes this effect in development (mount, cleanup,
 * mount). That is useful here rather than annoying: a teardown that leaks a
 * WebGL context will burn through the browser's context budget at twice the
 * rate, so if the scene survives repeated hot reloads the cleanup is correct.
 */
const HeroLattice = ({ reducedMotion = false }) => {
  const hostRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let teardown;
    try {
      teardown = createLattice(host, { reducedMotion });
    } catch (error) {
      // No WebGL, a blocked context, or a driver failure. The caller renders
      // the CSS fallback instead.
      if (import.meta.env.DEV) console.warn("Hero scene unavailable:", error);
      setFailed(true);
      return;
    }

    const onContextLost = (event) => {
      event.preventDefault();
      setFailed(true);
    };
    const canvas = host.querySelector("canvas");
    canvas?.addEventListener("webglcontextlost", onContextLost);

    return () => {
      canvas?.removeEventListener("webglcontextlost", onContextLost);
      teardown?.();
    };
  }, [reducedMotion]);

  if (failed) return null;

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="absolute inset-0 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_26%),linear-gradient(to_bottom,black_55%,transparent_96%)]"
    />
  );
};

export default HeroLattice;
