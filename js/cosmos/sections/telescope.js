/* telescope.js — Telescope of Thoughts section
 *
 * POV concept: a telescope floating in space surrounded by "observation"
 * cards spread across a sky-arc above it. Hovering a card swings the
 * telescope to aim at it (with a beam from the lens), as if observing
 * that thought. Cards are HTML projected from fixed 3D anchor points,
 * so they sit in the live 3D scene and track with the camera.
 */
'use strict';

const CosmosteleSCOPE = (() => {

  // ── Content: each entry gets a 3D anchor on the sky-arc ──────────
  // anchor coords are LOCAL to the destination group (origin at telescope).
  const ITEMS = [
    {
      type: 'post',
      text: "Presented the flip-flop project KANTI at RV University's Circuitrix event with team BHASWAT — gratitude to teachers like Chandramouleeswaran Sankaran for enriching basic electronics learning.",
      link: 'https://linkedin.com/embed/feed/update/urn:li:share:7144394180490932225',
      linkText: 'See Post ↗',
    },
    {
      type: 'post',
      text: "Met the honourable former speaker of parliament of Sri Lanka, Deshabandu Karu Jayasuriya — thank you sir for your welcoming interaction and encouraging words!",
      link: 'https://www.linkedin.com/posts/sujay-kulkarni-51391b286_thank-you-honourable-deshabandu-karu-jayasuriya-activity-7144385314168446976-w9uz',
      linkText: 'Watch Introduction ↗',
    },
    {
      type: 'post',
      text: "Gratitude to RV University for hosting a classical music show featuring Abhishek Raghuram, Thiruvarur Bhaktavatsalam, and Ghatam Giridhar Udupa with SpicMacay APAC.",
      link: 'https://www.linkedin.com/posts/sujay-kulkarni-51391b286_thank-you-rv-university-for-organising-the-activity-7144371344359501824-DjFG',
      linkText: 'See Post ↗',
    },
    {
      type: 'post',
      text: "A wonderful concert with maestros Raghavendra (mridangist) and Govinda Swamy (violinist), accompanied by Anuj Srinivas K — third day of Navarathri before Sri Balamuri Vinayaka.",
      link: 'https://www.linkedin.com/posts/sujay-kulkarni-51391b286_wonderful-concert-with-the-maestros-raghavendra-activity-7144386991655202816-xAfm',
      linkText: 'See Post ↗',
    },
    {
      type: 'blog',
      title: 'The Transformative Power of Web Development',
      text: 'How web development transforms ideas into accessible, living experiences — and what that means for builders like us.',
      link: 'webdevtransform.html',
      linkText: 'Read Blog ↗',
    },
    {
      type: 'blog',
      title: 'The Enlightening Influence of Daily Saraswathi Puja',
      text: 'Nurturing Mind, Body, and Spirit — the Vedantic significance of daily Saraswathi Puja and its effect on creativity and learning.',
      link: 'saraswatipoojablog.html',
      linkText: 'Read Blog ↗',
    },
  ];

  // Shared state between build() (DOM) and build3D() (scene animation)
  let _scope        = null;   // the telescope pivot group
  let _lensWorld     = null;  // THREE.Vector3, world pos of lens (updated each frame)
  let _beam          = null;  // beam mesh from lens to hovered target
  let _hoverIndex    = -1;    // which card is hovered (-1 = none)
  let _cardEls       = [];    // DOM card elements
  let _aimCurrent    = null;  // THREE.Vector3 the scope currently aims at (smoothed)
  let _groupRef      = null;  // destination group (for world transforms)
  let _lensGlow      = null;

  // Anchor layout: POSTS form a static neat block on the LEFT; BLOGS sit
  // on the RIGHT and gently drift. Generous spacing so projected 270px
  // cards never overlap. All anchors are local to the destination group.
  const DEPTH = -560;          // distance out in front (-Z)
  function _assignAnchors() {
    let pi = 0, bi = 0;
    const posts = ITEMS.filter(it => it.type === 'post');
    const blogs = ITEMS.filter(it => it.type === 'blog');

    // Posts: 2 columns × N rows on the left side.
    const P_COLS = 2, P_GAP_X = 360, P_GAP_Y = 340, P_X0 = -640, P_Y0 = 470;
    posts.forEach((it) => {
      const c = pi % P_COLS, r = Math.floor(pi / P_COLS);
      it._local = new THREE.Vector3(P_X0 + c * P_GAP_X, P_Y0 - r * P_GAP_Y, DEPTH);
      it._drift = false;
      pi++;
    });

    // Blogs: single column on the right, drifting.
    const B_X = 560, B_Y0 = 430, B_GAP_Y = 360;
    blogs.forEach((it) => {
      it._local = new THREE.Vector3(B_X, B_Y0 - bi * B_GAP_Y, DEPTH + 20);
      it._base  = it._local.clone();   // remember rest position for drift
      it._drift = true;
      it._phase = bi * 1.7;            // offset so they don't move in sync
      bi++;
    });
  }

  // ── 3D DESTINATION ───────────────────────────────────────────────
  function build3D() {
    const NEBULA_Z = CosmosWorld.getNEBULA_Z();
    const ORIGIN = new THREE.Vector3(1400, 60, NEBULA_Z - 850);

    const group = new THREE.Group();
    group.position.copy(ORIGIN);
    _groupRef = group;

    const glass = 0x9bd1ff;

    // ── Telescope pivot (aims toward targets) ──
    const scope = new THREE.Group();
    group.add(scope);
    _scope = scope;

    // ── JWST-style observatory. "barrel" group faces -Z (aim dir). ──
    // Mirror segments + secondary point along -Z, so lookAt() aims the
    // primary mirror at the hovered target.
    const barrel = new THREE.Group();
    scope.add(barrel);

    const gold = 0xf0b53c, goldDark = 0xc8911f;

    // Primary mirror: 18 gold hexagon segments in honeycomb (3 rings).
    const HEX = 17;                       // segment "radius" (flat-to-vertex)
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: gold, metalness: 1.0, roughness: 0.22,
      emissive: goldDark, emissiveIntensity: 0.32,
      side: THREE.DoubleSide, flatShading: true,
    });
    const hexGeo = new THREE.CircleGeometry(HEX, 6);   // 6-gon
    const primary = new THREE.Group();
    barrel.add(primary);
    // Honeycomb axial coordinates for 18 outer segments (center removed → JWST has no center).
    const SP = HEX * 1.74;                // center-to-center spacing
    const coords = [];
    for (let q = -2; q <= 2; q++) {
      for (let r = -2; r <= 2; r++) {
        const s = -q - r;
        if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) > 2) continue;
        if (q === 0 && r === 0) continue;  // JWST: no center segment
        coords.push([q, r]);
      }
    }
    coords.forEach(([q, r]) => {
      const x = SP * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
      const y = SP * (1.5 * r);
      // skip far corners to make the rounded JWST outline (keep 18)
      if (Math.hypot(x, y) > SP * 2.15) return;
      const seg = new THREE.Mesh(hexGeo, mirrorMat);
      seg.rotation.z = Math.PI / 6;       // flat-top hex
      seg.position.set(x, y, -2);
      primary.add(seg);
    });
    // Mirror faces -Z (toward the sky it observes).
    primary.rotation.y = Math.PI;

    // Subtle glow disc behind mirror so it reads as "catching light".
    const mirrorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(SP * 2.4, 40),
      new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.10,
        blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
    );
    mirrorGlow.position.z = -6;
    barrel.add(mirrorGlow);

    _lensGlow = new THREE.PointLight(0xffd27f, 5, 600);
    _lensGlow.position.z = -40;
    barrel.add(_lensGlow);

    // Secondary mirror on a tripod of booms, out in front of the primary.
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x20202a, metalness: 0.8, roughness: 0.4 });
    const secZ = -70;
    const secondary = new THREE.Mesh(
      new THREE.CircleGeometry(8, 24),
      new THREE.MeshStandardMaterial({ color: gold, metalness: 1.0, roughness: 0.2,
        emissive: goldDark, emissiveIntensity: 0.4, side: THREE.DoubleSide })
    );
    secondary.position.set(0, 0, secZ);
    barrel.add(secondary);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const bx = Math.cos(a) * SP * 1.7, by = Math.sin(a) * SP * 1.7;
      const boom = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1, 6), boomMat);
      const start = new THREE.Vector3(bx, by, -4);
      const end   = new THREE.Vector3(0, 0, secZ);
      const mid   = start.clone().add(end).multiplyScalar(0.5);
      boom.position.copy(mid);
      boom.scale.y = start.distanceTo(end);
      boom.lookAt(end);
      boom.rotateX(Math.PI / 2);
      barrel.add(boom);
    }

    // ── Spacecraft bus + sunshield (behind the mirror, +Z side) ──
    // These belong to the aiming body too (so it all turns together).
    const bus = new THREE.Mesh(
      new THREE.BoxGeometry(34, 24, 26),
      new THREE.MeshStandardMaterial({ color: 0x2a2438, metalness: 0.6, roughness: 0.5,
        emissive: 0x140f22, emissiveIntensity: 0.4 })
    );
    bus.position.z = 26;
    barrel.add(bus);

    // Five-layer kite sunshield, angled below/behind the optics.
    const shield = new THREE.Group();
    shield.position.set(0, -10, 40);
    shield.rotation.x = -0.5;
    barrel.add(shield);
    const shieldShape = new THREE.Shape();
    (function kite(s) {
      s.moveTo(0, 95); s.lineTo(70, 0); s.lineTo(0, -85); s.lineTo(-70, 0); s.closePath();
    })(shieldShape);
    const shieldGeo = new THREE.ShapeGeometry(shieldShape);
    for (let L = 0; L < 5; L++) {
      const t = L / 4;
      const layer = new THREE.Mesh(shieldGeo, new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.74 - t * 0.12, 0.5, 0.5 + t * 0.08),
        metalness: 0.9, roughness: 0.3, transparent: true, opacity: 0.5,
        emissive: 0x4c1d95, emissiveIntensity: 0.18,
        side: THREE.DoubleSide,
      }));
      layer.position.z = L * 7;
      layer.scale.setScalar(1 - L * 0.06);
      shield.add(layer);
    }

    // No tripod/mount: it floats freely in space (Lagrange-point vibe).

    // ── Beam from lens to hovered target ──
    const beamGeo = new THREE.CylinderGeometry(1.4, 6, 1, 12, 1, true);
    beamGeo.translate(0, 0.5, 0);           // pivot at base
    beamGeo.rotateX(Math.PI / 2);           // length along +Z
    _beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
      color: glass, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    }));
    group.add(_beam);

    // ── Star sprinkle across the arc (ambient targets) ──
    const N = 260;
    const sp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const az = -1.2 + Math.random() * 2.4;
      const el = 0.2 + Math.random() * 1.1;
      const R  = 400 + Math.random() * 400;
      sp[i*3]   = Math.sin(az) * Math.cos(el) * R;
      sp[i*3+1] = Math.sin(el) * R;
      sp[i*3+2] = -Math.cos(az) * Math.cos(el) * R;
    }
    const sgeo = new THREE.BufferGeometry();
    sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const sky = new THREE.Points(sgeo, new THREE.PointsMaterial({
      color: 0xe9d8ff, size: 3.0, transparent: true, opacity: 0.8,
      sizeAttenuation: true, blending: THREE.AdditiveBlending,
    }));
    group.add(sky);

    // Lighting
    group.add((() => { const l = new THREE.PointLight(0xc4b5fd, 4, 1400); l.position.set(0, 300, -200); return l; })());
    group.add((() => { const l = new THREE.PointLight(0xffffff, 1.2, 1600); l.position.set(-200, 200, 400); return l; })());

    // Precompute each item's world anchor for the cards/aim.
    _assignAnchors();

    // Camera anchor: mostly head-on to the card grid (so columns/rows stay
    // clean and rectangular on screen), slightly above, with the telescope
    // sitting in the lower portion of the frame.
    const anchor = {
      pos:  ORIGIN.clone().add(new THREE.Vector3(0, 250, 430)),
      look: ORIGIN.clone().add(new THREE.Vector3(0, 250, -560)),
    };

    // Default aim (idle scan center), in local space.
    _aimCurrent = new THREE.Vector3(0, 360, -520);
    _lensWorld  = new THREE.Vector3();

    const _tmpTargetLocal = new THREE.Vector3();
    const _tmpTargetWorld = new THREE.Vector3();

    const animate = (t, dt) => {
      // 1) Determine the local-space target the scope should aim at.
      if (_hoverIndex >= 0 && ITEMS[_hoverIndex]._local) {
        _tmpTargetLocal.copy(ITEMS[_hoverIndex]._local);
      } else {
        // Idle: slow scan across the arc.
        _tmpTargetLocal.set(Math.sin(t * 0.25) * 360, 340 + Math.sin(t * 0.4) * 40, -480);
      }
      // Smooth the aim.
      const k = 1 - Math.pow(0.0001, Math.min(dt, 0.05));
      _aimCurrent.lerp(_tmpTargetLocal, k);

      // 2) Aim the barrel: convert local target → world, lookAt.
      _tmpTargetWorld.copy(_aimCurrent).applyMatrix4(group.matrixWorld);
      scope.lookAt(_tmpTargetWorld);

      // 3) Track optics-front world position (secondary mirror tip) for beam.
      _lensWorld.set(0, 0, -70).applyMatrix4(barrel.matrixWorld);

      // 4) Beam: stretch from lens to aim target when hovering.
      const targetOpacity = _hoverIndex >= 0 ? 0.32 : 0.0;
      _beam.material.opacity += (targetOpacity - _beam.material.opacity) * 0.15;
      if (_beam.material.opacity > 0.01) {
        const from = _lensWorld.clone();
        const to   = _tmpTargetWorld.clone();
        // beam is child of group → work in group-local space
        const fromL = group.worldToLocal(from.clone());
        const toL   = group.worldToLocal(to.clone());
        const mid   = fromL.clone().add(toL).multiplyScalar(0.5);
        const len   = fromL.distanceTo(toL);
        _beam.position.copy(mid);
        _beam.scale.set(1, 1, len);
        _beam.lookAt(group.localToWorld(toL.clone()));
      }

      // 5) Lens twinkle + gentle free-floating drift of the observatory.
      _lensGlow.intensity = (_hoverIndex >= 0 ? 8 : 4) + Math.sin(t * 2.2) * 1.5;
      sky.material.opacity = 0.7 + Math.sin(t * 1.4) * 0.12;
      scope.position.y = Math.sin(t * 0.5) * 6;          // slow bob
      scope.position.x = Math.cos(t * 0.35) * 4;

      // 5b) Blogs drift gently; posts stay put. Pause the hovered card so
      // it's easy to read/click.
      ITEMS.forEach((it, i) => {
        if (!it._drift || !it._base || i === _hoverIndex) return;
        it._local.x = it._base.x + Math.sin(t * 0.5 + it._phase) * 26;
        it._local.y = it._base.y + Math.cos(t * 0.4 + it._phase) * 20;
      });

      // 6) Project card anchors → screen, position the HTML cards.
      _positionCards();
    };

    return { group, anchor, animate };
  }

  // ── Position HTML cards by projecting their 3D anchors ──────────
  function _positionCards() {
    if (!_groupRef || typeof CosmosScene3D === 'undefined') return;
    const _w = new THREE.Vector3();
    ITEMS.forEach((it, i) => {
      const el = _cardEls[i];
      if (!el || !it._local) return;
      _w.copy(it._local).applyMatrix4(_groupRef.matrixWorld);
      const s = CosmosScene3D.project(_w);
      if (!s.visible) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; return; }
      el.style.left = s.x + 'px';
      el.style.top  = s.y + 'px';
      el.style.opacity = (_hoverIndex === -1 || _hoverIndex === i) ? '1' : '0.55';
      el.style.pointerEvents = 'auto';
    });
  }

  function enter() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(200, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.5);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 1.7);
    } catch(e) {}
  }

  // ── HTML: header + floating cards (positioned by JS) ────────────
  function build(container) {
    _hoverIndex = -1;
    _cardEls = [];

    const cardsHtml = ITEMS.map((it, i) => {
      const titleHtml = it.title ? `<div class="tlp-card-title">${it.title}</div>` : '';
      const tag = it.type === 'blog' ? 'BLOG' : 'POST';
      return `
        <div class="tlp-card tlp-${it.type}" data-i="${i}">
          <div class="tlp-card-tag">${tag}</div>
          ${titleHtml}
          <div class="tlp-card-text">${it.text}</div>
          <a class="tlp-card-link" href="${it.link}" target="_blank">${it.linkText}</a>
        </div>`;
    }).join('');

    container.innerHTML = `
<div class="tlp-root">
  <div class="tlp-header">
    <span class="tlp-title">🔭 Telescope of Thoughts</span>
    <span class="tlp-hint">Hover an observation — the telescope turns to look</span>
    <button class="tlp-back-btn" onclick="Cosmossections.returnToOrbit()">← Return to Orbit</button>
  </div>
  <div class="tlp-cards-layer" id="tlp-cards-layer">
    ${cardsHtml}
  </div>
</div>`;

    // Cache card elements + wire hover → telescope aim.
    const layer = container.querySelector('#tlp-cards-layer');
    _cardEls = Array.from(layer.querySelectorAll('.tlp-card'));
    _cardEls.forEach((el, i) => {
      el.addEventListener('mouseenter', () => { _hoverIndex = i; });
      el.addEventListener('mouseleave', () => { if (_hoverIndex === i) _hoverIndex = -1; });
    });
  }

  return { build, enter, build3D };

})();
