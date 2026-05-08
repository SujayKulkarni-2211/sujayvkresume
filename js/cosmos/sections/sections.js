/* sections.js — Navigation controller: warp, panel hide/show, section mount/unmount */
'use strict';

const Cosmossections = (() => {
  let _current = null; // currently open section key
  let _warping  = false;

  const _orbitPanels = ['cockpit-left-panel', 'cockpit-right-panel', 'orbit-context-text'];
  const _sectionMap  = {
    workstation : CosmosWorkstation,
    auditorium  : CosmosAuditorium,
    telescope   : CosmosteleSCOPE,
    achievement : CosmosAchievement,
  };

  // ── SECTION CONTAINER ─────────────────────────────────────
  let _container = null;
  function _getContainer() {
    if (_container) return _container;
    _container = document.createElement('div');
    _container.id = 'cosmos-section-container';
    _container.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:200',
      'overflow-y:auto', 'overflow-x:hidden',
      'opacity:0', 'pointer-events:none',
      'transition:opacity 0.5s ease',
      'background:rgba(4,0,20,0.96)',
    ].join(';');
    document.body.appendChild(_container);
    return _container;
  }

  // ── SMALL SHIP ICON + CONTROL PANEL toggle ────────────────
  let _shipIcon = null;
  let _controlPanel = null;

  function _buildShipIcon() {
    if (_shipIcon) return;

    // Reparent control panel to body so it's independent of orbit-ui
    _controlPanel = document.getElementById('cosmos-control-panel');
    if (_controlPanel && _controlPanel.parentElement.id !== 'body') {
      document.body.appendChild(_controlPanel);
    }

    _shipIcon = document.createElement('button');
    _shipIcon.id = 'section-ship-icon';
    _shipIcon.innerHTML = '🛸';
    _shipIcon.title = 'Navigation';
    _shipIcon.style.cssText = [
      'position:fixed', 'bottom:18px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:250', 'background:rgba(10,0,30,0.80)',
      'border:1px solid rgba(167,139,250,0.45)', 'border-radius:50%',
      'width:52px', 'height:52px', 'font-size:1.5rem',
      'cursor:pointer', 'display:none', 'align-items:center', 'justify-content:center',
      'box-shadow:0 0 18px rgba(124,58,237,0.45)',
      'transition:box-shadow 0.2s',
    ].join(';');
    _shipIcon.addEventListener('click', _toggleControlPanel);
    document.body.appendChild(_shipIcon);
  }

  function _toggleControlPanel() {
    if (!_controlPanel) return;
    const hidden = _controlPanel.style.display === 'none' || _controlPanel.style.display === '';
    _controlPanel.style.display = hidden ? 'block' : 'none';
  }

  // ── HIDE / SHOW ORBIT UI PANELS ───────────────────────────
  function _hideOrbitPanels() {
    _orbitPanels.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.transition = 'opacity 0.4s ease';
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; }, 420);
    });
    if (_controlPanel) _controlPanel.style.display = 'none';
  }

  function _showOrbitPanels() {
    _orbitPanels.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.display = '';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.5s ease';
        el.style.opacity = '1';
      });
    });
    if (_controlPanel) {
      _controlPanel.style.display = 'block';
    }
    if (_shipIcon) _shipIcon.style.display = 'none';
  }

  // ── WARP ANIMATION ────────────────────────────────────────
  function _doWarp(onPeak) {
    CosmosAudio.playWarp();
    const overlay = document.getElementById('warp-overlay');
    const canvas  = document.getElementById('warp-canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    overlay.classList.add('active');

    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;
    const lines = Array.from({ length: 120 }, () => ({
      angle : Math.random() * Math.PI * 2,
      dist  : 20 + Math.random() * 180,
      speed : 6  + Math.random() * 14,
      len   : 8  + Math.random() * 60,
      col   : Math.random() < 0.5 ? 'rgba(167,139,250,' : 'rgba(196,220,255,',
    }));

    let frame = 0;
    const TOTAL = 75;
    let peakFired = false;

    (function drawFrame() {
      const p = frame / TOTAL;
      ctx.fillStyle = `rgba(0,0,10,${0.32 + p * 0.18})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      lines.forEach(l => {
        const stretch = 1 + p * 20;
        const r0 = l.dist * stretch;
        const r1 = r0 + l.len * stretch;
        ctx.strokeStyle = l.col + Math.min(0.88, p * 2.8) + ')';
        ctx.lineWidth   = 1.2 + p * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(l.angle) * r0, cy + Math.sin(l.angle) * r0);
        ctx.lineTo(cx + Math.cos(l.angle) * r1, cy + Math.sin(l.angle) * r1);
        ctx.stroke();
      });

      if (p > 0.55 && p < 0.78) {
        const fa = Math.sin((p - 0.55) / 0.23 * Math.PI) * 0.88;
        ctx.fillStyle = `rgba(230,220,255,${fa})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (!peakFired && p > 0.62) { peakFired = true; onPeak && onPeak(); }
      }

      frame++;
      if (frame <= TOTAL) {
        requestAnimationFrame(drawFrame);
      } else {
        overlay.classList.remove('active');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    })();
  }

  // ── NAVIGATE TO SECTION ───────────────────────────────────
  function navigateTo(key) {
    if (_warping) return;
    if (key === _current) return;

    _warping = true;
    CosmosAudio.init();
    CosmosAudio.resume();

    // If coming from orbit, hide orbit panels
    if (!_current) _hideOrbitPanels();

    _doWarp(() => {
      // At warp peak: swap sections
      _unmountCurrent();
      _mountSection(key);
      _warping = false;
    });
  }

  function _unmountCurrent() {
    const c = _getContainer();
    c.style.opacity = '0';
    c.style.pointerEvents = 'none';
    c.innerHTML = '';
    _current = null;
  }

  function _mountSection(key) {
    const mod = _sectionMap[key];
    if (!mod) return;
    _current = key;
    const c = _getContainer();
    c.innerHTML = '';
    mod.build(c);
    c.style.pointerEvents = 'auto';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        c.style.opacity = '1';
      });
    });

    // Show ship icon + hide control panel
    _buildShipIcon();
    if (_shipIcon) _shipIcon.style.display = 'flex';
    if (_controlPanel) _controlPanel.style.display = 'none';

    // Re-wire nav buttons inside section context
    document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
      btn.onclick = () => navigateTo(btn.dataset.section);
    });

    // Play section entry sound
    if (mod.enter) mod.enter();
  }

  // ── RETURN TO ORBIT ───────────────────────────────────────
  function returnToOrbit() {
    if (_warping) return;
    _warping = true;
    CosmosAudio.init();
    CosmosAudio.resume();

    _doWarp(() => {
      _unmountCurrent();
      _showOrbitPanels();
      _warping = false;
    });
  }

  // ── COMMS CONSOLE (no warp) ───────────────────────────────
  function openComms() {
    CosmosAudio.init();
    CosmosAudio.resume();
    _hideOrbitPanels();
    CosmosComms.open(() => {
      // on close
      _showOrbitPanels();
    });
  }

  // ── INIT: wire nav buttons ────────────────────────────────
  function init() {
    document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.section));
    });
    const commsBtn = document.getElementById('comms-btn');
    if (commsBtn) commsBtn.addEventListener('click', openComms);
  }

  return { init, navigateTo, returnToOrbit, openComms };
})();
