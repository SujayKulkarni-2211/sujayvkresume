/* auditorium.js — Milky Way Auditorium section */
'use strict';

const CosmosAuditorium = (() => {

  let _galaxy = null, _coreLight = null, _coreHalo = null, _hoverPanel = -1;

  // ── 3D DESTINATION: an auditorium. The spiral galaxy lies HORIZONTAL in
  //    the foreground — it is the audience. The camera looks down over the
  //    galaxy toward the stage; the HTML content (videos centre, poems sides)
  //    floats above as the performance facing the audience. ──
  function build3D() {
    const NEBULA_Z = CosmosWorld.getNEBULA_Z();
    const ORIGIN = new THREE.Vector3(1500, 30, NEBULA_Z - 750);

    const group = new THREE.Group();
    group.position.copy(ORIGIN);

    // Spiral galaxy — SMALLER, laid nearly flat (a shallow viewing tilt) so
    // it reads as a horizontal disc rotating in place at the centre.
    _galaxy = Loka3D.spiralGalaxy({
      arms: 4, count: 4600, radius: 380, swirl: 5.5, tilt: 0.0,
      coreColors: [0xfff0c0, 0xffd27f, 0xffffff],
      rimColors:  [0x60a5fa, 0xa78bfa, 0xf472b6],
    });
    // Shallow tilt so we see the disc as a horizontal plane (not edge-on,
    // not face-on). Centre it, a touch low and forward.
    _galaxy.rotation.x = 1.15;            // ~66° → reads as a ground plane
    _galaxy.position.set(0, -120, 220);
    group.add(_galaxy);

    // Bright galactic core at the centre of the disc.
    const core = new THREE.Group();
    core.position.copy(_galaxy.position);
    group.add(core);
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(16, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfff2cf, transparent: true, opacity: 0.95,
        blending: THREE.AdditiveBlending })
    );
    core.add(nucleus);
    _coreHalo = Loka3D.halo(70, 0xffd27f, 0.16);
    core.add(_coreHalo);
    _coreLight = new THREE.PointLight(0xffe6b0, 10, 1600);
    core.add(_coreLight);

    group.add(Loka3D.starSprinkle(800, 820, 0xdfe9ff, 2.4));
    group.add(new THREE.AmbientLight(0x24203a, 1.4));

    // Camera up and back, looking down over the disc — audience POV. Cards
    // are pulled back (further from camera) so the disc owns the centre.
    const anchor = {
      pos:  ORIGIN.clone().add(new THREE.Vector3(0, 130, 820)),
      look: ORIGIN.clone().add(new THREE.Vector3(0, -90, 140)),
    };

    const animate = (t) => {
      // Spin around Y so the FLAT disc rotates horizontally (in its plane).
      if (_galaxy) _galaxy.rotation.y = t * 0.06;
      const targetI = _hoverPanel >= 0 ? 17 : 10;
      _coreLight.intensity += (targetI + Math.sin(t * 3) * 1.5 - _coreLight.intensity) * 0.1;
      _coreHalo.material.opacity = (_hoverPanel >= 0 ? 0.24 : 0.16) + Math.sin(t * 2) * 0.03;
      nucleus.scale.setScalar(1 + Math.sin(t * 1.6) * 0.08);
    };

    return { group, anchor, animate };
  }

  function enter() {
    // Sitar-like pluck — triangle wave, fast decay
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [523.25, 659.25, 783.99].forEach((f, i) => {
        setTimeout(() => {
          try {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(f * 1.04, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(f, ctx.currentTime + 0.06);
            g.gain.setValueAtTime(0.18, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
            o.connect(g); g.connect(ctx.destination);
            o.start(); o.stop(ctx.currentTime + 0.6);
          } catch(e) {}
        }, i * 200);
      });
    } catch(e) {}
  }

  function build(container) {
    _hoverPanel = -1;
    container.innerHTML = `
<div class="au-root au-3d">
  <div class="au-header">
    <span class="au-title">🎭 Milky Way Auditorium</span>
    <span class="au-hint">Welcome to Sujay's Milky Way Auditorium</span>
    <button class="au-back-btn" onclick="Cosmossections.returnToOrbit()">← Return to Orbit</button>
  </div>

  <div class="au-stages">

    <!-- LEFT STAGE: Poetry & Writing -->
    <div class="au-stage au-stage-left" data-panel="0">
      <div class="au-stage-label">Poetry &amp; Writing</div>

      <div class="au-card">
        <div class="au-card-title">Oh Britishers looks like you're successful</div>
        <div class="au-card-desc">Poem on Britishers' India — an English poem reflecting on colonial history</div>
        <a class="au-link" href="https://docs.google.com/document/d/1aX74Muuo-j6tyYeilNkAsXLaowrZMG0YUVbs4PedD9M/edit?usp=sharing" target="_blank">Read Poem ↗</a>
      </div>

      <div class="au-card">
        <div class="au-card-title">Nisargave Swarga</div>
        <div class="au-card-desc">Kannada poem on nature — ನಿಸರ್ಗವೇ ಸ್ವರ್ಗ</div>
        <a class="au-link" href="https://docs.google.com/document/d/1B3Ue1Dt6Bu0VCfeN_598spfc2cMpehfcsL6OofmWkA4/edit?usp=sharing" target="_blank">Read Poem ↗</a>
      </div>

      <div class="au-card au-book-card">
        <div class="au-book-badge">Published Author</div>
        <div class="au-card-title">The Adventures of Detective Sujay</div>
        <div class="au-card-desc">Published fiction book — a detective adventure series</div>
      </div>
    </div>

    <!-- CENTRE STAGE: Tabla & Music (performances on the galaxy stage) -->
    <div class="au-stage au-stage-centre" data-panel="1">
      <div class="au-stage-label">Tabla &amp; Music</div>

      <div class="au-card-desc au-music-bio">
        International Tabla Artist · Hindustani Vocalist · Harmonium · Composer.<br>
        Sangeeta Prabhakar &amp; Chamundeshwari National Awards.
      </div>

      <div class="au-video-wrap">
        <div class="au-video-label">Sujay Tabla Solo</div>
        <div class="au-video-desc">Solo tabla performance by Sujay</div>
        <div class="au-video-frame">
          <iframe src="https://www.youtube.com/embed/Y8SrDu1O2Dw" title="Sujay Tabla Solo"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      </div>

      <div class="au-video-wrap">
        <div class="au-video-label">Shree Saraswathi</div>
        <div class="au-video-desc">Singing and playing tabla — his own composition</div>
        <div class="au-video-frame">
          <iframe src="https://www.youtube.com/embed/dJVO5uHhcsU" title="Shree Saraswathi"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      </div>
    </div>

    <!-- RIGHT STAGE: Speeches & Expression -->
    <div class="au-stage au-stage-right" data-panel="2">
      <div class="au-stage-label">Speeches &amp; Expression</div>

      <div class="au-card">
        <div class="au-card-title">Farewell Speech at RVPU</div>
        <div class="au-card-desc">A poem delivered as a farewell speech — a mother bird telling its child it has gained wings and it is time to fly.</div>
        <a class="au-link" href="https://photos.app.goo.gl/u4hDgDfNpSjpdNd37" target="_blank">Watch Speech ↗</a>
      </div>

      <div class="au-card">
        <div class="au-card-title">Daily Saraswathi Puja</div>
        <div class="au-card-desc">A blog on Vedantic practice and daily ritual — nurturing mind, body, and spirit.</div>
        <a class="au-link" href="saraswatipoojablog.html" target="_blank">Read Blog ↗</a>
      </div>

      <div class="au-card">
        <div class="au-card-title">VYAASA &amp; Vedanta</div>
        <div class="au-card-desc">Founder &amp; Vice Chair of VYAASA — Vedantic philosophy, Sanskrit, Mahakavyas, and Kannada classical traditions.</div>
      </div>
    </div>

  </div>
</div>
`;
    container.querySelectorAll('.au-stage').forEach(panel => {
      const idx = parseInt(panel.getAttribute('data-panel'), 10);
      panel.addEventListener('mouseenter', () => { _hoverPanel = idx; });
      panel.addEventListener('mouseleave', () => { if (_hoverPanel === idx) _hoverPanel = -1; });
    });
  }

  return { build, enter, build3D };

})();
