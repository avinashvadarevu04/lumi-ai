import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { drawMark } from '../lib/markCanvas';

/* ------------------------------------------------------------------ */
/*  Baked textures (once per mount)                                    */
/* ------------------------------------------------------------------ */
function bakeCarbonWeave() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, 128, 128);
  const cell = 16;
  for (let y = 0; y < 128; y += cell) {
    for (let x = 0; x < 128; x += cell) {
      const horizontal = ((x + y) / cell) % 2 === 0;
      const g = ctx.createLinearGradient(x, y, horizontal ? x + cell : x, horizontal ? y : y + cell);
      g.addColorStop(0, '#080808');
      g.addColorStop(0.5, '#1a1a1a');
      g.addColorStop(1, '#080808');
      ctx.fillStyle = g;
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function bakeChestMark() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  drawMark(ctx, 36, 36, 440, '#ffffff', 'rgba(0,0,0,0)');
  // panel seams become transparent cut-outs
  ctx.globalCompositeOperation = 'destination-out';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3.2 * 4.4;
  const s = 4.4;
  [[50, 1, 50, 21], [7, 25.5, 25, 35.5], [93, 25.5, 75, 35.5], [50, 79, 50, 99]].forEach(([a, b, d, e]) => {
    ctx.beginPath();
    ctx.moveTo(36 + a * s, 36 + b * s);
    ctx.lineTo(36 + d * s, 36 + e * s);
    ctx.stroke();
  });
  ctx.globalCompositeOperation = 'source-over';
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Humanoid android — chrome teardrop head with dot-matrix eyes, carbon-fibre
 * torso and arms, standing on a perspective grid that fades into black.
 * Strict monochrome. Cursor tracking via damped Euler rotation.
 */
export default function AIRobotCanvas({ active = true }) {
  const mountRef = useRef(null);
  const activeRef = useRef(active);
  const [status, setStatus] = useState('CURSOR TRACKING');
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let disposed = false;
    let rafId = 0;
    let visible = true;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------- Renderer & scene ---------------- */
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 700;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;cursor:pointer;';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 42);

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 80);
    const fitCamera = (w, h) => {
      const aspect = w / h;
      camera.aspect = aspect;
      // fit head-to-hips vertically, and shoulder span on narrow viewports
      const dist = Math.max(12.8, 7.4 / aspect);
      camera.position.set(0, 1.6, dist);
      camera.lookAt(0, 0.95, 0);
      camera.updateProjectionMatrix();
    };
    fitCamera(width, height);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmrem.dispose();

    /* ---------------- Lighting — pure white ---------------- */
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(-4, 7, 6);
    const rimL = new THREE.DirectionalLight(0xffffff, 2.6);
    rimL.position.set(5, 6, -5);
    const rimR = new THREE.DirectionalLight(0xffffff, 1.4);
    rimR.position.set(-6, 3, -4);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0.25);
    const faceLight = new THREE.PointLight(0xffffff, 0.9, 3);
    faceLight.position.set(0, 2.4, 1.4);
    scene.add(key, rimL, rimR, hemi, faceLight);

    /* ---------------- Materials ---------------- */
    const weave = bakeCarbonWeave();
    const chestTex = bakeChestMark();
    const carbon = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: weave,
      roughness: 0.42,
      metalness: 0.25,
      clearcoat: 0.7,
      clearcoatRoughness: 0.18,
    });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.85, metalness: 0.1 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.05, metalness: 1.0 });
    const led = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const emblem = new THREE.MeshBasicMaterial({ map: chestTex, transparent: true, depthWrite: false });
    const gridMat = new THREE.LineBasicMaterial({ color: 0x3a3a3a, transparent: true, opacity: 0.9 });
    const materials = [carbon, rubber, chrome, led, emblem, gridMat];
    const textures = [weave, chestTex];

    /* ---------------- Geometry registry ---------------- */
    const geos = [];
    const G = (g) => {
      geos.push(g);
      return g;
    };
    const add = (parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(...pos);
      m.rotation.set(...rot);
      m.scale.set(...scl);
      parent.add(m);
      return m;
    };

    /* ---------------- Floor grid ---------------- */
    const FLOOR_Y = -3.2;
    const grid = new THREE.GridHelper(120, 90, 0x3a3a3a, 0x3a3a3a);
    grid.material.dispose();
    grid.material = gridMat;
    grid.position.y = FLOOR_Y;
    scene.add(grid);

    /* ---------------- Body ---------------- */
    const root = new THREE.Group();
    scene.add(root);

    // Torso — smooth lathe silhouette, flattened front-to-back
    const torso = new THREE.Group();
    root.add(torso);
    const profile = [
      [0.02, -2.3], [0.6, -2.3], [0.74, -1.85], [0.58, -1.1], [0.62, -0.4], [0.88, 0.5], [1.08, 1.15], [1.04, 1.45], [0.62, 1.62], [0.32, 1.66], [0.02, 1.66],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const torsoMesh = add(torso, G(new THREE.LatheGeometry(profile, 64)), carbon, [0, 0, 0], [0, 0, 0], [1, 1, 0.62]);
    torsoMesh.rotation.y = Math.PI; // seam to the back

    // Chest emblem — Lupus mark
    add(torso, G(new THREE.PlaneGeometry(0.62, 0.62)), emblem, [0, 0.62, 0.63], [-0.06, 0, 0]);

    // Collar / neck base
    add(torso, G(new THREE.CylinderGeometry(0.34, 0.42, 0.16, 40)), rubber, [0, 1.7, 0]);

    // Neck
    const neck = new THREE.Group();
    neck.position.set(0, 1.78, 0);
    root.add(neck);
    add(neck, G(new THREE.CylinderGeometry(0.22, 0.26, 0.28, 32)), chrome, [0, 0.14, 0]);
    add(neck, G(new THREE.TorusGeometry(0.24, 0.025, 12, 40)), rubber, [0, 0.14, 0], [Math.PI / 2, 0, 0]);

    // Shoulders + arms
    const shoulderGeo = G(new THREE.SphereGeometry(0.34, 32, 32));
    const upperArmGeo = G(new THREE.CapsuleGeometry(0.26, 1.2, 8, 24));
    const elbowGeo = G(new THREE.SphereGeometry(0.22, 24, 24));
    const foreArmGeo = G(new THREE.CapsuleGeometry(0.22, 1.3, 8, 24));
    const arms = [];
    [-1, 1].forEach((side) => {
      const arm = new THREE.Group();
      arm.position.set(side * 1.28, 1.28, 0);
      arm.rotation.z = side * -0.12;
      torso.add(arm);
      add(arm, shoulderGeo, carbon, [0, 0, 0], [0, 0, 0], [1.05, 0.9, 1]);
      add(arm, upperArmGeo, carbon, [side * 0.08, -0.85, 0], [0, 0, side * 0.04]);
      const elbow = new THREE.Group();
      elbow.position.set(side * 0.12, -1.72, 0);
      arm.add(elbow);
      add(elbow, elbowGeo, chrome);
      add(elbow, G(new THREE.CylinderGeometry(0.14, 0.14, 0.34, 20)), rubber, [0, 0, 0], [0, 0, Math.PI / 2]);
      add(elbow, foreArmGeo, carbon, [side * 0.02, -0.95, 0.05], [0.05, 0, 0]);
      arms.push(arm);
    });

    // Head — chrome teardrop
    const head = new THREE.Group();
    head.position.set(0, 2.62, 0);
    root.add(head);
    const skull = add(head, G(new THREE.SphereGeometry(0.62, 72, 72)), chrome, [0, 0, 0], [0, 0, 0], [0.92, 1.12, 0.94]);
    skull.geometry.translate(0, 0, 0);
    // chin taper: a second, narrower sphere lower down blends into a teardrop
    add(head, G(new THREE.SphereGeometry(0.5, 64, 64)), chrome, [0, -0.36, 0.04], [0, 0, 0], [0.86, 0.95, 0.9]);
    // dark underside seam / jaw shadow line
    add(head, G(new THREE.TorusGeometry(0.4, 0.012, 8, 64)), rubber, [0, -0.66, 0.05], [Math.PI / 2, 0, 0]);

    // Dot-matrix eyes: two 5×3 clusters
    const dotGeo = G(new THREE.SphereGeometry(0.016, 8, 8));
    const eyes = new THREE.Group();
    eyes.position.set(0, -0.02, 0.6);
    head.add(eyes);
    const eyeDots = [];
    [-1, 1].forEach((side) => {
      for (let r = 0; r < 3; r += 1) {
        for (let c = 0; c < 5; c += 1) {
          const x = side * 0.19 + (c - 2) * 0.038;
          const y = (1 - r) * 0.04;
          const d = add(eyes, dotGeo, led, [x, y, -x * x * 0.9 - y * y * 0.4]);
          eyeDots.push(d);
        }
      }
    });

    /* ---------------- Cursor tracking (damped Euler) ---------------- */
    const look = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0 };
    const onPointer = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const nx = (clientX - (rect.left + rect.width / 2)) / (window.innerWidth * 0.5);
      const ny = (clientY - (rect.top + rect.height * 0.3)) / (window.innerHeight * 0.5);
      look.tYaw = THREE.MathUtils.clamp(nx * 0.7, -0.55, 0.55);
      look.tPitch = THREE.MathUtils.clamp(ny * 0.45, -0.3, 0.3);
    };
    const handleMouse = (e) => onPointer(e.clientX, e.clientY);
    const handleTouch = (e) => {
      if (e.touches[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });

    /* ---------------- Click → eye pulse + nod ---------------- */
    const nod = { x: 0 };
    const tweens = [];
    const acknowledge = () => {
      if (disposed) return;
      setEngaged(true);
      setStatus('SIGNAL ACKNOWLEDGED');
      tweens.push(
        gsap.to(eyes.scale, { x: 1.2, y: 1.2, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' }),
        gsap.to(faceLight, { intensity: 3.5, duration: 0.15, yoyo: true, repeat: 1 }),
        gsap.to(nod, {
          x: 0.14,
          duration: 0.22,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
          onComplete: () => {
            if (disposed) return;
            setEngaged(false);
            setStatus('CURSOR TRACKING');
          },
        })
      );
    };
    const dom = renderer.domElement;
    const onEnter = () => setStatus('TARGET LOCK');
    const onLeave = () => setStatus('CURSOR TRACKING');
    dom.addEventListener('click', acknowledge);
    dom.addEventListener('mouseenter', onEnter);
    dom.addEventListener('mouseleave', onLeave);

    /* ---------------- Render loop ---------------- */
    const clock = new THREE.Clock();
    let elapsed = 0;
    let blinkAt = 3;
    const render = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      elapsed += dt;
      look.yaw = THREE.MathUtils.damp(look.yaw, look.tYaw, 4.5, dt);
      look.pitch = THREE.MathUtils.damp(look.pitch, look.tPitch, 4.5, dt);

      head.rotation.set(look.pitch + nod.x, look.yaw, -look.yaw * 0.08);
      neck.rotation.set(look.pitch * 0.3, look.yaw * 0.4, 0);
      torso.rotation.set(look.pitch * 0.05, look.yaw * 0.14, 0);
      arms[0].rotation.x = Math.sin(elapsed * 0.9) * 0.02;
      arms[1].rotation.x = Math.sin(elapsed * 0.9 + 1.5) * 0.02;

      if (!reduceMotion) root.position.y = Math.sin(elapsed * 1.2) * 0.035;

      if (elapsed > blinkAt) {
        const t = elapsed - blinkAt;
        const s = t < 0.18 ? 1 - Math.sin((t / 0.18) * Math.PI) * 0.9 : 1;
        for (let i = 0; i < eyeDots.length; i += 1) eyeDots[i].scale.setScalar(s);
        if (t > 0.2) blinkAt = elapsed + 3 + Math.random() * 4;
      }
      if (!gsap.isTweening(faceLight)) faceLight.intensity = 0.9 * (0.9 + Math.sin(elapsed * 2.2) * 0.15);
      renderer.render(scene, camera);
    };
    const loop = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(loop);
      if (!visible || !activeRef.current || document.hidden) return;
      render();
    };
    render();
    loop();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) clock.getDelta();
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    const handleResize = () => {
      if (disposed) return;
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      fitCamera(w, h);
    };
    window.addEventListener('resize', handleResize);

    /* ---------------- Cleanup ---------------- */
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      io.disconnect();
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf([eyes.scale, faceLight, nod]);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('click', acknowledge);
      dom.removeEventListener('mouseenter', onEnter);
      dom.removeEventListener('mouseleave', onLeave);
      grid.geometry.dispose();
      geos.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envRT.dispose();
      scene.environment = null;
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      if (dom.parentNode === container) container.removeChild(dom);
    };
  }, []);

  return (
    <div className="relative h-full w-full select-none">
      <div ref={mountRef} className="absolute inset-0 z-10" />
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0">
        <div
          className={`inline-flex items-center gap-2.5 rounded-full border bg-black/80 px-4 py-1.5 backdrop-blur-md transition-all duration-300 ${
            engaged ? 'scale-105 border-white' : 'border-white/15'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white">{status}</span>
          <span className="text-[10px] text-neutral-600">•</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
            {engaged ? 'PULSE' : 'CLICK TO ENGAGE'}
          </span>
        </div>
      </div>
    </div>
  );
}
