/* app.js — Main controller: wires everything together */
'use strict';

(function () {
  // ── MOBILE GUARD ──────────────────────────────────────────
  // Cosmos is a desktop-only 3D experience. If a small / touch device
  // somehow lands here, show the blocker overlay and skip all the heavy
  // Three.js initialisation entirely.
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                   || window.innerWidth < 768;
  if (isMobile) {
    const blocker = document.getElementById('cosmos-mobile-blocker');
    if (blocker) blocker.classList.add('show');
    return;
  }

  const canvas   = document.getElementById('cosmos-canvas');
  const statusEl = document.getElementById('cosmos-status');
  const enterBtn = document.getElementById('cosmos-enter-btn');
  const muteBtn  = document.getElementById('cosmos-mute-btn');

  // ── INIT THREE.JS WORLD ───────────────────────────────────
  CosmosWorld.init(canvas);
  const renderer = CosmosWorld.getRenderer();
  const scene    = CosmosWorld.getScene();
  const camera   = CosmosWorld.getCamera();

  // Separate clock for orbit (world has its own internal clock for nebula pulse etc.)
  const orbitClock = new THREE.Clock();

  // ── INIT SHIP ─────────────────────────────────────────────
  CosmosShip.create(scene);

  // ── INIT LOADER ───────────────────────────────────────────
  CosmosLoader.init(statusEl, enterBtn);

  // Build complete → chime
  CosmosLoader.onComplete(() => {
    CosmosAudio.playBuildComplete();
  });

  // Enter clicked → horn → zoom into ship → then fly to orbit
  CosmosLoader.onEnter(() => {
    CosmosAudio.init();
    CosmosAudio.resume();
    CosmosAudio.playEnterHorn();
    CosmosAudio.startAmbient(); // start ambient immediately — don't wait for orbit

    // Fade out loader overlay
    const overlay = document.getElementById('cosmos-loader-overlay');
    if (overlay) {
      overlay.style.transition = 'opacity 1.2s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        const orbitUI = document.getElementById('cosmos-orbit-ui');
        orbitUI.style.display = 'flex';
      }, 1300);
    }

    // Move ship to orbit position immediately so it doesn't appear at center
    CosmosShip.snapToOrbitStart();

    // Fly camera to orbit position around nebula
    CosmosWorld.flyThroughShipThenOrbit(0, 2.4, () => {
      CosmosShip.shrinkToOrbitScale();
      CosmosShip.startOrbit();
    });
  });

  // ── MUTE TOGGLE ───────────────────────────────────────────
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      CosmosAudio.init();
      CosmosAudio.resume();
      const muted = CosmosAudio.toggleMute();
      muteBtn.textContent = muted ? '🔇' : '🔊';
      muteBtn.title = muted ? 'Unmute' : 'Mute';
    });
  }

  // ── MAIN LOOP ─────────────────────────────────────────────
  const BUILD_DELAY_MS = 1400;
  let buildStarted = false;

  function loop(now) {
    requestAnimationFrame(loop);

    // Start build after delay
    if (!buildStarted && now >= BUILD_DELAY_MS) {
      buildStarted = true;
      CosmosLoader.start();
      CosmosShip.setSmokeOn(true);
    }

    // Drive build animation
    if (buildStarted) {
      const progress = CosmosLoader.tick(now);
      if (progress !== undefined) {
        CosmosShip.applyBuildProgress(progress);
      }
    }

    // World internal animation (nebula pulse, stars rotate)
    CosmosWorld.tick();

    // Orbit update
    const dt = orbitClock.getDelta();
    CosmosShip.updateOrbit(dt);

    // Per-section 3D destinations (camera flight + object animation)
    if (typeof CosmosScene3D !== 'undefined') {
      CosmosScene3D.tick(now * 0.001, dt);
    }

    // Render
    renderer.render(scene, camera);
  }

  // Audio unlock on any user gesture
  const unlock = () => { CosmosAudio.init(); CosmosAudio.resume(); };
  document.addEventListener('click',   unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
  document.addEventListener('touchstart', unlock, { once: true });

  // Resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // Kick off
  requestAnimationFrame(loop);
})();
