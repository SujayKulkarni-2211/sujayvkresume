/* achievement.js — Achievement Loka Tour section */
'use strict';

const CosmosAchievement = (() => {

  // Shared between build() (DOM) and build3D() (scene). The flythrough
  // tour state (_worlds, _targetIndex, _camPos, _autoTimer) is declared
  // alongside build3D below.

  // ── 3D DESTINATION: a flythrough corridor of award "worlds" ──────
  //    Each achievement image is a glowing system floating in space along
  //    a path. The camera flies forward through them (auto-cruise + manual
  //    push). The currently-focused world is large and centred.
  let _worlds   = [];       // [{ group, photo, pos:Vector3, slide }]
  let _targetIndex = 0;     // which world the camera is flying toward
  let _camPos   = null;     // smoothed camera position (group-local)
  let _autoTimer = 0;       // seconds until next auto-advance
  const WORLD_GAP = 620;    // spacing between worlds down the corridor
  const AUTO_EVERY = 6.5;   // seconds between auto-advances

  function _worldZ(i) { return -i * WORLD_GAP; }

  function build3D() {
    const NEBULA_Z = CosmosWorld.getNEBULA_Z();
    const ORIGIN = new THREE.Vector3(-1500, 30, NEBULA_Z - 400);

    const group = new THREE.Group();
    group.position.copy(ORIGIN);

    const gold = 0xf0b53c;
    const auraColors = [0x7c3aed, 0x2563eb, 0xdb2777, 0x10b981, 0xd97706, 0x22b8cf, 0x9333ea];

    // Deep starfield + drifting nebula glows fill the corridor.
    group.add(Loka3D.starSprinkle(2200, 1400, 0xe9d8ff, 2.4));
    const drifts = [];
    auraColors.forEach((c, i) => {
      const neb = Loka3D.halo(260 + (i % 3) * 90, c, 0.07);
      neb.position.set((i % 2 ? 1 : -1) * (220 + (i % 3) * 60),
                       (i % 2 ? -1 : 1) * 120, _worldZ(i) - 80);
      group.add(neb); drifts.push(neb);
    });

    // Build each award world: a glowing framed image with an aura ring.
    _worlds = [];
    _slides.forEach((s, i) => {
      const w = new THREE.Group();
      // organic offset so the corridor weaves, not a straight tube
      const ox = Math.sin(i * 1.7) * 60;
      const oy = Math.cos(i * 1.3) * 45;
      w.position.set(ox, oy, _worldZ(i));

      const aura = Loka3D.halo(150, auraColors[i % auraColors.length], 0.22);
      w.add(aura);
      // a faint ring around the world
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(120, 2.2, 10, 64),
        new THREE.MeshBasicMaterial({ color: auraColors[i % auraColors.length],
          transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
      );
      w.add(ring);

      const photo = Loka3D.photoPanel(s.img, 180, 134, gold);
      w.add(photo);

      const lite = new THREE.PointLight(auraColors[i % auraColors.length], 3, 600);
      lite.position.set(0, 0, 60); w.add(lite);

      group.add(w);
      _worlds.push({ group: w, photo, ring, aura, pos: w.position.clone(), slide: s, baseColor: auraColors[i % auraColors.length] });
    });

    group.add(new THREE.AmbientLight(0x2a2440, 1.6));

    // Start the camera just behind the first world.
    _targetIndex = 0;
    _autoTimer = AUTO_EVERY;
    _camPos = new THREE.Vector3(0, 0, _worldZ(0) + 360);

    const anchor = {
      pos:  ORIGIN.clone().add(_camPos),
      look: ORIGIN.clone().add(new THREE.Vector3(0, 0, _worldZ(0))),
    };

    const animate = (t, dt) => {
      dt = Math.min(dt || 0.016, 0.05);

      // Auto-cruise: advance to next world every AUTO_EVERY seconds.
      _autoTimer -= dt;
      if (_autoTimer <= 0) {
        _autoTimer = AUTO_EVERY;
        _advance(1);
      }

      // Smoothly fly the camera to sit just behind the target world.
      const tz = _worldZ(_targetIndex) + 360;
      const target = new THREE.Vector3(
        Math.sin(_targetIndex * 1.7) * 60 * 0.4,
        Math.cos(_targetIndex * 1.3) * 45 * 0.4,
        tz
      );
      _camPos.lerp(target, 1 - Math.pow(0.0025, dt));
      const cam = (typeof CosmosScene3D !== 'undefined') ? CosmosScene3D.getCamera() : null;
      if (cam) {
        cam.position.copy(group.localToWorld(_camPos.clone()));
        const lookLocal = new THREE.Vector3(0, 0, _worldZ(_targetIndex));
        cam.lookAt(group.localToWorld(lookLocal.clone()));
      }

      // Animate each world: billboard photo, pulse the focused one.
      _worlds.forEach((wd, i) => {
        Loka3D.faceCamera(wd.photo);
        wd.ring.rotation.z = t * 0.3 + i;
        const focused = (i === _targetIndex);
        const targetScale = focused ? 1.18 : 0.86;
        wd.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
        wd.aura.material.opacity = (focused ? 0.34 : 0.16) + Math.sin(t * 2 + i) * 0.04;
      });

      // Drifting nebulae shimmer.
      drifts.forEach((n, i) => { n.material.opacity = 0.07 + Math.sin(t * 0.5 + i) * 0.02; });
    };

    return { group, anchor, animate };
  }

  // Advance / rewind the focused world; play a whoosh on each move.
  function _advance(dir) {
    const n = _slides.length;
    const next = Math.max(0, Math.min(n - 1, _targetIndex + dir));
    if (next === _targetIndex) {
      // wrap around at ends for a continuous tour feel
      _targetIndex = dir > 0 ? 0 : n - 1;
    } else {
      _targetIndex = next;
    }
    _autoTimer = AUTO_EVERY;
    if (typeof CosmosAudio !== 'undefined' && CosmosAudio.playWhoosh) CosmosAudio.playWhoosh();
    _syncCaption();
  }

  function _syncCaption() {
    const s = _slides[_targetIndex];
    const tit = document.getElementById('ach-now-title');
    const cap = document.getElementById('ach-now-caption');
    const cnt = document.getElementById('ach-now-count');
    if (tit) tit.textContent = s.title;
    if (cap) cap.textContent = s.caption;
    if (cnt) cnt.textContent = (_targetIndex + 1) + ' / ' + _slides.length;
  }

  function enter() {
    // 4-note fanfare — C E G C, square wave
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [261.63, 329.63, 392.00, 523.25].forEach((f, i) => {
        setTimeout(() => {
          try {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'square';
            o.frequency.value = f;
            g.gain.setValueAtTime(0.06, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
            o.connect(g); g.connect(ctx.destination);
            o.start(); o.stop(ctx.currentTime + 0.25);
          } catch(e) {}
        }, i * 160);
      });
    } catch(e) {}
  }

  const _slides = [
    { img: 'images/webdevwin2cropped.jpeg', title: 'This Website led me here!', caption: 'Coded overnight for Intro to Web Dev Hackathon at RV University' },
    { img: 'images/analyticswin.jpeg',      title: '2nd Place — Analytica',      caption: 'Data analysis contest hosted by School of Business, RV University' },
    { img: 'images/siaward.jpeg',           title: 'Best Game — Structured Innovation', caption: 'Game Nirvana bagged best game prize' },
    { img: 'images/karujayasoor_v2.jpeg', title: 'Award from Former Speaker of Sri Lanka', caption: 'Received by Deshabandu Karu Jayasuriya for tabla solo performance' },
    { img: 'images/perfostagesl.jpeg',      title: 'Performance in Sri Lanka',   caption: 'Indo-Sri Lanka cultural delegation — a great experience' },
    { img: 'images/slaward.jpeg',           title: 'Award for Performance',      caption: 'Recognition and support from the Sri Lanka program' },
    { img: 'images/saiabhi_v2.jpeg',        title: 'Memento — Balamuri Sidhi Vinayaka Temple', caption: 'Thank you Sai Abhiram for the opportunity' },
  ];

  // Credits content (right column, auto-scrolls like film credits).
  const _credits = [
    { label: 'KEY ACHIEVEMENTS', items: [
      'Best Paper Award — ICAICS 2025, Springer (Quantum Entropy Temperature Scaling)',
      'Patent Filing — TAARA Cybersecurity Framework',
      'FKCCI Manthan 2025 Finalist',
      'Karnataka Elevate 2024 Finalist',
      'Hackathon Winner — waruna project',
      'Indo-Sri Lanka Cultural Delegate — tabla solo performance',
      'Sangeeta Prabhakar National Award (Tabla)',
      'Chamundeshwari National Award',
      'Global Economic Forum Lifetime Member',
      'Runners Up — Analytica Data Analysis Contest, RV University',
      'Best Game — Structured Innovation (Nirvana)',
      '8th Rank — Intercollege Coding Club Programme',
    ]},
    { label: 'ACADEMIC HONOURS', items: [
      'Performance award in 2nd PU from RV PU College',
      'Performance award in 10th from Shree Bharathi Vidyalaya',
      'Performance in 2nd PU Board Exam — Chidambar Seva Samiti Rajajinagar',
      'Performance in SSLC Boards — Chidambar Seva Samiti Rajajinagar',
      'Multiple awards for science exhibition experiments',
      'Poems published in magazine "Pranava" by RV PU College',
      'Ranked 32nd — Wiz Spell Bee National Level Competition',
      'Recognised for excellence in tabla, singing, creative writing, story writing & poetry',
    ]},
    { label: 'POSITIONS OF RESPONSIBILITY', items: [
      'Founder & President — RUDRA (RVU Data Science Club)',
      'Vice Chairperson — IEEE Student Branch, RV University',
      'Founder — IDeathon RVU',
      'Founder & Vice Chair — VYAASA',
      'CEO & Founder — Goodwinsun',
      'Nobel Delegate — Model United Nations (MUN), thrice',
      'Chaired RV MUN 2022',
      'Organised competitions in public speaking, debates, MUNs and trained participants',
      'Awards in public speaking contests, debates, and pick-and-speak competitions',
    ]},
  ];

  function build(container) {
    // Build the auto-scrolling credits markup (duplicated for seamless loop).
    const block = _credits.map(sec => `
      <div class="ach-cr-sec">
        <div class="ach-cr-label">${sec.label}</div>
        ${sec.items.map(t => `<div class="ach-cr-item">${t}</div>`).join('')}
      </div>`).join('');

    container.innerHTML = `
<div class="ach-root ach-tour">
  <div class="ach-header">
    <span class="ach-title">🏆 Achievement Loka Tour</span>
    <span class="ach-hint">Flying through a realm of accomplishments · → / Space to push ahead · ← back</span>
    <button class="ach-back-btn" onclick="Cosmossections.returnToOrbit()">← Return to Orbit</button>
  </div>

  <!-- LEFT: the flythrough caption + controls (3D shows through behind) -->
  <div class="ach-now">
    <div class="ach-now-count" id="ach-now-count">1 / ${_slides.length}</div>
    <div class="ach-now-title" id="ach-now-title">${_slides[0].title}</div>
    <div class="ach-now-caption" id="ach-now-caption">${_slides[0].caption}</div>
    <div class="ach-now-nav">
      <button class="ach-nav-btn" id="ach-prev">‹ Prev</button>
      <button class="ach-nav-btn" id="ach-next">Next ›</button>
    </div>
  </div>

  <!-- RIGHT: auto-scrolling credits (pause on hover) -->
  <div class="ach-credits" id="ach-credits">
    <div class="ach-credits-track" id="ach-credits-track">
      ${block}
      <div class="ach-cr-gap"></div>
      ${block}
    </div>
  </div>
</div>
`;

    // Wire manual controls.
    container.querySelector('#ach-next').addEventListener('click', () => {
      if (typeof CosmosAudio !== 'undefined') { CosmosAudio.init(); CosmosAudio.resume(); }
      _advance(1);
    });
    container.querySelector('#ach-prev').addEventListener('click', () => {
      if (typeof CosmosAudio !== 'undefined') { CosmosAudio.init(); CosmosAudio.resume(); }
      _advance(-1);
    });

    document.addEventListener('keydown', _onKey);

    // Auto-scroll credits; pause when hovered.
    const credits = container.querySelector('#ach-credits');
    const track   = container.querySelector('#ach-credits-track');
    let crY = 0, crPaused = false, crRAF = null;
    credits.addEventListener('mouseenter', () => { crPaused = true; });
    credits.addEventListener('mouseleave', () => { crPaused = false; });
    function crStep() {
      if (!crPaused) {
        crY -= 0.4;
        const half = track.scrollHeight / 2;
        if (-crY >= half) crY = 0;            // seamless loop (content duplicated)
        track.style.transform = 'translateY(' + crY + 'px)';
      }
      crRAF = requestAnimationFrame(crStep);
    }
    crStep();

    _syncCaption();
  }

  function _onKey(e) {
    if (!document.querySelector('.ach-tour')) return;   // only while section open
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault();
      if (typeof CosmosAudio !== 'undefined') { CosmosAudio.init(); CosmosAudio.resume(); }
      _advance(1);
    } else if (e.key === 'ArrowLeft') { e.preventDefault(); _advance(-1); }
  }

  return { build, enter, build3D };

})();
