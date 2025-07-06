import React, { useEffect } from "react";
import * as THREE from "three";

const LoadingScreen = () => {
  useEffect(() => {
    const loaderText = document.querySelector(".loading");
    if (!loaderText) return;

    function setCSSVars(elem, min, max, minMove, maxMove) {
      let width = Math.ceil(elem.offsetWidth);
      let text = elem.textContent;
      elem.innerHTML = "";
      for (let i = 0; i < width; i++) {
        let span = document.createElement("span");
        span.textContent = text;
        let num = Math.floor(Math.random() * (max - min + 1)) + min;
        let numMove = Math.floor(Math.random() * (maxMove - minMove + 1)) + minMove;
        let dir = i % 2 === 0 ? 1 : -1;
        span.style.setProperty("--x", `${i}px`);
        span.style.setProperty("--move-y", `${num * dir}px`);
        span.style.setProperty("--move-y-s", `${dir === 1 ? num - numMove : num + numMove}px`);
        span.style.setProperty("--delay", `${i}ms`);
        elem.appendChild(span);
      }
    }

    function startAnimation(elem) {
      elem.classList.remove("start");
      setCSSVars(elem, 10, 30, 2, 8);
      void elem.offsetWidth;
      elem.classList.add("start");
    }

    startAnimation(loaderText);
    loaderText.addEventListener("animationend", () => startAnimation(loaderText));

    // THREE.js setup for particles
    let scene, camera, renderer, particles;
    const particleCount = 20000;
    const basePositions = [];
    const targetShapes = [];
    const forceOffsets = [];
    let currentShape = 0;
    let rotationDirection = 1;
    let mouseForce = 0;
    let mouse = new THREE.Vector2();

    init();
    animate();
    setInterval(switchShape, 2000);

    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.z = 160;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const { x, y, z } = randomSphere();
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        basePositions.push({ x, y, z });
        forceOffsets.push({ x: 0, y: 0, z: 0 });
        targetShapes.push({ x, y, z });

        colors[i3] = Math.random();
        colors[i3 + 1] = Math.random();
        colors[i3 + 2] = Math.random();
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const sprite = new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/circle.png");
      const material = new THREE.PointsMaterial({
        size: 1.1,
        map: sprite,
        alphaTest: 0.5,
        transparent: true,
        vertexColors: true,
        opacity: 0.85,
        depthWrite: false,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      document.addEventListener("mousemove", (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      });

      document.addEventListener("click", (e) => {
        rotationDirection = e.clientX < window.innerWidth / 2 ? -1 : 1;
        mouseForce = 1.2;
      });

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    function animate() {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const positions = particles.geometry.attributes.position.array;
      const colors = particles.geometry.attributes.color.array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const base = basePositions[i];
        const target = targetShapes[i];
        const force = forceOffsets[i];

        base.x += (target.x - base.x) * 0.02;
        base.y += (target.y - base.y) * 0.02;
        base.z += (target.z - base.z) * 0.02;

        const floatX = Math.sin(time + i) * 1;
        const floatY = Math.cos(time + i * 0.3) * 1;
        const floatZ = Math.sin(time + i * 0.5) * 1;

        if (mouseForce > 0.01) {
          const dx = base.x - mouse.x * 100;
          const dy = base.y - mouse.y * 100;
          const dz = base.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
          force.x += (dx / dist) * mouseForce;
          force.y += (dy / dist) * mouseForce;
          force.z += (dz / dist) * mouseForce;
        }

        force.x *= 0.94;
        force.y *= 0.94;
        force.z *= 0.94;

        let px = base.x + floatX + force.x;
        let py = base.y + floatY + force.y;
        let pz = base.z + floatZ + force.z;

        const angle = 0.003 * rotationDirection;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const rx = px * cosA - pz * sinA;
        const rz = px * sinA + pz * cosA;

        positions[i3] = rx;
        positions[i3 + 1] = py;
        positions[i3 + 2] = rz;

        colors[i3] = (Math.sin(time + i * 0.2) + 1) / 2;
        colors[i3 + 1] = (Math.cos(time + i * 0.3) + 1) / 2;
        colors[i3 + 2] = (Math.sin(time + i * 0.5) + 1) / 2;
      }

      if (mouseForce > 0.01) mouseForce *= 0.9;

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    }

    function switchShape() {
      currentShape = (currentShape + 1) % 3;
      for (let i = 0; i < particleCount; i++) {
        let shapePos =
          currentShape === 0
            ? randomSphere()
            : currentShape === 1
            ? randomCube()
            : randomTorus();
        targetShapes[i] = shapePos;
      }
    }

    function randomSphere() {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 100;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
      };
    }

    function randomCube() {
      return {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 200,
      };
    }

    function randomTorus() {
      const r1 = 60;
      const r2 = 20;
      const u = Math.random() * 2 * Math.PI;
      const v = Math.random() * 2 * Math.PI;
      return {
        x: (r1 + r2 * Math.cos(v)) * Math.cos(u),
        y: (r1 + r2 * Math.cos(v)) * Math.sin(u),
        z: r2 * Math.sin(v),
      };
    }

    // Cleanup function
    return () => {
      if (renderer) {
        renderer.dispose();
        document.body.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            overflow: hidden;
          }
          canvas {
            display: block;
          }
          #loader {
            position: fixed;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            z-index: 1000;
            -webkit-transition: 0.3s ease opacity;
            transition: 0.3s ease opacity;
          }
          #loader .wrap {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #loader .loading {
            color: #fff;
            --duration: 1000ms;
            font-family: "Inter Tight", sans-serif;
            font-size: 24px;
            position: relative;
            white-space: nowrap;
            user-select: none;
          }
          #loader .loading span {
            --x: 0;
            --y: 0;
            --move-y: 0;
            --move-y-s: 0;
            --delay: 0ms;
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 1px;
            text-indent: calc(var(--x) * -1);
            overflow: hidden;
            transform: translate(var(--x), var(--y));
          }
          #loader .loading.start div {
            opacity: 0;
          }
          #loader .loading.start span {
            animation: move var(--duration) ease-in-out var(--delay);
          }
          @keyframes move {
            30% {
              transform: translate(var(--x), var(--move-y));
            }
            82% {
              transform: translate(var(--x), var(--move-y-s));
            }
          }
        `}
      </style>
      <div id="loader">
        <div className="wrap">
          <div className="loading">Loading..</div>
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;
