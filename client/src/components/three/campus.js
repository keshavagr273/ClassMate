/**
 * The hero scene: a stylised academic campus block at dusk.
 *
 * Built from primitives rather than a scanned model — this is an original,
 * generic academic building, not a reproduction of IIIT Sonepat's actual
 * architecture, which would need real reference to do honestly. The read we
 * want is "a campus at dusk", not a survey drawing.
 *
 * Composition: a long four-storey teaching block with a glazed stair core, two
 * set-back wings, an entrance canopy on columns, a plaza with lamps and trees.
 * Windows are one InstancedMesh of emissive planes — most of the warmth in the
 * frame comes from them, which is what makes it read as occupied rather than
 * as a massing diagram.
 *
 * Framework-free on purpose. `three` is imported with named imports only, so
 * Rollup can tree-shake it, and this module is only ever reached through a
 * dynamic import so it lands in its own chunk.
 */
import {
  AmbientLight,
  BoxGeometry,
  CircleGeometry,
  Clock,
  Color,
  ConeGeometry,
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
  SphereGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";

/* Token values, mirrored from index.css. Kept as literals because the scene
   runs outside the CSS cascade and reading computed styles here would couple
   first paint to a layout pass. */
const CANVAS = "#0e0f10";

/* How far the pointer may swing the building.
 *
 * These were wide enough to reach about 45 degrees of yaw at the left edge of
 * the window, which rotated the block far past a three-quarter view and
 * exposed its back corner — most visible with the cursor down on the
 * "Explore tools" button. The yaw is now capped so the building always keeps
 * the same face to the reader and only leans. */
const MAX_YAW = 0.1; // radians the pointer can add, about 6 degrees
const MAX_PITCH = 0.03; // about 1.7 degrees
const DRIFT = 0.045; // idle sway, about 2.6 degrees

const CONCRETE = "#8d9299";
const CONCRETE_DARK = "#5c6168";
const GLASS = "#39606e";
const GROUND = "#16181b";
const TRUNK = "#4a4038";
const FOLIAGE = "#2f5f4a";

const WARM = "#ffc98a"; // lit windows
const KEY = "#4fc3a1"; // --color-pulse
const RIM = "#9d8df1"; // --color-skill
const LAMP = "#e8a765"; // --color-bazaar

const concrete = (color = CONCRETE) =>
  new MeshStandardMaterial({
    color: new Color(color),
    roughness: 0.78,
    metalness: 0.05,
  });

export function createCampus(host, { reducedMotion = false } = {}) {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.fog = new Fog(new Color(CANVAS), 62, 150);

  const camera = new PerspectiveCamera(32, 1, 0.1, 260);
  camera.position.set(41, 24, 64);
  camera.lookAt(0, 5.5, -1);

  /* Everything renderable hangs off this group, so a Blender .glb of the real
     building can later be dropped in with contentRoot.clear() +
     contentRoot.add(gltf.scene) and nothing else in this file changes. */
  const contentRoot = new Group();
  contentRoot.rotation.y = -0.33;
  scene.add(contentRoot);

  const disposables = [];
  const track = (geo) => {
    disposables.push(geo);
    return geo;
  };

  /* ------------------------------------------------------------- ground --- */

  const ground = new Mesh(
    track(new PlaneGeometry(260, 260)),
    new MeshStandardMaterial({
      color: new Color(GROUND),
      roughness: 0.92,
      metalness: 0.04,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  contentRoot.add(ground);

  // Plaza slab, a shade lighter so the building has something to sit on.
  const plaza = new Mesh(
    track(new CircleGeometry(21, 64)),
    new MeshStandardMaterial({
      color: new Color("#23272c"),
      roughness: 0.84,
      metalness: 0.06,
    })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.02;
  contentRoot.add(plaza);

  /* ------------------------------------------------------------ massing --- */

  const block = (w, h, d, x, y, z, color) => {
    const m = new Mesh(track(new BoxGeometry(w, h, d)), concrete(color));
    m.position.set(x, y + h / 2, z);
    contentRoot.add(m);
    return m;
  };

  const FLOOR_H = 2.5;
  const FLOORS = 4;
  const MAIN_W = 26;
  const MAIN_D = 7;
  const MAIN_H = FLOOR_H * FLOORS;

  // Plinth, main teaching block, parapet.
  block(MAIN_W + 1.6, 0.7, MAIN_D + 1.6, 0, 0, 0, CONCRETE_DARK);
  block(MAIN_W, MAIN_H, MAIN_D, 0, 0.7, 0, CONCRETE);
  block(MAIN_W + 0.5, 0.45, MAIN_D + 0.5, 0, 0.7 + MAIN_H, 0, CONCRETE_DARK);

  // Horizontal floor bands — the detail that stops it reading as one slab.
  for (let f = 1; f < FLOORS; f++) {
    block(
      MAIN_W + 0.35,
      0.16,
      MAIN_D + 0.35,
      0,
      0.7 + f * FLOOR_H - 0.08,
      0,
      CONCRETE_DARK
    );
  }

  // Glazed stair core, pushed forward and up through the parapet.
  const core = new Mesh(
    track(new BoxGeometry(5.4, MAIN_H + 3.4, MAIN_D + 2.2)),
    new MeshStandardMaterial({
      color: new Color(GLASS),
      roughness: 0.1,
      metalness: 0.45,
      emissive: new Color("#7fd8e8"),
      emissiveIntensity: 0.4,
    })
  );
  core.position.set(0, 0.7 + (MAIN_H + 3.4) / 2, 0.9);
  contentRoot.add(core);
  block(5.9, 0.5, MAIN_D + 2.7, 0, 0.7 + MAIN_H + 3.4, 0.9, CONCRETE_DARK);

  // Two set-back wings, lower than the main block.
  const WING_W = 8.5;
  const WING_H = FLOOR_H * 3;
  for (const sx of [-1, 1]) {
    const x = sx * (MAIN_W / 2 + WING_W / 2 - 0.6);
    block(WING_W, 0.6, MAIN_D + 3.4, x, 0, -1.6, CONCRETE_DARK);
    block(WING_W, WING_H, MAIN_D + 3, x, 0.6, -1.6, CONCRETE);
    block(WING_W + 0.4, 0.4, MAIN_D + 3.4, x, 0.6 + WING_H, -1.6, CONCRETE_DARK);
  }

  // Entrance canopy on columns.
  block(11, 0.4, 4.6, 0, 3.4, MAIN_D / 2 + 2.6, CONCRETE_DARK);
  for (const cx of [-4.6, -1.5, 1.5, 4.6]) {
    const col = new Mesh(
      track(new CylinderGeometry(0.22, 0.22, 3.4, 12)),
      concrete(CONCRETE_DARK)
    );
    col.position.set(cx, 1.7, MAIN_D / 2 + 4.3);
    contentRoot.add(col);
  }

  /* ------------------------------------------------------------ windows --- */

  /* One InstancedMesh for every window in the scene. A per-window random
     decides whether it is lit, so the facade has the irregular rhythm of a
     real building instead of a uniform grid. */
  const winW = 1.15;
  const winH = 1.45;
  const windowGeo = track(new PlaneGeometry(winW, winH));
  const windowMat = new MeshStandardMaterial({
    color: new Color("#101418"),
    emissive: new Color(WARM),
    emissiveIntensity: 1,
    roughness: 0.3,
    metalness: 0.1,
  });

  const slots = [];
  const pushRow = ({ count, spacing, y, z, faceZ = 1, xOffset = 0 }) => {
    for (let i = 0; i < count; i++) {
      slots.push({
        x: xOffset + (i - (count - 1) / 2) * spacing,
        y,
        z,
        faceZ,
      });
    }
  };

  // Main block, front and back, skipping the span hidden by the stair core.
  for (let f = 0; f < FLOORS; f++) {
    const y = 0.7 + f * FLOOR_H + FLOOR_H / 2;
    for (let i = 0; i < 15; i++) {
      const x = (i - 7) * 1.66;
      if (Math.abs(x) < 3.1) continue; // behind the core
      slots.push({ x, y, z: MAIN_D / 2 + 0.01, faceZ: 1 });
      slots.push({ x, y, z: -MAIN_D / 2 - 0.01, faceZ: -1 });
    }
  }

  // Wings.
  for (const sx of [-1, 1]) {
    const baseX = sx * (MAIN_W / 2 + WING_W / 2 - 0.6);
    for (let f = 0; f < 3; f++) {
      const y = 0.6 + f * FLOOR_H + FLOOR_H / 2;
      pushRow({
        count: 4,
        spacing: 1.8,
        y,
        z: -1.6 + (MAIN_D + 3) / 2 + 0.01,
        faceZ: 1,
        xOffset: baseX,
      });
    }
  }

  const windows = new InstancedMesh(windowGeo, windowMat, slots.length);
  const dummy = new Object3D();
  const lit = new Float32Array(slots.length);

  // Deterministic so the facade looks the same on every load.
  let seed = 20_26;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  slots.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, s.faceZ === 1 ? 0 : Math.PI, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    windows.setMatrixAt(i, dummy.matrix);

    const on = rand() < 0.62;
    lit[i] = on ? 0.5 + rand() * 0.75 : 0.05;
    const c = new Color(WARM).multiplyScalar(lit[i]);
    windows.setColorAt(i, c);
  });
  windows.instanceColor.needsUpdate = true;
  contentRoot.add(windows);

  /* ------------------------------------------------------ plaza objects --- */

  // Lamp posts.
  const lampPositions = [
    [-13, 11],
    [13, 11],
    [-17.5, 2],
    [17.5, 2],
  ];
  const lampBulbs = [];
  for (const [lx, lz] of lampPositions) {
    const post = new Mesh(
      track(new CylinderGeometry(0.1, 0.13, 4.2, 10)),
      concrete(CONCRETE_DARK)
    );
    post.position.set(lx, 2.1, lz);
    contentRoot.add(post);

    const bulb = new Mesh(
      track(new SphereGeometry(0.26, 14, 14)),
      new MeshStandardMaterial({
        color: new Color(LAMP),
        emissive: new Color(LAMP),
        emissiveIntensity: 2.4,
        roughness: 1,
      })
    );
    bulb.position.set(lx, 4.3, lz);
    contentRoot.add(bulb);
    lampBulbs.push(bulb);

    const glow = new PointLight(new Color(LAMP), 26, 16, 2);
    glow.position.set(lx, 4.3, lz);
    contentRoot.add(glow);
  }

  // Trees: a trunk and two stacked cones. Low-poly on purpose.
  const treeSpots = [
    [-20, 9],
    [-22.5, -3],
    [20, 9],
    [22.5, -3],
    [-9, 15],
    [9, 15],
  ];
  for (const [tx, tz] of treeSpots) {
    const trunk = new Mesh(
      track(new CylinderGeometry(0.17, 0.24, 1.9, 8)),
      concrete(TRUNK)
    );
    trunk.position.set(tx, 0.95, tz);
    contentRoot.add(trunk);

    for (const [r, h, y] of [
      [1.5, 2.6, 2.6],
      [1.1, 2.0, 3.9],
    ]) {
      const cone = new Mesh(
        track(new ConeGeometry(r, h, 9)),
        new MeshStandardMaterial({
          color: new Color(FOLIAGE),
          roughness: 0.9,
          metalness: 0,
        })
      );
      cone.position.set(tx, y, tz);
      contentRoot.add(cone);
    }
  }

  /* ----------------------------------------------------------- lighting --- */

  // Cool key from the left, violet rim from behind-right, warm bounce in front.
  const key = new DirectionalLight(new Color(KEY), 2.3);
  key.position.set(-22, 20, 16);
  scene.add(key);

  const rim = new DirectionalLight(new Color(RIM), 2.9);
  rim.position.set(20, 14, -18);
  scene.add(rim);

  const bounce = new PointLight(new Color(LAMP), 90, 46, 2);
  bounce.position.set(4, 5, 20);
  scene.add(bounce);

  scene.add(new AmbientLight(new Color("#7f8a99"), 0.5));

  /* ------------------------------------------------------------- sizing --- */

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

  /* -------------------------------------------------------- interaction --- */

  const target = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };

  const onPointerMove = (event) => {
    /* Measured against the viewport rather than the canvas, so moving the
       cursor anywhere over the hero turns the building — previously only the
       right-hand pane responded, which made it feel inert. */
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    target.x = event.clientX / w - 0.5;
    target.y = event.clientY / h - 0.5;
  };
  if (!reducedMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  /* ------------------------------------------------------------ the loop --- */

  const clock = new Clock();
  let raf = 0;
  let alive = true;
  let onScreen = true;
  let elapsed = 0;

  /* Render at 30fps rather than 60. Nothing in this scene moves fast enough
     for the difference to be visible, and it halves a cost that was the
     single largest consumer of main-thread time on the landing page. */
  const FRAME_MS = 1000 / 30;
  let lastDraw = 0;

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

  const baseRotation = -0.33;

  const frame = () => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!onScreen || document.hidden) return;

    const now = performance.now();
    if (now - lastDraw < FRAME_MS) return;
    lastDraw = now;

    const delta = Math.min(clock.getDelta(), 0.05);
    elapsed += delta;

    // A very slow orbit, so the massing reads in three dimensions over time
    // without ever looking like a turntable product shot.
    const drift = Math.sin(elapsed * 0.075) * DRIFT;

    pointer.x += (target.x - pointer.x) * 0.075;
    pointer.y += (target.y - pointer.y) * 0.075;
    // Clamped, so no cursor position can push the block off its three-quarter
    // view however far the pointer travels.
    const yaw = Math.max(-MAX_YAW, Math.min(MAX_YAW, pointer.x * 2 * MAX_YAW));
    const pitch = Math.max(
      -MAX_PITCH,
      Math.min(MAX_PITCH, pointer.y * 2 * MAX_PITCH)
    );

    contentRoot.rotation.y = baseRotation + drift + yaw;
    contentRoot.rotation.x = pitch;

    // A little counter-movement on the camera keeps the parallax readable
    // without the building leaving its mark.
    camera.position.x = 41 - pointer.x * 3.2;
    camera.position.y = 24 + pointer.y * 2.4;
    camera.lookAt(0, 5.5, -1);

    // Windows flicker on a long cycle — a handful switching state, not a
    // disco. This is the only thing in the frame that changes on its own.
    if (Math.floor(elapsed * 2) % 7 === 0) {
      const i = Math.floor(rand() * slots.length);
      lit[i] = lit[i] > 0.3 ? 0.05 : 0.5 + rand() * 0.75;
      windows.setColorAt(i, new Color(WARM).multiplyScalar(lit[i]));
      windows.instanceColor.needsUpdate = true;
    }

    renderer.render(scene, camera);
  };

  if (reducedMotion) {
    const rect = host.getBoundingClientRect();
    resize(rect.width, rect.height);
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
        for (const k in mat) {
          const value = mat[k];
          if (value && value.isTexture) value.dispose();
        }
        mat.dispose();
      }
    });
    for (const geo of disposables) geo.dispose();
    windows.dispose();

    renderer.dispose();
    // dispose() frees resources *inside* the GL context but not the context
    // itself. Browsers cap live contexts at roughly 8, so without this a few
    // route changes silently blank the hero with no error thrown.
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
