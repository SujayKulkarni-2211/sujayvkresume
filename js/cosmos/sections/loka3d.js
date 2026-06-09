/* loka3d.js — Shared 3D building blocks for the "realm" sections
 * (Achievement lotus, Milky Way auditorium, etc.).
 *
 * Pure helpers that return THREE objects; sections compose them. This keeps
 * the heavy geometry written once and reused across sections.
 */
'use strict';

const Loka3D = (() => {

  // A glowing framed image panel (DoubleSide so it reads when rotated).
  // Returns a Group { frame, img } you can position / billboard.
  //
  // Decodes via a plain <img> → CanvasTexture (the browser's normal image
  // pipeline), reliable for any valid JPEG. depthTest/depthWrite are off and
  // renderOrder is high so the photo always draws on top — this prevents the
  // additive aura/ring of nearby worlds from occluding it (which left some
  // images black depending on draw order).
  function photoPanel(url, w, h, frameColor) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x222233, transparent: true, opacity: 0.95, side: THREE.DoubleSide,
      depthTest: false, depthWrite: false,
    });
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => {
      try {
        const cnv = document.createElement('canvas');
        cnv.width = im.naturalWidth; cnv.height = im.naturalHeight;
        cnv.getContext('2d').drawImage(im, 0, 0);
        const tex = new THREE.CanvasTexture(cnv);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        mat.map = tex;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
      } catch (e) {
        mat.color.set(0x882222); mat.needsUpdate = true;
      }
    };
    im.onerror = () => { mat.color.set(0x552233); mat.needsUpdate = true; };
    im.src = url;

    const img = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    img.renderOrder = 999;                     // draw photo on top of auras
    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(w + 6, h + 6),
      new THREE.MeshBasicMaterial({ color: frameColor, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
    );
    frame.position.z = -1;
    const g = new THREE.Group();
    g.add(frame); g.add(img);
    return g;
  }

  // A glowing radial halo sphere (additive, back-side) — soft light bloom.
  function halo(radius, color, opacity) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, 24, 24),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity,
        blending: THREE.AdditiveBlending, side: THREE.BackSide })
    );
  }

  // Star sprinkle as a Points cloud filling a rough sphere of `radius`.
  function starSprinkle(count, radius, color, size) {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.4 + Math.random() * 0.6);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      p[i*3]   = r * Math.sin(ph) * Math.cos(th);
      p[i*3+1] = r * Math.sin(ph) * Math.sin(th);
      p[i*3+2] = r * Math.cos(ph);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color: color || 0xe9d8ff, size: size || 3, transparent: true, opacity: 0.8,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
  }

  // A small golden trophy (cup + handles + stem + base). Returns a Group.
  function trophyCore(gold) {
    gold = gold || 0xf0b53c;
    const mat = new THREE.MeshStandardMaterial({
      color: gold, metalness: 1.0, roughness: 0.18,
      emissive: 0xc8911f, emissiveIntensity: 0.5,
    });
    const g = new THREE.Group();
    const cup = new THREE.Mesh(new THREE.SphereGeometry(26, 24, 16, 0, Math.PI*2, 0, Math.PI/2), mat);
    cup.rotation.x = Math.PI; cup.position.y = 10; g.add(cup);
    [-1, 1].forEach(s => {
      const h = new THREE.Mesh(new THREE.TorusGeometry(9, 2.4, 10, 24), mat);
      h.position.set(s * 26, 14, 0); h.rotation.y = Math.PI / 2; g.add(h);
    });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 22, 16), mat);
    stem.position.y = -12; g.add(stem);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(16, 18, 7, 24), mat);
    base.position.y = -26; g.add(base);
    return g;
  }

  // Billboard an object toward the active camera (if available).
  function faceCamera(obj) {
    const cam = (typeof CosmosScene3D !== 'undefined') ? CosmosScene3D.getCamera() : null;
    if (cam) obj.lookAt(cam.position);
  }

  // A tilted spiral galaxy as a vertex-coloured Points cloud.
  // opts: { arms, count, radius, swirl, tilt, coreColors[], rimColors[] }
  // Returns a THREE.Points; rotate its .rotation.z over time to spin it.
  function spiralGalaxy(opts) {
    opts = opts || {};
    const ARMS  = opts.arms   || 3;
    const N     = opts.count  || 4200;
    const RAD   = opts.radius || 500;
    const SWIRL = opts.swirl  || 5.0;
    const tilt  = opts.tilt   != null ? opts.tilt : 0.5;
    const coreC = (opts.coreColors || [0xf0b53c, 0xffffff]).map(c => new THREE.Color(c));
    const rimC  = (opts.rimColors  || [0xa78bfa, 0xf472b6]).map(c => new THREE.Color(c));

    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const arm   = i % ARMS;
      const tRad  = Math.pow(Math.random(), 0.7);
      const radius = 30 + tRad * (RAD - 30);
      const armAng = (arm / ARMS) * Math.PI * 2;
      const ang    = armAng + tRad * SWIRL + (Math.random() - 0.5) * 0.5;
      const spread = (1 - tRad) * 40 + 8;
      pos[i*3]   = Math.cos(ang) * radius + (Math.random() - 0.5) * spread;
      pos[i*3+2] = Math.sin(ang) * radius + (Math.random() - 0.5) * spread;
      pos[i*3+1] = (Math.random() - 0.5) * (spread * 0.7);
      const a = coreC[(Math.random() * coreC.length) | 0];
      const b = rimC[(Math.random() * rimC.length) | 0];
      const c = a.clone().lerp(b, tRad);
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    const points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 3.4, vertexColors: true, transparent: true, opacity: 0.9,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    points.rotation.x = tilt;
    return points;
  }

  return { photoPanel, halo, starSprinkle, trophyCore, faceCamera, spiralGalaxy };
})();
