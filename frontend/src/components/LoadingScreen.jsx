import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { LupusMark } from './BrandLogo';
import { drawMark } from '../lib/markCanvas';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const GRID = [-1, 0, 1];
const CUBIE = 0.95;
const SPACING = 1.0;
const HALF_EXTENT = SPACING + CUBIE / 2; // outer edge of the 3×3 face
const ATLAS = 2048;
const Q = ATLAS / 2;
// Atlas quadrants (u,v in texture space; cx,cy in canvas quadrant coords)
const REGION = {
  logo: { u: 0, v: 0.5, cx: 0, cy: 0 }, // +z front face: white tiles + black brand mark
  plain: { u: 0.5, v: 0.5, cx: 1, cy: 0 }, // every other exterior face: white tiles
  black: { u: 0, v: 0, cx: 0, cy: 1 }, // interior faces
};
const FACE = { PX: 0, NX: 1, PY: 2, NY: 3, PZ: 4, NZ: 5 };

/* ------------------------------------------------------------------ */
/*  Atlas baking — runs once                                           */
/* ------------------------------------------------------------------ */
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTiles(ctx, ox, oy) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(ox, oy, Q, Q);
  const t = Q / 3;
  const inset = t * 0.055;
  const r = t * 0.16;
  ctx.fillStyle = '#ffffff';
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      roundedRect(ctx, ox + col * t + inset, oy + row * t + inset, t - inset * 2, t - inset * 2, r);
      ctx.fill();
    }
  }
}

function bakeAtlas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, ATLAS, ATLAS);
  // plain white-tile faces
  drawTiles(ctx, REGION.plain.cx * Q, REGION.plain.cy * Q);
  // logo face: tiles + mark spanning the whole 3×3 face
  const lx = REGION.logo.cx * Q;
  const ly = REGION.logo.cy * Q;
  drawTiles(ctx, lx, ly);
  const size = Q * 0.84;
  drawMark(ctx, lx + (Q - size) / 2, ly + (Q - size) / 2, size, '#000000', '#ffffff');
  // interior quadrant stays black
}

/* ------------------------------------------------------------------ */
/*  UV remap: point each cubie face at its 1/9 tile inside a region    */
/* ------------------------------------------------------------------ */
const _p00 = new THREE.Vector3();
const _p10 = new THREE.Vector3();
const _p01 = new THREE.Vector3();
const _u = new THREE.Vector3();
const _v = new THREE.Vector3();
const _g = new THREE.Vector3();

function remapFace(geo, faceIndex, region, grid) {
  const uv = geo.attributes.uv;
  const pos = geo.attributes.position;
  const base = faceIndex * 4;

  if (region === REGION.black) {
    for (let i = 0; i < 4; i += 1) {
      const idx = base + i;
      uv.setXY(idx, REGION.black.u + 0.2 + uv.getX(idx) * 0.1, REGION.black.v + 0.2 + uv.getY(idx) * 0.1);
    }
    uv.needsUpdate = true;
    return;
  }

  let i00 = -1;
  let i10 = -1;
  let i01 = -1;
  for (let i = 0; i < 4; i += 1) {
    const idx = base + i;
    const x = uv.getX(idx);
    const y = uv.getY(idx);
    if (x < 0.5 && y < 0.5) i00 = idx;
    else if (x > 0.5 && y < 0.5) i10 = idx;
    else if (x < 0.5 && y > 0.5) i01 = idx;
  }
  _p00.fromBufferAttribute(pos, i00);
  _p10.fromBufferAttribute(pos, i10);
  _p01.fromBufferAttribute(pos, i01);
  _u.subVectors(_p10, _p00).normalize();
  _v.subVectors(_p01, _p00).normalize();
  _g.set(grid[0], grid[1], grid[2]);
  const col = Math.round(_g.dot(_u)) + 1;
  const row = Math.round(_g.dot(_v)) + 1;
  const inset = 0.003;
  for (let i = 0; i < 4; i += 1) {
    const idx = base + i;
    const lu = THREE.MathUtils.clamp(uv.getX(idx), inset, 1 - inset);
    const lv = THREE.MathUtils.clamp(uv.getY(idx), inset, 1 - inset);
    uv.setXY(idx, region.u + ((col + lu) / 3) * 0.5, region.v + ((row + lv) / 3) * 0.5);
  }
  uv.needsUpdate = true;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function LoadingScreen({ onComplete }) {
  const containerRef = useRef(null);
  const mountRef = useRef(null);
  const cardRef = useRef(null);
  const markRef = useRef(null);
  const wordRef = useRef(null);
  const skipBtnRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const skipRef = useRef(() => {});

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    const mount = mountRef.current;
    const card = cardRef.current;
    const mark = markRef.current;
    const word = wordRef.current;
    if (!container || !mount || !card || !mark || !word) return undefined;

    let disposed = false;
    let finished = false;
    let rafId = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('intro-lock');

    const finish = () => {
      if (finished || disposed) return;
      finished = true;
      document.body.classList.remove('intro-lock');
      onCompleteRef.current?.();
    };

    /* ---------------- Renderer / scene ---------------- */
    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);
    const fitCamera = (w, h) => {
      const aspect = w / h;
      // cube ≈ 34% of the shorter viewport dimension, dead centre
      const dist = 13.5 * (aspect < 1 ? Math.min(1.9, 1 / aspect) : 1);
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    };
    fitCamera(width, height);

    // Flat, bright white lighting — faces read as paper-white with faint shading
    scene.add(new THREE.AmbientLight(0xffffff, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(3, 5, 6);
    scene.add(key);

    /* ---------------- Atlas + shared material ---------------- */
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = ATLAS;
    atlasCanvas.height = ATLAS;
    bakeAtlas(atlasCanvas);
    const atlas = new THREE.CanvasTexture(atlasCanvas);
    atlas.colorSpace = THREE.SRGBColorSpace;
    atlas.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    const cubieMat = new THREE.MeshStandardMaterial({ map: atlas, roughness: 0.9, metalness: 0 });

    /* ---------------- Cube rig ---------------- */
    const rig = new THREE.Group();
    const cube = new THREE.Group();
    rig.add(cube);
    scene.add(rig);

    const cubies = [];
    const geometries = [];
    GRID.forEach((gx) =>
      GRID.forEach((gy) =>
        GRID.forEach((gz) => {
          const geo = new THREE.BoxGeometry(CUBIE, CUBIE, CUBIE);
          const grid = [gx, gy, gz];
          remapFace(geo, FACE.PX, gx === 1 ? REGION.plain : REGION.black, grid);
          remapFace(geo, FACE.NX, gx === -1 ? REGION.plain : REGION.black, grid);
          remapFace(geo, FACE.PY, gy === 1 ? REGION.plain : REGION.black, grid);
          remapFace(geo, FACE.NY, gy === -1 ? REGION.plain : REGION.black, grid);
          remapFace(geo, FACE.PZ, gz === 1 ? REGION.logo : REGION.black, grid);
          remapFace(geo, FACE.NZ, gz === -1 ? REGION.plain : REGION.black, grid);
          geo.clearGroups();
          geometries.push(geo);
          const mesh = new THREE.Mesh(geo, cubieMat);
          mesh.position.set(gx * SPACING, gy * SPACING, gz * SPACING);
          cube.add(mesh);
          cubies.push({ mesh, basePos: mesh.position.clone(), baseQuat: new THREE.Quaternion() });
        })
      )
    );

    /* ---------------- Move queue (valid twists, exact inverses) ---------------- */
    const AXIS = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
    const _q = new THREE.Quaternion();
    const tl = gsap.timeline({ paused: true, onComplete: finish });
    if (reduceMotion) tl.timeScale(2.5);

    const addMove = (axis, layer, angle, duration, at, ease = 'power2.inOut') => {
      const proxy = { t: 0 };
      let members = [];
      tl.to(
        proxy,
        {
          t: 1,
          duration,
          ease,
          onStart: () => {
            members = cubies.filter((c) => Math.round(c.basePos[axis] / SPACING) === layer);
          },
          onUpdate: () => {
            _q.setFromAxisAngle(AXIS[axis], angle * proxy.t);
            for (let i = 0; i < members.length; i += 1) {
              const c = members[i];
              c.mesh.position.copy(c.basePos).applyQuaternion(_q);
              c.mesh.quaternion.copy(_q).multiply(c.baseQuat);
            }
          },
          onComplete: () => {
            _q.setFromAxisAngle(AXIS[axis], angle);
            for (let i = 0; i < members.length; i += 1) {
              const c = members[i];
              c.basePos.applyQuaternion(_q);
              c.basePos.set(
                Math.round(c.basePos.x / SPACING) * SPACING,
                Math.round(c.basePos.y / SPACING) * SPACING,
                Math.round(c.basePos.z / SPACING) * SPACING
              );
              c.baseQuat.premultiply(_q).normalize();
              c.mesh.position.copy(c.basePos);
              c.mesh.quaternion.copy(c.baseQuat);
            }
          },
        },
        at
      );
    };
    const H = Math.PI / 2;

    /* ---------------- Choreography ---------------- */
    // 0.0 → 3.7  tumble in zero gravity, scramble, then solve; ends face-on
    rig.rotation.set(0.85, -Math.PI * 0.85, 0.35);
    cube.scale.setScalar(0.6);
    tl.to(cube.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'power3.out' }, 0);
    tl.to(rig.rotation, { x: 0, y: Math.PI * 2, z: 0, duration: 3.7, ease: 'power2.inOut' }, 0);

    addMove('y', 1, H, 0.42, 0.35);
    addMove('x', 0, -H, 0.42, 0.82);
    addMove('z', 1, H, 0.42, 1.29);
    addMove('x', -1, H, 0.42, 1.76);
    addMove('x', -1, -H, 0.34, 2.25, 'power3.inOut');
    addMove('z', 1, -H, 0.34, 2.62, 'power3.inOut');
    addMove('x', 0, H, 0.34, 2.99, 'power3.inOut');
    addMove('y', 1, -H, 0.34, 3.36, 'power3.inOut');

    // 3.75  the front face becomes a flat white card exactly where the face is
    const flatten = { t: 0 };
    const corner = new THREE.Vector3();
    const placeCard = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.updateMatrixWorld();
      corner.set(HALF_EXTENT, HALF_EXTENT, HALF_EXTENT).project(camera);
      const half = Math.abs(corner.x) * (w / 2);
      const halfY = Math.abs(corner.y) * (h / 2);
      const size = Math.round(Math.max(half, halfY) * 2 * (cube.scale.x || 1));
      card.style.width = `${size}px`;
      card.style.height = `${size}px`;
      card.style.borderRadius = `${Math.round(size * 0.055)}px`;
      mark.style.width = `${Math.round(size * 0.84)}px`;
      mark.style.height = `${Math.round(size * 0.84)}px`;
      return size;
    };
    tl.to(
      flatten,
      {
        t: 1,
        duration: 0.3,
        ease: 'power2.inOut',
        onStart: () => {
          placeCard();
          gsap.set(card, { autoAlpha: 0 });
        },
        onUpdate: () => {
          gsap.set(card, { autoAlpha: flatten.t });
          gsap.set(mount, { autoAlpha: 1 - flatten.t });
        },
      },
      3.75
    );

    // 4.05 → 4.75  card grows, wordmark + tagline fade in beneath the mark
    const cardSize = () => Math.min(420, Math.min(window.innerWidth, window.innerHeight) * 0.62);
    tl.to(card, { width: () => cardSize(), height: () => cardSize(), borderRadius: 30, duration: 0.7, ease: 'power3.inOut' }, 4.05);
    tl.to(mark, { width: () => cardSize() * 0.38, height: () => cardSize() * 0.38, y: () => -cardSize() * 0.12, duration: 0.7, ease: 'power3.inOut' }, 4.05);
    tl.fromTo(word, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 4.45);
    tl.to(skipBtnRef.current, { autoAlpha: 0, duration: 0.3 }, 4.05);

    // 5.6 → 6.3  card expands to fill the viewport (pure white)
    tl.to(card, { width: () => window.innerWidth + 4, height: () => window.innerHeight + 4, borderRadius: 0, duration: 0.7, ease: 'power3.inOut' }, 5.6);

    // 6.45 → 7.0  white screen dissolves into the site
    tl.to(container, { autoAlpha: 0, duration: 0.55, ease: 'power2.inOut' }, 6.45);

    /* ---------------- Render loop ---------------- */
    let running = true;
    const clock = new THREE.Clock();
    let elapsed = 0;
    const animate = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;
      cube.position.y = Math.sin(elapsed * 1.4) * 0.04 * (1 - flatten.t);
      renderer.render(scene, camera);
      if (flatten.t >= 1) running = false; // canvas is hidden from here on
    };
    animate();
    tl.play(0);

    /* ---------------- Events ---------------- */
    const handleResize = () => {
      if (disposed) return;
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      fitCamera(width, height);
    };
    window.addEventListener('resize', handleResize);

    const skip = () => {
      if (disposed || finished) return;
      tl.kill();
      finish();
    };
    skipRef.current = skip;
    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', handleKey);
    const handleVisibility = () => {
      if (document.hidden) tl.pause();
      else if (!finished) tl.resume();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    /* ---------------- Cleanup ---------------- */
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      tl.kill();
      gsap.killTweensOf([card, mark, word, mount, container]);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.body.classList.remove('intro-lock');
      geometries.forEach((g) => g.dispose());
      cubieMat.dispose();
      atlas.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] select-none overflow-hidden bg-black text-white"
      aria-label="Lupus AI Labs intro"
    >
      {/* Full-screen WebGL viewport */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Flat white card that the cube's front face turns into */}
      <div
        ref={cardRef}
        className="invisible absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden bg-white text-black"
        style={{ width: 0, height: 0 }}
      >
        <div ref={markRef} className="flex items-center justify-center">
          <LupusMark className="h-full w-full text-black" />
        </div>
        <div ref={wordRef} className="invisible absolute bottom-[14%] left-0 right-0 flex flex-col items-center px-4 text-center">
          <span className="font-display text-xl font-bold uppercase leading-none tracking-[0.34em] text-black sm:text-2xl">Lupus</span>
          <span className="mt-2 inline-flex items-center gap-2 font-mono text-[9px] font-medium uppercase tracking-[0.5em] text-neutral-700 sm:text-[10px]">
            <span className="h-px w-5 bg-current" aria-hidden="true" />
            <span className="translate-x-[0.25em]">AI Labs</span>
            <span className="h-px w-5 bg-current" aria-hidden="true" />
          </span>
          <span className="mt-4 text-[11px] text-neutral-500 sm:text-xs">Production-ready AI systems for real business operations</span>
        </div>
      </div>

      {/* Minimal skip affordance */}
      <button
        ref={skipBtnRef}
        type="button"
        onClick={() => skipRef.current()}
        className="absolute right-5 top-5 cursor-pointer font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white sm:right-8 sm:top-7"
      >
        Skip →
      </button>
    </div>
  );
}
