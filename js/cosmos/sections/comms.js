/* comms.js — Communications Console */
'use strict';

const CosmosComms = (() => {

  let _overlay = null;

  function _typewriter(el, text, speed, cb) {
    let i = 0;
    el.textContent = '';
    const t = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(t); cb && cb(); }
    }, speed);
  }

  // Top-down view of ship with signal waves radiating outward
  function _runBeamsTopDown(duration, cb) {
    const camera    = CosmosWorld.getCamera();
    const shipGroup = CosmosShip.getGroup();
    if (!camera || !shipGroup) { cb && cb(); return; }

    // Stop orbit loop so it stops overriding camera
    CosmosWorld.pauseOrbit();

    // Save current camera state
    const savedPos  = camera.position.clone();
    const savedQuat = camera.quaternion.clone();

    // Make ship visible at its current orbit position
    shipGroup.visible = true;
    const sx = shipGroup.position.x;
    const sz = shipGroup.position.z;

    // Move camera above the ship looking straight down
    camera.position.set(sx, 320, sz);
    camera.lookAt(sx, 0, sz);

    // Beams canvas on top of Three.js canvas
    const canvas = document.createElement('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:255', 'pointer-events:none',
    ].join(';');
    document.body.appendChild(canvas);

    const ctx  = canvas.getContext('2d');
    const cx   = canvas.width  / 2;
    const cy   = canvas.height / 2;
    const start = performance.now();
    const rings = [];

    function spawnRing() {
      rings.push({ r: 10, alpha: 0.85 });
    }
    spawnRing();
    const spawnInterval = setInterval(spawnRing, 350);

    function draw(now) {
      const elapsed = now - start;
      const prog    = Math.min(elapsed / duration, 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Central ship glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      grad.addColorStop(0, 'rgba(167,139,250,0.7)');
      grad.addColorStop(0.5, 'rgba(124,58,237,0.3)');
      grad.addColorStop(1, 'rgba(124,58,237,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();

      // Radial beams
      const numBeams = 16;
      const beamProg = (elapsed % 700) / 700;
      for (let i = 0; i < numBeams; i++) {
        const angle = (i / numBeams) * Math.PI * 2;
        const inner = 30;
        const outer = 40 + beamProg * 260;
        const alpha = (1 - beamProg) * 0.6;
        ctx.strokeStyle = `rgba(196,181,253,${alpha})`;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.stroke();
      }

      // Expanding rings
      for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].r     += 4;
        rings[i].alpha  = Math.max(0, rings[i].alpha - 0.014);
        ctx.strokeStyle = `rgba(167,139,250,${rings[i].alpha})`;
        ctx.lineWidth   = 1.8;
        ctx.beginPath();
        ctx.arc(cx, cy, rings[i].r, 0, Math.PI * 2);
        ctx.stroke();
        if (rings[i].alpha <= 0) rings.splice(i, 1);
      }

      if (prog < 1) {
        requestAnimationFrame(draw);
      } else {
        clearInterval(spawnInterval);
        canvas.remove();

        // Restore camera, resume orbit, hide ship
        camera.position.copy(savedPos);
        camera.quaternion.copy(savedQuat);
        shipGroup.visible = false;
        CosmosWorld.resumeOrbit();

        cb && cb();
      }
    }
    requestAnimationFrame(draw);
  }

  function open(onClose) {
    CosmosAudio.init();
    CosmosAudio.resume();
    CosmosAudio.playCommsSignal();

    _runBeamsTopDown(2400, () => {
      _showTerminal(onClose);
    });
  }

  function _showTerminal(onClose) {
    _overlay = document.createElement('div');
    _overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:260',
      'background:rgba(0,8,0,0.97)',
      'display:flex', 'flex-direction:column',
      'align-items:center', 'justify-content:center',
      'opacity:0', 'transition:opacity 0.4s ease',
      'overflow-y:auto', 'padding:40px 20px 100px',
      'font-family:\'Courier New\',monospace',
    ].join(';');

    _overlay.innerHTML = `
<div class="cc-terminal">
  <div class="cc-terminal-bar">
    <span class="cc-terminal-dot" style="background:#ff5f57"></span>
    <span class="cc-terminal-dot" style="background:#febc2e"></span>
    <span class="cc-terminal-dot" style="background:#28c840"></span>
    <span class="cc-terminal-title">COMMUNICATIONS CONSOLE — SIGNAL RELAY</span>
  </div>
  <div class="cc-typewriter" id="cc-typewriter"></div>
  <div class="cc-form-wrap" id="cc-form-wrap" style="display:none">
    <div class="cc-form-label">&gt; TRANSMIT MESSAGE</div>
    <form id="cc-form" autocomplete="off">
      <div class="cc-field">
        <label class="cc-label">SENDER NAME</label>
        <input class="cc-input" id="cc-name" type="text" placeholder="Your name" required>
      </div>
      <div class="cc-field">
        <label class="cc-label">SIGNAL ORIGIN (EMAIL)</label>
        <input class="cc-input" id="cc-email" type="email" placeholder="your@email.com" required>
      </div>
      <div class="cc-field">
        <label class="cc-label">MESSAGE PAYLOAD</label>
        <textarea class="cc-input cc-textarea" id="cc-message" rows="5" placeholder="Your message..." required></textarea>
      </div>
      <div class="cc-actions">
        <button type="submit" class="cc-send-btn">⚡ TRANSMIT</button>
        <div class="cc-status" id="cc-status"></div>
      </div>
    </form>
    <div class="cc-divider">── DIRECT SIGNAL CHANNELS ──</div>
    <div class="cc-direct-links">
      <a class="cc-direct-link" href="mailto:sujaykulkarni2211@gmail.com">✉ sujaykulkarni2211@gmail.com</a>
      <a class="cc-direct-link" href="https://www.linkedin.com/in/sujay-kulkarni-51391b286/" target="_blank">🔗 LinkedIn</a>
      <a class="cc-direct-link" href="https://github.com/SujayKulkarni-2211" target="_blank">🐙 GitHub</a>
      <a class="cc-direct-link" href="https://www.instagram.com/sujaykulkarni2211/" target="_blank">📸 Instagram</a>
    </div>
    <div style="text-align:center;margin-top:28px;">
      <button class="cc-close-btn" id="cc-close-btn">✕ CLOSE CHANNEL</button>
    </div>
  </div>
</div>
`;

    document.body.appendChild(_overlay);
    requestAnimationFrame(() => requestAnimationFrame(() => { _overlay.style.opacity = '1'; }));

    // Typewriter then reveal form
    const tw = document.getElementById('cc-typewriter');
    const lines = [
      'SIGNAL CONNECTION ESTABLISHED...',
      'RELAYING TO SUJAY V KULKARNI...',
      'ENCRYPTION HANDSHAKE COMPLETE.',
      'CHANNEL OPEN. PROCEED WITH TRANSMISSION.',
    ];
    let li = 0;
    function nextLine() {
      if (li >= lines.length) {
        setTimeout(() => {
          tw.style.display = 'none';
          document.getElementById('cc-form-wrap').style.display = 'block';
        }, 400);
        return;
      }
      const span = document.createElement('div');
      span.className = 'cc-tw-line';
      tw.appendChild(span);
      _typewriter(span, lines[li++], 28, () => setTimeout(nextLine, 180));
    }
    nextLine();

    // EmailJS submit
    document.getElementById('cc-form').addEventListener('submit', e => {
      e.preventDefault();
      const name    = document.getElementById('cc-name').value;
      const email   = document.getElementById('cc-email').value;
      const message = document.getElementById('cc-message').value;
      const status  = document.getElementById('cc-status');
      status.textContent = 'TRANSMITTING...';
      status.style.color = '#4ade80';

      if (typeof emailjs !== 'undefined') {
        emailjs.init('LSj1PUC36tu3JygHu');
        emailjs.send('service_3pnt78c', 'template_1xthj2s', {
          to_name: 'Sujay Kulkarni',
          from_name: name,
          email: email,
          message: message,
        }).then(() => {
          status.textContent = '✓ SIGNAL RECEIVED. Sujay will respond shortly.';
          document.getElementById('cc-form').reset();
          CosmosAudio.playBuildComplete();
        }, () => {
          status.textContent = '✗ TRANSMISSION FAILED. Use direct channels below.';
          status.style.color = '#f87171';
        });
      } else {
        status.textContent = '✗ EmailJS not loaded. Use direct channels below.';
        status.style.color = '#f87171';
      }
    });

    document.getElementById('cc-close-btn').addEventListener('click', () => {
      _overlay.style.opacity = '0';
      setTimeout(() => {
        _overlay.remove();
        _overlay = null;
        onClose && onClose();
      }, 400);
    });
  }

  return { open };

})();
