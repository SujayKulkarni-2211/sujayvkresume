/* world.js — Three.js scene: starfield, Daasa nebula, Joy of Learning ring */
'use strict';

const CosmosWorld = (() => {
  let scene, renderer, camera;
  let nebulaCore;
  let orbitRing;
  let starPoints;
  let clock;

  const NEBULA_Z = -500;   // nebula position — visible but distant
  const RING_R   = 280;    // camera orbit radius around nebula
  let   camAngle = 0;      // current camera orbit angle
  let   isOrbiting = false;

  // ── INIT ──────────────────────────────────────────────────
  function init(canvas) {
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x00000a, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x00000a, 0.00012);

    camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 14000);
    camera.position.set(0, 40, 200);
    camera.lookAt(0, 0, 0);

    window.addEventListener('resize', onResize);

    _buildStarfield();
    _buildDeepSpaceWash();
    _buildDaasaNebula();
    _buildFunInLearningRing();
    _buildLighting();

    return { scene, renderer, camera };
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ── STARFIELD ────────────────────────────────────────────
  function _buildStarfield() {
    const N = 26000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    const palettes = [
      [1.0, 1.0, 1.0],   // white
      [0.85, 0.90, 1.0], // cold blue-white
      [0.93, 0.82, 1.0], // lavender
      [0.75, 0.93, 1.0], // cyan-white
      [1.0,  0.95, 0.78],// warm yellow
      [1.0,  0.80, 0.80],// faint red
    ];

    for (let i = 0; i < N; i++) {
      const r = 200 + Math.random() * 5000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      const c = palettes[Math.floor(Math.random() * palettes.length)];
      col[i*3] = c[0]; col[i*3+1] = c[1]; col[i*3+2] = c[2];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    starPoints = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      sizeAttenuation: true,
    }));
    scene.add(starPoints);
  }

  // ── DEEP SPACE WASH (faint colour behind everything) ─────
  function _buildDeepSpaceWash() {
    const clouds = [
      { x: -700, y:  250, z:-3000, hex:0x4c0fa0, r:2200, op:0.55 },
      { x:  800, y: -200, z:-3500, hex:0x1e3a8a, r:1800, op:0.45 },
      { x:   60, y:  400, z:-2600, hex:0x6b21d4, r:1600, op:0.50 },
      { x: -500, y: -300, z:-2200, hex:0x0c4a6e, r:1400, op:0.42 },
      { x:  600, y:  180, z:-1800, hex:0x581c87, r:1200, op:0.48 },
    ];
    clouds.forEach(({ x, y, z, hex, r, op }) => {
      const cvs = document.createElement('canvas');
      cvs.width = cvs.height = 256;
      const ctx = cvs.getContext('2d');
      const c = new THREE.Color(hex);
      const cr = Math.round(c.r * 255), cg = Math.round(c.g * 255), cb = Math.round(c.b * 255);
      for (let p = 0; p < 8; p++) {
        const px = 30 + Math.random() * 196, py = 30 + Math.random() * 196, pr = 60 + Math.random() * 100;
        const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
        g.addColorStop(0,   `rgba(${cr},${cg},${cb},0.20)`);
        g.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.06)`);
        g.addColorStop(1,   `rgba(0,0,0,0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
      }
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(r * 2, r * 2),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs), transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
      );
      mesh.position.set(x, y, z);
      mesh.lookAt(0, 0, 0);
      scene.add(mesh);
    });
  }

  // ── DAASA NEBULA (irregular rupture shape, NOT round) ────
  function _buildDaasaNebula() {
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 2048;
    const ctx = cvs.getContext('2d');

    // --- Core glow: off-centre, asymmetric
    const coreX = 980, coreY = 1060; // slightly off-centre

    // Outer haze — large asymmetric blobs
    const blobs = [
      { x: coreX,       y: coreY,       r: 820, a: 0.72, col: [90, 30, 200]  },
      { x: coreX + 280, y: coreY - 200, r: 520, a: 0.62, col: [120, 50, 230] },
      { x: coreX - 350, y: coreY + 180, r: 460, a: 0.58, col: [60,  20, 180] },
      { x: coreX + 120, y: coreY + 310, r: 380, a: 0.60, col: [100, 40, 210] },
      { x: coreX - 180, y: coreY - 280, r: 340, a: 0.55, col: [80,  35, 190] },
      { x: coreX + 400, y: coreY + 100, r: 260, a: 0.52, col: [140, 60, 240] },
      { x: coreX - 420, y: coreY - 120, r: 240, a: 0.48, col: [50,  15, 160] },
    ];

    blobs.forEach(({ x, y, r, a, col }) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0,    `rgba(${col[0]},${col[1]},${col[2]},${a})`);
      g.addColorStop(0.35, `rgba(${col[0]},${col[1]},${col[2]},${(a * 0.45).toFixed(2)})`);
      g.addColorStop(0.7,  `rgba(${col[0]},${col[1]},${col[2]},${(a * 0.12).toFixed(2)})`);
      g.addColorStop(1,    `rgba(0,0,0,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 2048, 2048);
    });

    // Mid-brightness lobes — coloured variation (teal/pink edges)
    const lobes = [
      { x: coreX + 320, y: coreY - 300, r: 200, col: [40, 120, 200], a: 0.50 },
      { x: coreX - 300, y: coreY + 350, r: 180, col: [180, 40, 180], a: 0.44 },
      { x: coreX + 150, y: coreY + 420, r: 150, col: [20,  160, 180], a: 0.40 },
      { x: coreX - 400, y: coreY - 200, r: 140, col: [200, 80,  120], a: 0.38 },
      { x: coreX + 500, y: coreY - 80,  r: 120, col: [60,  180, 220], a: 0.36 },
    ];
    lobes.forEach(({ x, y, r, col, a }) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0,   `rgba(${col[0]},${col[1]},${col[2]},${a})`);
      g.addColorStop(0.5, `rgba(${col[0]},${col[1]},${col[2]},${(a * 0.3).toFixed(2)})`);
      g.addColorStop(1,   `rgba(0,0,0,0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, 2048, 2048);
    });

    // Filament streaks — irregular, NOT symmetric
    ctx.globalCompositeOperation = 'screen';
    const filaments = [
      { ax:coreX,       ay:coreY,       bx:coreX+680,  by:coreY-520,  w:28, col:'rgba(160,120,255,0.55)' },
      { ax:coreX,       ay:coreY,       bx:coreX-600,  by:coreY+440,  w:22, col:'rgba(120,80,220,0.48)'  },
      { ax:coreX,       ay:coreY,       bx:coreX+200,  by:coreY+700,  w:32, col:'rgba(80,60,200,0.50)'   },
      { ax:coreX,       ay:coreY,       bx:coreX-500,  by:coreY-580,  w:20, col:'rgba(140,100,240,0.44)' },
      { ax:coreX+100,   ay:coreY-80,    bx:coreX+820,  by:coreY+200,  w:16, col:'rgba(60,160,220,0.40)'  },
      { ax:coreX-120,   ay:coreY+100,   bx:coreX-700,  by:coreY-300,  w:14, col:'rgba(200,80,180,0.38)'  },
      { ax:coreX+50,    ay:coreY+120,   bx:coreX-200,  by:coreY+820,  w:24, col:'rgba(100,80,210,0.46)'  },
      { ax:coreX,       ay:coreY,       bx:coreX+380,  by:coreY+600,  w:18, col:'rgba(130,90,230,0.42)'  },
    ];
    filaments.forEach(({ ax, ay, bx, by, w, col }) => {
      // Curved filament using quadratic bezier
      const cpx = ax + (bx - ax) * 0.5 + (Math.random() - 0.5) * 200;
      const cpy = ay + (by - ay) * 0.5 + (Math.random() - 0.5) * 200;
      const g = ctx.createLinearGradient(ax, ay, bx, by);
      g.addColorStop(0,   col);
      g.addColorStop(0.5, col.replace(/[\d.]+\)$/, '0.08)'));
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(cpx, cpy, bx, by);
      ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';

    // Bright inner region — layered, still off-centre
    const innerLayers = [
      { x: coreX,      y: coreY,      r: 220, col:[180,140,255], a:0.92 },
      { x: coreX+30,   y: coreY-20,   r: 130, col:[210,190,255], a:1.00 },
      { x: coreX+10,   y: coreY+10,   r:  70, col:[240,230,255], a:1.00 },
      { x: coreX,      y: coreY,      r:  24, col:[255,255,255], a:1.00 },
    ];
    innerLayers.forEach(({ x, y, r, col, a }) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0,    `rgba(${col[0]},${col[1]},${col[2]},${a})`);
      g.addColorStop(0.45, `rgba(${col[0]},${col[1]},${col[2]},${(a*0.35).toFixed(2)})`);
      g.addColorStop(1,    `rgba(0,0,0,0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, 2048, 2048);
    });

    // Billboard — large plane, always faces camera
    const tex = new THREE.CanvasTexture(cvs);
    const nebulaPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1200, 1200),
      new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 1.0,
        depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    );
    nebulaPlane.position.set(0, 0, NEBULA_Z);
    nebulaPlane.lookAt(0, 0, 0);
    scene.add(nebulaPlane);

    // Second, larger translucent copy for wide outer glow
    const nebulaPlane2 = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0.35,
        depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    );
    nebulaPlane2.position.set(0, 0, NEBULA_Z - 1);
    nebulaPlane2.lookAt(0, 0, 0);
    scene.add(nebulaPlane2);

    // Core: pure point light glow — no visible meshes
    nebulaCore = new THREE.Group();
    nebulaCore.position.set(0, 0, NEBULA_Z);
    scene.add(nebulaCore);

    const coreLight = new THREE.PointLight(0x9b4ff0, 28, 1200);
    nebulaCore.add(coreLight);

    // DAASA label
    const lc = document.createElement('canvas');
    lc.width = 500; lc.height = 110;
    const lx = lc.getContext('2d');
    lx.fillStyle = 'rgba(8,2,24,0.82)';
    lx.beginPath(); lx.roundRect(3, 3, 494, 104, 16); lx.fill();
    lx.strokeStyle = 'rgba(196,181,253,0.75)';
    lx.lineWidth = 2;
    lx.beginPath(); lx.roundRect(3, 3, 494, 104, 16); lx.stroke();
    lx.fillStyle = '#f3e8ff';
    lx.font = 'bold 44px "Courier New"';
    lx.textAlign = 'center';
    lx.fillText('DAASA', 250, 54);
    lx.fillStyle = 'rgba(216,180,254,0.72)';
    lx.font = '18px "Courier New"';
    lx.fillText('Nebulae  ·  Core of the Cosmos', 250, 84);

    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(110, 24),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(lc),
        transparent: true, opacity: 0.92,
        depthWrite: false, side: THREE.DoubleSide,
      })
    );
    labelMesh.position.set(0, 105, NEBULA_Z);
    scene.add(labelMesh);
  }

  // ── Joy of Learning RING ─────────────────────────────────
  function _buildFunInLearningRing() {
    // Tilt ring 18° so it reads as a 3D orbit from cockpit view
    const tiltX = Math.PI / 2 + 0.32;

    orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(RING_R, 1.2, 8, 240),
      new THREE.MeshBasicMaterial({
        color: 0xa78bfa, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    orbitRing.rotation.x = tiltX;
    orbitRing.position.set(0, 0, NEBULA_Z);
    scene.add(orbitRing);

    // Glow halo
    const glow = new THREE.Mesh(
      new THREE.TorusGeometry(RING_R, 5, 8, 240),
      new THREE.MeshBasicMaterial({
        color: 0x7c3aed, transparent: true, opacity: 0.07,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      })
    );
    glow.rotation.x = tiltX;
    glow.position.set(0, 0, NEBULA_Z);
    scene.add(glow);

    // Sparkle dots on orbit path
    const N = 240;
    const dp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const px = Math.cos(a) * RING_R;
      const pz = Math.sin(a) * RING_R;
      // Apply same tilt manually
      dp[i*3]   = px;
      dp[i*3+1] = pz * Math.sin(tiltX - Math.PI / 2);
      dp[i*3+2] = NEBULA_Z + pz * Math.cos(tiltX - Math.PI / 2);
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    scene.add(new THREE.Points(dg, new THREE.PointsMaterial({
      color: 0xddd6fe, size: 1.4, transparent: true, opacity: 0.55, sizeAttenuation: true,
    })));

    // "Joy of Learning" label floating beside ring
    const rlc = document.createElement('canvas');
    rlc.width = 600; rlc.height = 72;
    const rlx = rlc.getContext('2d');
    rlx.fillStyle = 'rgba(196,181,253,0.88)';
    rlx.font = 'bold 32px "Courier New"';
    rlx.textAlign = 'center';
    rlx.fillText('✦ Joy of Learning ✦', 300, 48);

    const rl = new THREE.Mesh(
      new THREE.PlaneGeometry(155, 19),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(rlc),
        transparent: true, opacity: 0.85,
        depthWrite: false, side: THREE.DoubleSide,
      })
    );
    rl.position.set(RING_R + 55, 12, NEBULA_Z);
    scene.add(rl);
  }

  // ── LIGHTING ─────────────────────────────────────────────
  function _buildLighting() {
    scene.add(new THREE.AmbientLight(0x1a0a2e, 3.0));
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(100, 120, 200); scene.add(sun);
    const nL = new THREE.PointLight(0x7c3aed, 12, 2000);
    nL.position.set(0, 0, NEBULA_Z); scene.add(nL);
    const bL = new THREE.PointLight(0x3b82f6, 2, 600);
    bL.position.set(80, -20, 60); scene.add(bL);
  }

  let _lastTickTime = null;

  // ── TICK ─────────────────────────────────────────────────
  function tick() {
    const now = performance.now() * 0.001; // seconds
    const dt  = _lastTickTime === null ? 0 : Math.min(now - _lastTickTime, 0.1);
    _lastTickTime = now;
    const t = clock.getElapsedTime();

    if (starPoints) {
      starPoints.rotation.y = t * 0.005;
      starPoints.rotation.x = Math.sin(t * 0.035) * 0.006;
    }

    if (nebulaCore) {
      nebulaCore.scale.setScalar(1 + Math.sin(t * 0.7) * 0.06);
    }

    if (orbitRing) orbitRing.rotation.z = t * 0.02;

    // Camera orbits the nebula when flag is set
    if (isOrbiting) {
      camAngle += 0.08 * dt; // slow, majestic — ~78s per full loop
      const cx = Math.cos(camAngle) * RING_R;
      const cz = NEBULA_Z + Math.sin(camAngle) * RING_R;
      const cy = Math.sin(camAngle * 0.35) * 18;
      camera.position.set(cx, cy, cz);
      camera.lookAt(0, 0, NEBULA_Z);
    }
  }

  function startRender() {}
  function stopRender()  {}
  function pauseOrbit()  { isOrbiting = false; }
  function resumeOrbit() { isOrbiting = true; }

  // ── CAMERA FLIGHT: zoom into ship, then fly to orbit ────────
  function flyThroughShipThenOrbit(phase1Sec, phase2Sec, onComplete) {
    isOrbiting = false;
    camAngle = 0;

    const p0 = camera.position.clone();           // start: (0,40,200)
    const p1 = new THREE.Vector3(0, 5, 14);       // into ship cockpit glass
    const p2 = new THREE.Vector3(RING_R, 20, NEBULA_Z); // orbit entry

    const lk0 = new THREE.Vector3(0, 0, 0);
    const lk1 = new THREE.Vector3(0, 0, -80);    // looking through ship toward nebula
    const lk2 = new THREE.Vector3(0, 0, NEBULA_Z);

    const t0 = performance.now();

    const step = (now) => {
      const elapsed = now - t0;

      if (elapsed < phase1Sec * 1000) {
        // Phase 1: build view → inside ship
        const raw  = elapsed / (phase1Sec * 1000);
        const ease = raw < 0.5 ? 2*raw*raw : -1+(4-2*raw)*raw;
        camera.position.lerpVectors(p0, p1, ease);
        camera.lookAt(new THREE.Vector3().lerpVectors(lk0, lk1, ease));
        requestAnimationFrame(step);
      } else {
        // Phase 2: inside ship → orbit position
        const raw  = Math.min((elapsed - phase1Sec * 1000) / (phase2Sec * 1000), 1);
        const ease = raw < 0.5 ? 2*raw*raw : -1+(4-2*raw)*raw;
        camera.position.lerpVectors(p1, p2, ease);
        camera.lookAt(new THREE.Vector3().lerpVectors(lk1, lk2, ease));
        if (raw < 1) {
          requestAnimationFrame(step);
        } else {
          camera.lookAt(lk2);
          isOrbiting = true;
          if (onComplete) onComplete();
        }
      }
    };
    requestAnimationFrame(step);
  }

  // Keep old name as alias so nothing breaks if called elsewhere
  function flyIntoOrbit(durationSec, onComplete) {
    flyThroughShipThenOrbit(0, durationSec, onComplete);
  }

  function getScene()    { return scene; }
  function getCamera()   { return camera; }
  function getRenderer() { return renderer; }
  function getNebulaCore() { return nebulaCore; }
  function getOrbitRing()  { return orbitRing; }
  function getNEBULA_Z()   { return NEBULA_Z; }
  function getRING_R()     { return RING_R; }

  return {
    init, tick, startRender, stopRender,
    pauseOrbit, resumeOrbit,
    flyIntoOrbit, flyThroughShipThenOrbit,
    getScene, getCamera, getRenderer,
    getNebulaCore, getOrbitRing, getNEBULA_Z, getRING_R,
  };
})();
