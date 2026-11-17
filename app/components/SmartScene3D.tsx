"use client";

import { useEffect, useRef, useState } from "react";

const CYCLE = 11;
const COLORS = [0xd4a857, 0x57c88a, 0x5ea6e8, 0xe4766c];
const COLS = 16;
const ROWS = 7;
const PICKED = [18, 37, 62, 85];

const PHASES = [
  { until: 2, text: "Vos vocaux, par centaines…" },
  { until: 5, text: "L'IA écoute et cherche le mot tapé" },
  { until: 8, text: "Les bons messages sont retrouvés" },
  { until: CYCLE, text: "Les repères colorés sont posés" },
];

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

export default function SmartScene3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState(PHASES[0].text);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let raf = 0;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setFailed(true);
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const key = new THREE.DirectionalLight(0xfff0d8, 1.4);
      key.position.set(4, 8, 6);
      scene.add(key);

      const group = new THREE.Group();
      scene.add(group);

      const geo = new THREE.BoxGeometry(0.3, 1, 0.3);
      const GAP = 0.52;
      const bars = Array.from({ length: COLS * ROWS }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const mat = new THREE.MeshStandardMaterial({ color: 0x5b5148, roughness: 0.5, metalness: 0.2, transparent: true });
        const mesh = new THREE.Mesh(geo, mat);
        const x = (col - (COLS - 1) / 2) * GAP;
        const z = (row - (ROWS - 1) / 2) * GAP - 0.4;
        const h = 0.25 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 0.9 + (Math.sin(i * 0.37) * 0.5 + 0.5) * 0.4;
        group.add(mesh);
        const picked = PICKED.indexOf(i);
        return { mesh, mat, x, z, h, picked, phase: i * 0.6 };
      });

      const beamMat = new THREE.MeshBasicMaterial({ color: 0xcfa358, transparent: true, opacity: 0, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 3), beamMat);
      beam.rotation.x = -Math.PI / 2;
      beam.scale.set(1, 1.6, 1);
      beam.position.y = 0.02;
      group.add(beam);

      const trackMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
      const track = new THREE.Mesh(new THREE.BoxGeometry(COLS * GAP, 0.04, 0.16), trackMat);
      track.position.set(0, 0.02, (ROWS / 2) * GAP + 0.55);
      group.add(track);

      const tmpColor = new THREE.Color();
      const grey = new THREE.Color(0x5b5148);
      const span = (COLS - 1) * GAP;
      const trackZ = track.position.z;
      const trackX = (k: number) => (-0.34 + (k / (PICKED.length - 1)) * 0.68) * span;
      const slots = [0.08, 0.3, 0.55, 0.85].map((f) => (f - 0.5) * span);

      const resize = () => {
        const w = mount.clientWidth || 400;
        const h = mount.clientHeight || 300;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.fov = w < 420 ? 52 : 40;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 });
      io.observe(mount);

      let lastLabel = 0;
      const start = performance.now();
      const frame = (now: number) => {
        if (disposed) return;
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const time = (now - start) / 1000;
        const t = reduced ? 8.5 : time % CYCLE;

        const idx = PHASES.findIndex((p) => t < p.until);
        if (idx !== lastLabel) {
          lastLabel = idx;
          setLabel(PHASES[idx].text);
        }

        const scan = seg(t, 2, 5);
        const found = seg(t, 5, 6.2);
        const arrange = seg(t, 6.4, 8);
        const reset = seg(t, 10, CYCLE);
        const beamX = (-0.5 + scan) * (span + 1.2);

        beamMat.opacity = Math.sin(Math.PI * scan) * 0.55;
        beam.position.x = beamX;
        trackMat.opacity = (arrange * 0.35) * (1 - reset);

        for (const b of bars) {
          const wave = reduced ? 0 : Math.sin(time * 1.4 + b.phase) * 0.06;
          let h = b.h * (1 + wave);
          let x = b.x;
          let z = b.z;
          let lift = 0;
          let dim = 1;
          tmpColor.copy(grey);
          let emissive = 0;

          const reached = b.x < beamX ? 1 : 0;
          if (b.picked >= 0) {
            const on = Math.min(reached, scan > 0 ? 1 : 0) * (1 - reset);
            tmpColor.lerp(new THREE.Color(COLORS[b.picked]), on);
            emissive = on * 0.55;
            lift = on * 0.5 * (1 - arrange);
            x = b.x + (slots[b.picked] - b.x) * arrange * (1 - reset);
            z = b.z + (trackZ - b.z) * arrange * (1 - reset);
            h = h + (0.5 - h) * arrange * (1 - reset);
          } else {
            dim = 1 - 0.7 * found * (1 - reset);
            h *= 1 - 0.35 * arrange * (1 - reset);
          }

          b.mesh.position.set(x, (h + lift) / 2, z);
          b.mesh.scale.set(1, h, 1);
          b.mat.color.copy(tmpColor);
          b.mat.emissive.copy(tmpColor).multiplyScalar(emissive);
          b.mat.opacity = dim;
        }

        group.rotation.y = reduced ? -0.25 : Math.sin(time * 0.25) * 0.28;
        camera.position.set(0, 5.4, 8.2);
        camera.lookAt(0, 0.1, 0.6);
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        geo.dispose();
        bars.forEach((b) => b.mat.dispose());
        beam.geometry.dispose();
        beamMat.dispose();
        track.geometry.dispose();
        trackMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  if (failed) return null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 30%, #1d1512 0%, #0b0708 75%)",
        border: "1px solid rgba(201,169,110,0.28)",
        boxShadow: "0 14px 36px rgba(0,0,0,0.45)",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: 280 }} aria-hidden />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "26px 16px 14px",
          textAlign: "center",
          background: "linear-gradient(to top, rgba(11,7,8,0.92), transparent)",
          pointerEvents: "none",
        }}
      >
        <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 14, color: "#f0e8d8" }}>{label}</p>
      </div>
    </div>
  );
}
