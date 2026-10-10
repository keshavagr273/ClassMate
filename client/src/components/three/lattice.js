/**
 * The hero scene: a field of slender columns rising out of a dark plane in a
 * slow radial swell, lit by three coloured lights.
 *
 * The colour comes from the lighting, not from tinting the geometry — a cool
 * teal key, a violet rim and a warm amber fill rake across neutral columns, so
 * every face picks up a different hue depending on which way it faces. That is
 * what gives it depth without a single CSS gradient, and it is why the field
 * reads as an object in a room rather than as a flat pattern.
 *
 * Framework-free on purpose. `three` is imported with named imports only, so
 * Rollup can tree-shake it, and this module is only ever reached through a
 * dynamic import so it lands in its own chunk.
 */
import {
  AmbientLight,
  BoxGeometry,
  Clock,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";

/* Token values, mirrored from index.css. Kept as literals because the scene
   runs outside the CSS cascade and reading computed styles here would couple
   first paint to a layout pass. */
const CANVAS = "#0e0f10";
const COLUMN = "#5a6269";
const FLOOR = "#17191c";

const KEY = "#4fc3a1"; // --color-pulse, teal
const RIM = "#9d8df1"; // --color-skill, violet
const FILL = "#e8a765"; // --color-bazaar, amber

const GRID = 22; // 484 instances, one draw call
const SPACING = 1.02;
const EXTENT = ((GRID - 1) * SPACING) / 2;

/** Cheap value-noise. Deterministic, no dependency, good enough for a drift. */
const hash = (x, y) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
};

const smooth = (t) => t * t * (3 - 2 * t);

const valueNoise = (x, y) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return (
    a * (1 - xf) * (1 - yf) + b * xf * (1 - yf) + c * (1 - xf) * yf + d * xf * yf
  );
};

/**
 * Height field. A radial swell centred on the field gives the composition a
 * focal point — the previous version was pure noise, which read as visual
 * static with nothing to look at.
 */
const heightAt = (dx, dz, t) => {
  const dist = Math.sqrt(dx * dx + dz * dz);
  const swell = Math.cos(dist * 0.5 - t * 1.25) * 0.5 + 0.5;
  const falloff = Math.max(0, 1 - dist / (EXTENT * 1.15));
  const grain = valueNoise(dx * 0.3 + t * 0.4, dz * 0.3);
  return 0.1 + (swell * 0.86 + grain * 0.14) * falloff * falloff * 4.6;
};

export function createLattice(host, { reducedMotion = false } = {}) {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.fog = new Fog(new Color(CANVAS), 20, 60);

  const camera = new PerspectiveCamera(38, 1, 0.1, 120);
  camera.position.set(0, 4.3, 16);
  camera.lookAt(0, 1.9, -2);

  /* Everything renderable hangs off this group, so a Blender .glb can later be
     dropped in with contentRoot.clear() + contentRoot.add(gltf.scene) and
     nothing else in this file changes. */
  const contentRoot = new Group();
  contentRoot.rotation.y = -0.38;
  scene.add(contentRoot);

  /* --- floor: catches the coloured light and anchors the columns ---------- */

  const floor = new Mesh(
    new PlaneGeometry(EXTENT * 6, EXTENT * 6),
    new MeshStandardMaterial({
      color: new Color(FLOOR),
      roughness: 0.62,
      metalness: 0.18,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  contentRoot.add(floor);

  /* --- the columns -------------------------------------------------------- */

  const geometry = new BoxGeometry(0.26, 1, 0.26);
  // Pivot at the base, so scaling y grows the column upward, not both ways.
  geometry.translate(0, 0.5, 0);

  const material = new MeshStandardMaterial({
    color: new Color(COLUMN),
    roughness: 0.34,
    metalness: 0.52,
  });

  const count = GRID * GRID;
  const columns = new InstancedMesh(geometry, material, count);
  const dummy = new Object3D();

  const writeMatrices = (t) => {
    let i = 0;
    for (let gz = 0; gz < GRID; gz++) {
      for (let gx = 0; gx < GRID; gx++) {
        const x = gx * SPACING - EXTENT;
        const z = gz * SPACING - EXTENT;
        dummy.position.set(x, 0, z);
        dummy.scale.set(1, heightAt(x, z, t), 1);
        dummy.updateMatrix();
        columns.setMatrixAt(i++, dummy.matrix);
      }
    }
    columns.instanceMatrix.needsUpdate = true;
  };

  writeMatrices(0);
  contentRoot.add(columns);

  /* --- a slim accent ring, so the eye has somewhere to land --------------- */

  const ring = new Mesh(
    new CylinderGeometry(EXTENT * 0.46, EXTENT * 0.46, 0.012, 96, 1, true),
    new MeshStandardMaterial({
      color: new Color(KEY),
      emissive: new Color(KEY),
      emissiveIntensity: 0.55,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.5,
    })
  );
  ring.position.y = 0.01;
  contentRoot.add(ring);

  /* --- lighting: the whole colour story ----------------------------------- */

  const key = new DirectionalLight(new Color(KEY), 3.1);
  key.position.set(-10, 6, 7);
  scene.add(key);

  const rim = new DirectionalLight(new Color(RIM), 5.4);
  rim.position.set(9, 7, -4);
  scene.add(rim);

  const fill = new PointLight(new Color(FILL), 150, 30, 2);
  fill.position.set(5, 2.6, 5.5);
  scene.add(fill);

  scene.add(new AmbientLight(new Color("#a89cb0"), 0.7));

  /* ---------------------------------------------------------------- sizing */

  const resize = (width, h) => {
    if (!width || !h) return;
    renderer.setSize(width, h, false);
    camera.aspect = width / h;
    camera.updateProjectionMatrix();
  };

  // ResizeObserver rather than window.resize: the hero sits inside a container
  // whose width changes when the nav drawer opens, with no window resize event.
  const ro = new ResizeObserver(([entry]) => {
    const { width, height: h } = entry.contentRect;
    resize(width, h);
    renderer.render(scene, camera);
  });
  ro.observe(host);

  /* ----------------------------------------------------------- interaction */

  const target = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };

  const onPointerMove = (event) => {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // Clamped hard: a camera that chases the cursor is the other thing that
    // makes a 3D hero feel like a toy.
    target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.42;
    target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.2;
  };
  if (!reducedMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  /* -------------------------------------------------------------- the loop */

  const clock = new Clock();
  let raf = 0;
  let alive = true;
  let onScreen = true;
  let elapsed = 0;

  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
    },
    { threshold: 0 }
  );
  io.observe(host);

  const onVisibility = () => {
    if (document.hidden) onScreen = false;
  };
  document.addEventListener("visibilitychange", onVisibility);

  const frame = () => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!onScreen || document.hidden) return;

    const delta = Math.min(clock.getDelta(), 0.05);
    elapsed += delta * 0.42;

    writeMatrices(elapsed);

    pointer.x += (target.x - pointer.x) * 0.045;
    pointer.y += (target.y - pointer.y) * 0.045;
    contentRoot.rotation.y = -0.38 + pointer.x * 0.5;
    contentRoot.rotation.x = pointer.y * 0.12;

    ring.rotation.y += delta * 0.12;

    renderer.render(scene, camera);
  };

  if (reducedMotion) {
    // One frame, then stop. The field reads perfectly well as a still.
    const rect = host.getBoundingClientRect();
    resize(rect.width, rect.height);
    writeMatrices(1.6);
    renderer.render(scene, camera);
  } else {
    frame();
  }

  /* --------------------------------------------------------------- teardown */

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointerMove);

    scene.traverse((object) => {
      object.geometry?.dispose?.();
      const materials = Array.isArray(object.material)
        ? object.material
        : object.material
          ? [object.material]
          : [];
      for (const mat of materials) {
        for (const key2 in mat) {
          const value = mat[key2];
          if (value && value.isTexture) value.dispose();
        }
        mat.dispose();
      }
    });
    columns.dispose();

    renderer.dispose();
    // dispose() frees resources *inside* the GL context but not the context
    // itself. Browsers cap live contexts at roughly 8, so without this a few
    // route changes silently blank the hero with no error thrown.
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
