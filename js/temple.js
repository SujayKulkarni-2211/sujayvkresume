/* temple.js — Mentos Zindagi: 2D Illustrated Karnataka Village Home
   Each room is a full-screen canvas painting with warm perspective art */
(function () {
  'use strict';

  /* ── Canvas & state ── */
  var canvas, ctx, W, H, DPR;
  var currentRoom = 'gate';
  var isDay = true;
  var transitioning = false;
  var transAlpha = 0;  /* 0=fully visible, 1=black */
  var transDir = 0;    /* 1=fading to black, -1=fading in */
  var transTarget = null;
  var transSpeed = 0.045;

  /* Hotspots for the current room: [{x,y,w,h, label, action, data}] */
  var hotspots = [];
  var hoveredSpot = null;
  var labelFade = 0;

  /* Particle diyas */
  var particles = [];

  /* Aangan tulsi sway */
  var swayT = 0;

  /* Achievements slider */
  var achIdx = 0;
  var ACH_IMGS_LOADED = {};
  var ACH_IMGS = [
    'images/analyticswin.jpeg','images/saiabhiaward.jpeg','images/siaward.jpeg',
    'images/slaward.jpeg','images/soloperfcard.jpeg','images/perfostagesl.jpeg',
    'images/webdevwin.jpeg','images/webdevwin2cropped.jpeg','images/karujayasooraward.jpeg',
  ];
  var ACH_CAPS = [
    'Analytics Competition Win','SAI ABHI Award','SI Award','SL Award',
    'Solo Performance — Stage','Stage Performance','Web Dev Win','Web Dev Win (2)',
    'Met Deshabandu Karu Jayasuriya, former Speaker of Sri Lanka Parliament',
  ];

  /* Room graph */
  var ROOMS = {
    gate:         { label:'Entrance Gate',         left:'jagali',       right:null,          back:null        },
    jagali:       { label:'Jagali',                left:'gate',         right:'aangan',      back:'gate'      },
    aangan:       { label:'Aangan — Tulsi Center', left:'study',        right:'kala',        back:'gate'      },
    study:        { label:'Study Room',            left:'aangan',       right:'achievements',back:'aangan'    },
    achievements: { label:'Wall of Achievements',  left:'study',        right:'kala',        back:'study'     },
    kala:         { label:'Kala Room',             left:'achievements', right:'kitchen',     back:'aangan'    },
    kitchen:      { label:'Kitchen',               left:'kala',         right:'temple',      back:'kala'      },
    temple:       { label:'Temple',                left:'kitchen',      right:null,          back:'kitchen'   },
  };

  /* Preload achievement images */
  ACH_IMGS.forEach(function(src) {
    var img = new Image(); img.src = src;
    ACH_IMGS_LOADED[src] = img;
  });

  /* ── Init ── */
  function init() {
    canvas = document.getElementById('house-canvas');
    if (!canvas) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    resize();
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mouseleave', function() { hoveredSpot = null; canvas.style.cursor = 'default'; });
    bindHUD();
    updateHUD();
    spawnParticles();
    requestAnimationFrame(loop);
  }

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    if (ctx) { ctx.scale(DPR, DPR); redraw(); }
  }

  /* ── Diya particles ── */
  function spawnParticles() {
    particles = [];
    for (var i = 0; i < 18; i++) particles.push(newParticle());
  }
  function newParticle() {
    return { x: W * (0.3 + Math.random() * 0.4), y: H * 0.55 + Math.random() * H * 0.2,
             vx: (Math.random()-0.5)*0.35, vy: -0.5 - Math.random()*0.8,
             life: Math.random(), maxLife: 60 + Math.random()*60,
             r: 1.5 + Math.random()*2 };
  }

  /* ── Main loop ── */
  function loop() {
    requestAnimationFrame(loop);
    swayT += 0.012;
    /* update particles */
    particles.forEach(function(p, i) {
      p.x += p.vx; p.y += p.vy; p.life++;
      if (p.life > p.maxLife) particles[i] = newParticle();
    });
    /* label fade */
    if (hoveredSpot) { labelFade = Math.min(1, labelFade + 0.08); }
    else             { labelFade = Math.max(0, labelFade - 0.08); }
    /* transition */
    if (transDir !== 0) {
      transAlpha = Math.max(0, Math.min(1, transAlpha + transDir * transSpeed));
      if (transDir === 1 && transAlpha >= 1) { currentRoom = transTarget; transDir = -1; updateHUD(); }
      if (transDir === -1 && transAlpha <= 0) { transDir = 0; transitioning = false; }
    }
    redraw();
  }

  /* ── Draw current room ── */
  function redraw() {
    if (!ctx) return;
    ctx.save();
    ctx.scale(1/DPR, 1/DPR); /* reset scale for raw pixel ops if any */
    ctx.restore();
    ctx.clearRect(0, 0, W, H);
    hotspots = [];

    switch (currentRoom) {
      case 'gate':         drawGate();         break;
      case 'jagali':       drawJagali();       break;
      case 'aangan':       drawAangan();       break;
      case 'study':        drawStudy();        break;
      case 'achievements': drawAchievements(); break;
      case 'kala':         drawKala();         break;
      case 'kitchen':      drawKitchen();      break;
      case 'temple':       drawTemple();       break;
    }

    drawParticles();
    drawHoverLabel();
    if (transAlpha > 0) {
      ctx.globalAlpha = transAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  /* ═══════════════════════════════════════════════════
     ROOM PAINTERS
  ═══════════════════════════════════════════════════ */

  /* Shared sky/day-night sky gradient */
  function skyGrad() {
    if (isDay) {
      var g = ctx.createLinearGradient(0, 0, 0, H * 0.65);
      g.addColorStop(0,   '#6BBFE8');
      g.addColorStop(0.6, '#A8D8F0');
      g.addColorStop(1,   '#DBEDF8');
      return g;
    } else {
      var g2 = ctx.createLinearGradient(0, 0, 0, H * 0.65);
      g2.addColorStop(0,   '#05080F');
      g2.addColorStop(0.7, '#0C1528');
      g2.addColorStop(1,   '#1A2540');
      return g2;
    }
  }

  /* Shared ground gradient */
  function groundGrad(y0, y1, warm) {
    var g = ctx.createLinearGradient(0, y0, 0, y1);
    if (warm) {
      g.addColorStop(0, '#C09060'); g.addColorStop(1, '#8A5E30');
    } else {
      g.addColorStop(0, '#B89060'); g.addColorStop(1, '#7A5028');
    }
    return g;
  }

  /* Draw night stars */
  function drawStars() {
    if (isDay) return;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    var stars = [[0.1,0.05],[0.25,0.03],[0.4,0.08],[0.55,0.02],[0.7,0.06],[0.85,0.04],
                 [0.15,0.12],[0.5,0.11],[0.78,0.09],[0.9,0.15],[0.05,0.18],[0.6,0.15]];
    stars.forEach(function(s) {
      ctx.beginPath(); ctx.arc(s[0]*W, s[1]*H, 1.2, 0, Math.PI*2); ctx.fill();
    });
  }

  /* Draw sun or moon */
  function drawSunMoon() {
    if (isDay) {
      /* Sun */
      var sx = W*0.82, sy = H*0.1;
      var sg = ctx.createRadialGradient(sx, sy, 2, sx, sy, 45);
      sg.addColorStop(0, '#FFF5A0'); sg.addColorStop(0.35, '#FFE040'); sg.addColorStop(1, 'rgba(255,220,40,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, 45, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#FFE060'; ctx.beginPath(); ctx.arc(sx, sy, 20, 0, Math.PI*2); ctx.fill();
    } else {
      /* Moon */
      var mx = W*0.15, my = H*0.1;
      ctx.fillStyle = '#D8E8FF';
      ctx.beginPath(); ctx.arc(mx, my, 18, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0C1528';
      ctx.beginPath(); ctx.arc(mx+7, my-4, 15, 0, Math.PI*2); ctx.fill();
    }
  }

  /* ── GATE ── */
  function drawGate() {
    /* Sky */
    ctx.fillStyle = skyGrad(); ctx.fillRect(0, 0, W, H*0.62);
    drawStars(); drawSunMoon();
    /* Ground: mud path + grass */
    ctx.fillStyle = groundGrad(H*0.62, H, false); ctx.fillRect(0, H*0.62, W, H*0.38);
    /* Grass strips */
    ctx.fillStyle = '#4A7040';
    ctx.fillRect(0, H*0.62, W*0.28, H*0.38);
    ctx.fillRect(W*0.72, H*0.62, W*0.28, H*0.38);
    /* Mud path */
    ctx.fillStyle = '#9A7850';
    ctx.beginPath(); ctx.moveTo(W*0.38, H); ctx.lineTo(W*0.62, H); ctx.lineTo(W*0.54, H*0.62); ctx.lineTo(W*0.46, H*0.62); ctx.closePath(); ctx.fill();

    /* Compound wall: warm ochre */
    var wallY = H*0.38, wallH = H*0.27;
    ctx.fillStyle = '#D4B880';
    ctx.fillRect(0, wallY, W*0.36, wallH);
    ctx.fillRect(W*0.64, wallY, W*0.36, wallH);
    /* Wall top border - terracotta */
    ctx.fillStyle = '#B03010';
    ctx.fillRect(0, wallY, W*0.36, 8); ctx.fillRect(W*0.64, wallY, W*0.36, 8);
    /* Wall texture lines */
    ctx.strokeStyle = 'rgba(100,60,10,0.18)'; ctx.lineWidth = 1;
    for (var wi = 0; wi < 6; wi++) {
      ctx.beginPath(); ctx.moveTo(0, wallY + wi*14+14); ctx.lineTo(W*0.36, wallY+wi*14+14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W*0.64, wallY+wi*14+14); ctx.lineTo(W, wallY+wi*14+14); ctx.stroke();
    }

    /* Gate pillars */
    var pilW = W*0.055, pilH = H*0.36;
    var lPilX = W*0.36, rPilX = W*0.64 - pilW;
    var pilY = H*0.28;
    /* Pillar shadow */
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(lPilX+8, pilY+8, pilW, pilH); ctx.fillRect(rPilX+8, pilY+8, pilW, pilH);
    /* Pillars */
    var pilGrad = ctx.createLinearGradient(lPilX, 0, lPilX+pilW, 0);
    pilGrad.addColorStop(0, '#F0E0B8'); pilGrad.addColorStop(0.4, '#E8D4A0'); pilGrad.addColorStop(1, '#C8B070');
    ctx.fillStyle = pilGrad; ctx.fillRect(lPilX, pilY, pilW, pilH);
    var pilGrad2 = ctx.createLinearGradient(rPilX, 0, rPilX+pilW, 0);
    pilGrad2.addColorStop(0, '#F0E0B8'); pilGrad2.addColorStop(0.4, '#E8D4A0'); pilGrad2.addColorStop(1, '#C8B070');
    ctx.fillStyle = pilGrad2; ctx.fillRect(rPilX, pilY, pilW, pilH);
    /* Pillar tops */
    ctx.fillStyle = '#D4A017';
    ctx.fillRect(lPilX-4, pilY, pilW+8, 10); ctx.fillRect(rPilX-4, pilY, pilW+8, 10);
    /* Pillar cap domes */
    ctx.fillStyle = '#B03010';
    ctx.beginPath(); ctx.ellipse(lPilX+pilW/2, pilY, pilW/2+6, 14, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.ellipse(rPilX+pilW/2, pilY, pilW/2+6, 14, 0, Math.PI, 0); ctx.fill();
    /* Gate top bar */
    ctx.fillStyle = '#C8A060';
    ctx.fillRect(lPilX + pilW, pilY, rPilX - lPilX - pilW, 16);
    /* Decorative arch on top bar */
    ctx.fillStyle = '#B03010';
    ctx.beginPath(); ctx.arc(W*0.5, pilY+16, W*0.08, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#D4A017'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(W*0.5, pilY+16, W*0.08, Math.PI, 0); ctx.stroke();

    /* Gate doors — two wooden panels */
    var gateW = (rPilX - lPilX - pilW - pilW) / 2;
    var gX1 = lPilX + pilW, gX2 = W*0.5;
    var gY  = pilY + 14, gH = H*0.28;
    /* Left door */
    var dg1 = ctx.createLinearGradient(gX1, 0, gX1+gateW, 0);
    dg1.addColorStop(0,'#8B5A2B'); dg1.addColorStop(0.5,'#A06830'); dg1.addColorStop(1,'#6B3A18');
    ctx.fillStyle = dg1; ctx.fillRect(gX1, gY, gateW, gH);
    /* Right door */
    var dg2 = ctx.createLinearGradient(gX2, 0, gX2+gateW, 0);
    dg2.addColorStop(0,'#6B3A18'); dg2.addColorStop(0.5,'#A06830'); dg2.addColorStop(1,'#8B5A2B');
    ctx.fillStyle = dg2; ctx.fillRect(gX2, gY, gateW, gH);
    /* Door panels */
    ctx.strokeStyle = '#5A2A0A'; ctx.lineWidth = 2;
    ctx.strokeRect(gX1+8, gY+10, gateW-16, gH*0.4);
    ctx.strokeRect(gX1+8, gY+gH*0.5, gateW-16, gH*0.4);
    ctx.strokeRect(gX2+8, gY+10, gateW-16, gH*0.4);
    ctx.strokeRect(gX2+8, gY+gH*0.5, gateW-16, gH*0.4);
    /* Door knobs */
    ctx.fillStyle = '#D4A017';
    ctx.beginPath(); ctx.arc(gX2-8, gY+gH/2, 7, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(gX2+8, gY+gH/2, 7, 0, Math.PI*2); ctx.fill();
    /* "Shree Krishna Prasanna" above gate */
    ctx.fillStyle = '#CC2200'; ctx.font = 'bold '+(H*0.028)+'px serif'; ctx.textAlign = 'center';
    ctx.fillText('‖ Shree Krishna Prasanna ‖', W*0.5, pilY - 10);

    /* Enter instruction */
    ctx.fillStyle = 'rgba(240,220,160,0.92)';
    roundRect(ctx, W/2-100, H*0.84, 200, 36, 18);
    ctx.fillStyle = '#3A1A00'; ctx.font = 'bold '+(H*0.022)+'px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Click gate to enter →', W/2, H*0.84+23);

    /* Trees flanking */
    drawTree(W*0.08, H*0.65, 0.8);
    drawTree(W*0.92, H*0.65, 0.8);

    hotspots.push({ x:lPilX, y:gY, w:rPilX-lPilX+pilW, h:gH+20, label:'Enter — click to open', action:'go', data:'jagali' });
  }

  /* ── JAGALI ── */
  function drawJagali() {
    /* Sky + ground */
    ctx.fillStyle = skyGrad(); ctx.fillRect(0, 0, W, H*0.55);
    drawStars(); drawSunMoon();
    ctx.fillStyle = groundGrad(H*0.55, H, false); ctx.fillRect(0, H*0.55, W, H*0.45);
    ctx.fillStyle = '#4A7040'; ctx.fillRect(0, H*0.55, W*0.18, H*0.45); ctx.fillRect(W*0.82, H*0.55, W*0.18, H*0.45);

    /* House front wall far back */
    ctx.fillStyle = '#D8C890';
    ctx.beginPath(); ctx.moveTo(W*0.18, H*0.18); ctx.lineTo(W*0.82, H*0.18);
    ctx.lineTo(W*0.82, H*0.58); ctx.lineTo(W*0.18, H*0.58); ctx.closePath(); ctx.fill();
    /* Roof */
    ctx.fillStyle = '#922B1A';
    ctx.beginPath(); ctx.moveTo(W*0.1, H*0.2); ctx.lineTo(W*0.5, H*0.04); ctx.lineTo(W*0.9, H*0.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7A1E10';
    ctx.beginPath(); ctx.moveTo(W*0.1, H*0.2); ctx.lineTo(W*0.12, H*0.22); ctx.lineTo(W*0.5, H*0.06); ctx.lineTo(W*0.88, H*0.22); ctx.lineTo(W*0.9, H*0.2); ctx.lineTo(W*0.5, H*0.04); ctx.closePath(); ctx.fill();

    /* Raised jagali platform */
    ctx.fillStyle = '#B0A090';
    ctx.beginPath();
    ctx.moveTo(W*0.04, H*0.72); ctx.lineTo(W*0.04, H*0.57); ctx.lineTo(W*0.46, H*0.52);
    ctx.lineTo(W*0.46, H*0.72); ctx.closePath(); ctx.fill();
    /* Platform top surface */
    ctx.fillStyle = '#C8B8A8';
    ctx.beginPath();
    ctx.moveTo(W*0.04, H*0.57); ctx.lineTo(W*0.46, H*0.52); ctx.lineTo(W*0.48, H*0.55); ctx.lineTo(W*0.06, H*0.6); ctx.closePath(); ctx.fill();
    /* Platform edge highlight */
    ctx.strokeStyle = '#D8C8B0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W*0.04, H*0.57); ctx.lineTo(W*0.46, H*0.52); ctx.stroke();
    /* Stone texture on platform face */
    ctx.strokeStyle = 'rgba(80,60,40,0.2)'; ctx.lineWidth = 1;
    for (var si=0; si<4; si++) {
      var sy2 = H*(0.59+si*0.035);
      ctx.beginPath(); ctx.moveTo(W*0.04, sy2); ctx.lineTo(W*0.46, sy2-H*0.01); ctx.stroke();
    }

    /* Bell post on jagali */
    ctx.fillStyle = '#5C3010'; ctx.fillRect(W*0.2, H*0.38, 8, H*0.17);
    /* Bell */
    ctx.fillStyle = '#D4A017';
    ctx.beginPath(); ctx.ellipse(W*0.204, H*0.39, 16, 12, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#B08010';
    ctx.beginPath(); ctx.ellipse(W*0.204, H*0.39, 16, 12, 0, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = '#3A1800'; ctx.beginPath(); ctx.arc(W*0.204, H*0.39, 3, 0, Math.PI*2); ctx.fill();

    /* Blog scrolls on platform */
    var blogs = [
      { title:'Saraswathi Puja',  sub:'Festival blog', url:'saraswatipoojablog.html',  x:W*0.1  },
      { title:'Web Dev Journey',  sub:'Dev thoughts',   url:'webdevtransform.html',     x:W*0.22 },
      { title:'More Blogs →',     sub:'All posts',      url:'balcony.html',             x:W*0.34 },
    ];
    blogs.forEach(function(b) {
      drawScroll(b.x, H*0.56, W*0.1, H*0.1, b.title, b.sub);
      hotspots.push({ x:b.x-W*0.05, y:H*0.52, w:W*0.11, h:H*0.12, label:b.title, action:'blog', data:b });
    });

    /* Trees */
    drawTree(W*0.88, H*0.6, 1.0);
    drawTree(W*0.94, H*0.62, 0.7);

    hotspots.push({ x:W*0.18, y:H*0.26, w:W*0.3, h:H*0.28, label:'Jagali — the front platform', action:'info', data:'jagali' });
    hotspots.push({ x:W*0.17, y:H*0.35, w:W*0.07, h:H*0.1,  label:'Calling Bell — ring to connect', action:'bell', data:{} });
  }

  /* ── AANGAN ── */
  function drawAangan() {
    /* Interior — warm ochre walls */
    var floorY = H*0.58;
    /* Ceiling */
    ctx.fillStyle = isDay ? '#E8D4A0' : '#C4B07A';
    ctx.fillRect(0, 0, W, H*0.12);
    /* Back wall */
    var wallGrad = ctx.createLinearGradient(0, H*0.12, 0, floorY);
    wallGrad.addColorStop(0, isDay?'#E2C880':'#C4AA60');
    wallGrad.addColorStop(1, isDay?'#D4B860':'#B09040');
    ctx.fillStyle = wallGrad; ctx.fillRect(0, H*0.12, W, floorY - H*0.12);

    /* Floor — stone slabs */
    var fGrad = ctx.createLinearGradient(0, floorY, 0, H);
    fGrad.addColorStop(0, '#C8B898'); fGrad.addColorStop(1, '#A89070');
    ctx.fillStyle = fGrad; ctx.fillRect(0, floorY, W, H - floorY);
    /* Floor slab lines */
    ctx.strokeStyle = 'rgba(100,70,30,0.22)'; ctx.lineWidth = 1;
    for (var fi=0; fi<8; fi++) {
      ctx.beginPath(); ctx.moveTo(fi*(W/8), floorY); ctx.lineTo(fi*(W/8), H); ctx.stroke();
    }
    for (var fj=0; fj<5; fj++) {
      ctx.beginPath(); ctx.moveTo(0, floorY + fj*(H-floorY)/5); ctx.lineTo(W, floorY + fj*(H-floorY)/5); ctx.stroke();
    }

    /* Side walls with perspective */
    /* Left wall */
    ctx.fillStyle = isDay ? '#C8A858' : '#A88838';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.15, H*0.12); ctx.lineTo(W*0.15, floorY); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    /* Right wall */
    ctx.fillStyle = isDay ? '#B89848' : '#987828';
    ctx.beginPath(); ctx.moveTo(W,0); ctx.lineTo(W*0.85, H*0.12); ctx.lineTo(W*0.85, floorY); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

    /* Katte (raised seating) around edges */
    ctx.fillStyle = '#A89070';
    ctx.fillRect(W*0.15, floorY, W*0.7, H*0.045);
    ctx.fillRect(0, H*0.72, W*0.12, H*0.28);
    ctx.fillRect(W*0.88, H*0.72, W*0.12, H*0.28);
    ctx.fillStyle = '#C0A880';
    ctx.fillRect(W*0.15, floorY, W*0.7, 6);
    ctx.fillRect(0, H*0.72, W*0.12, 6);
    ctx.fillRect(W*0.88, H*0.72, W*0.12, 6);

    /* Doorways on side walls */
    drawDoorway(W*0.15, H*0.18, W*0.12, H*0.4, 'Study Room →', 'Shiva Chidambara Prasanna', 'study');
    drawDoorway(W*0.73, H*0.18, W*0.12, H*0.4, '← Kala Room', 'Saraswathi Prasanna', 'kala');

    /* Open sky through top — courtyard feel */
    ctx.fillStyle = skyGrad();
    ctx.beginPath();
    ctx.moveTo(W*0.25, 0); ctx.lineTo(W*0.75, 0); ctx.lineTo(W*0.7, H*0.12); ctx.lineTo(W*0.3, H*0.12); ctx.closePath(); ctx.fill();
    if (isDay) {
      /* Sun peeking through */
      ctx.fillStyle = 'rgba(255,220,80,0.4)';
      ctx.beginPath(); ctx.arc(W*0.5, 0, W*0.12, 0, Math.PI*2); ctx.fill();
    }
    drawStars();

    /* Diya near entrance — warm glow */
    drawDiya(W*0.5, floorY - 18);
    var diyaGlow = ctx.createRadialGradient(W*0.5, floorY-18, 0, W*0.5, floorY-18, W*0.18);
    diyaGlow.addColorStop(0, 'rgba(255,160,40,0.28)'); diyaGlow.addColorStop(1, 'rgba(255,160,40,0)');
    ctx.fillStyle = diyaGlow; ctx.fillRect(0, 0, W, H);

    /* Tulsi katte — center of aangan */
    var katteX = W*0.38, katteW = W*0.24, katteY = floorY + H*0.055, katteH = H*0.28;
    /* Katte base raised platform */
    ctx.fillStyle = '#9A8870';
    ctx.fillRect(katteX, katteY + katteH*0.55, katteW, katteH*0.45);
    ctx.fillStyle = '#B09880';
    ctx.fillRect(katteX - 6, katteY + katteH*0.5, katteW + 12, 10);
    /* Katte top face */
    ctx.fillStyle = '#C4B090'; ctx.fillRect(katteX, katteY + katteH*0.5, katteW, 8);

    /* Tulsi plant — painted illustration */
    drawTulsiPlant(W*0.5, katteY + katteH*0.5, katteH*0.85);

    /* Quote board on back wall */
    drawQuoteBoard(W*0.75, H*0.2);

    /* "Karthik Radha Damodar Prasanna" on top of entrance door (back center) */
    ctx.fillStyle = '#CC2200'; ctx.font = 'bold '+(H*0.022)+'px serif'; ctx.textAlign = 'center';
    ctx.fillText('‖ Karthik Radha Damodar Prasanna ‖', W*0.5, H*0.1);

    hotspots.push({ x:katteX, y:katteY, w:katteW, h:katteH, label:'Tulsi — Identity Map, click a leaf', action:'panel', data:'tulsi' });
    hotspots.push({ x:W*0.7, y:H*0.18, w:W*0.16, h:H*0.22, label:'Quote board', action:'panel', data:'quote' });
  }

  /* ── STUDY ROOM ── */
  function drawStudy() {
    drawInteriorRoom('#D8C478', '#B89A50', '#E8D898', '#7A9AB8');

    /* Desk — left side */
    var deskX = W*0.05, deskY = H*0.55, deskW = W*0.52, deskH = H*0.06;
    var dGrad = ctx.createLinearGradient(deskX, deskY, deskX, deskY+deskH*3);
    dGrad.addColorStop(0,'#6A3810'); dGrad.addColorStop(1,'#3A1800');
    ctx.fillStyle = dGrad; ctx.fillRect(deskX, deskY, deskW, deskH);
    ctx.fillStyle = '#8A5020'; ctx.fillRect(deskX, deskY+deskH, deskW, H*0.18); /* desk front */
    /* Desk surface highlight */
    ctx.fillStyle = 'rgba(255,220,140,0.12)'; ctx.fillRect(deskX, deskY, deskW, 3);

    /* Desk legs */
    ctx.fillStyle = '#5A2808';
    ctx.fillRect(deskX+10, deskY+deskH+H*0.18, 12, H*0.1);
    ctx.fillRect(deskX+deskW-22, deskY+deskH+H*0.18, 12, H*0.1);

    /* Books standing on desk */
    var bookDefs = [
      { title:'Experience', color:'#7C3AED', section:'experience' },
      { title:'Research',   color:'#0EA5E9', section:'research'   },
      { title:'Projects',   color:'#10B981', section:'projects'   },
      { title:'Skills',     color:'#F59E0B', section:'skills'     },
      { title:'Education',  color:'#EF4444', section:'education'  },
    ];
    bookDefs.forEach(function(b, i) {
      var bx = deskX + 30 + i * (deskW*0.18);
      drawBook3D(bx, deskY - H*0.2, W*0.07, H*0.2, b.title, b.color);
      hotspots.push({ x:bx, y:deskY-H*0.21, w:W*0.07, h:H*0.22, label:b.title, action:'panel', data:'study-'+b.section });
    });

    /* Desk lamp */
    ctx.fillStyle = '#888'; ctx.fillRect(deskX+deskW-30, deskY-H*0.18, 5, H*0.18);
    ctx.fillStyle = '#AAA';
    ctx.beginPath(); ctx.ellipse(deskX+deskW-26, deskY-H*0.18, 22, 10, -0.4, 0, Math.PI*2); ctx.fill();
    /* Lamp glow */
    var lampGlow = ctx.createRadialGradient(deskX+deskW-26, deskY-H*0.16, 0, deskX+deskW-26, deskY, W*0.12);
    lampGlow.addColorStop(0,'rgba(255,240,160,0.35)'); lampGlow.addColorStop(1,'rgba(255,240,160,0)');
    ctx.fillStyle = lampGlow; ctx.fillRect(deskX+deskW-100, deskY-H*0.2, 200, H*0.3);

    /* Achievements wall on right */
    ctx.fillStyle = '#C8A050'; ctx.font = 'bold '+(H*0.026)+'px serif'; ctx.textAlign='center';
    ctx.fillText('‖ Shiva Chidambara Prasanna ‖', W*0.5, H*0.08);

    /* Window on right wall — daylight */
    if (isDay) {
      ctx.fillStyle = '#A8D4F0';
      ctx.fillRect(W*0.74, H*0.2, W*0.14, H*0.22);
      ctx.strokeStyle = '#8A6030'; ctx.lineWidth = 5;
      ctx.strokeRect(W*0.74, H*0.2, W*0.14, H*0.22);
      ctx.strokeStyle = '#8A6030'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W*0.74, H*0.31); ctx.lineTo(W*0.88, H*0.31); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W*0.81, H*0.2); ctx.lineTo(W*0.81, H*0.42); ctx.stroke();
      /* Sunlight shaft */
      var shaft = ctx.createLinearGradient(W*0.74, 0, W*0.6, H*0.7);
      shaft.addColorStop(0,'rgba(255,240,160,0.22)'); shaft.addColorStop(1,'rgba(255,240,160,0)');
      ctx.fillStyle = shaft;
      ctx.beginPath(); ctx.moveTo(W*0.74, H*0.2); ctx.lineTo(W*0.88, H*0.2); ctx.lineTo(W*0.65, H*0.8); ctx.lineTo(W*0.5, H*0.8); ctx.closePath(); ctx.fill();
    }
  }

  /* ── WALL OF ACHIEVEMENTS ── */
  function drawAchievements() {
    drawInteriorRoom('#E0C860', '#C0A040', '#F0DCA0', '#7A9AB8');
    ctx.fillStyle = '#C8A050'; ctx.font = 'bold '+(H*0.026)+'px serif'; ctx.textAlign='center';
    ctx.fillText('Wall of Achievements', W*0.5, H*0.09);

    /* Main achievement image display */
    var imgX = W*0.15, imgY = H*0.15, imgW = W*0.7, imgH = H*0.55;
    /* Frame */
    ctx.fillStyle = '#D4A017'; ctx.fillRect(imgX-12, imgY-12, imgW+24, imgH+24);
    ctx.fillStyle = '#8A6010'; ctx.fillRect(imgX-8, imgY-8, imgW+16, imgH+16);
    ctx.fillStyle = '#C89020'; ctx.fillRect(imgX-4, imgY-4, imgW+8, imgH+8);
    /* Image or placeholder */
    var src = ACH_IMGS[achIdx];
    var img = ACH_IMGS_LOADED[src];
    if (img && img.complete && img.naturalWidth) {
      ctx.save();
      ctx.rect(imgX, imgY, imgW, imgH); ctx.clip();
      /* letterbox */
      var iw = img.naturalWidth, ih = img.naturalHeight;
      var scale = Math.max(imgW/iw, imgH/ih);
      var sw = iw*scale, sh = ih*scale;
      ctx.drawImage(img, imgX + (imgW-sw)/2, imgY + (imgH-sh)/2, sw, sh);
      ctx.restore();
    } else {
      ctx.fillStyle = '#2A1A00'; ctx.fillRect(imgX, imgY, imgW, imgH);
      ctx.fillStyle = '#D4A017'; ctx.font = (H*0.04)+'px serif'; ctx.textAlign='center';
      ctx.fillText('🏆', W*0.5, imgY + imgH*0.45);
    }

    /* Caption */
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(imgX, imgY+imgH-H*0.1, imgW, H*0.1);
    ctx.fillStyle = '#FFE080'; ctx.font = 'bold '+(H*0.022)+'px sans-serif'; ctx.textAlign='center';
    wrapTextC(ctx, ACH_CAPS[achIdx], W*0.5, imgY+imgH-H*0.055, imgW-24, H*0.025);

    /* Slide counter */
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = (H*0.018)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText((achIdx+1) + ' / ' + ACH_IMGS.length, W*0.5, imgY + imgH + H*0.04);

    /* Nav arrows */
    drawArrowBtn(imgX - 55, imgY + imgH/2, '←');
    drawArrowBtn(imgX + imgW + 20, imgY + imgH/2, '→');

    hotspots.push({ x:imgX-80, y:imgY+imgH*0.3, w:55, h:imgH*0.4, label:'Previous', action:'ach-prev', data:{} });
    hotspots.push({ x:imgX+imgW+15, y:imgY+imgH*0.3, w:55, h:imgH*0.4, label:'Next', action:'ach-next', data:{} });
    hotspots.push({ x:imgX, y:imgY, w:imgW, h:imgH, label:'View achievement', action:'panel', data:'ach-'+achIdx });
  }

  /* ── KALA ROOM ── */
  function drawKala() {
    drawInteriorRoom('#C8B070', '#A09048', '#E0C888', '#6A8890');
    ctx.fillStyle = '#C8A050'; ctx.font = 'bold '+(H*0.026)+'px serif'; ctx.textAlign='center';
    ctx.fillText('‖ Saraswathi Prasanna ‖', W*0.5, H*0.09);

    /* Stage */
    var stageX = W*0.12, stageY = H*0.56, stageW = W*0.76, stageH = H*0.06;
    ctx.fillStyle = '#4A2808';
    ctx.fillRect(stageX, stageY, stageW, stageH);
    ctx.fillStyle = '#6A3A10'; ctx.fillRect(stageX, stageY, stageW, 6);
    ctx.fillStyle = '#3A1800'; ctx.fillRect(stageX, stageY+stageH, stageW, H*0.1);
    /* Stage edge glow */
    var sGlow = ctx.createLinearGradient(0, stageY, 0, stageY+8);
    sGlow.addColorStop(0,'rgba(255,180,60,0.4)'); sGlow.addColorStop(1,'rgba(255,180,60,0)');
    ctx.fillStyle = sGlow; ctx.fillRect(stageX, stageY, stageW, 20);

    /* Tabla set */
    var tablaX = W*0.2, tablaY = stageY - H*0.04;
    drawTabla(tablaX, tablaY);
    hotspots.push({ x:tablaX-W*0.07, y:tablaY-H*0.2, w:W*0.2, h:H*0.25, label:'Tabla — Classical percussion', action:'panel', data:'kala-tabla' });

    /* Harmonium */
    var harmX = W*0.42, harmY = stageY - H*0.01;
    drawHarmonium(harmX, harmY);
    hotspots.push({ x:harmX-W*0.01, y:harmY-H*0.14, w:W*0.18, h:H*0.18, label:'Harmonium', action:'panel', data:'kala-tabla' });

    /* Standing mic */
    var micX = W*0.72, micY = stageY - H*0.0;
    drawMic(micX, micY);
    hotspots.push({ x:micX-W*0.04, y:micY-H*0.35, w:W*0.08, h:H*0.38, label:'Mic — Speech & Vocal', action:'panel', data:'kala-vocal' });

    /* Scrolls on right wall shelf */
    var shelfY = H*0.34;
    ctx.fillStyle = '#5C3010'; ctx.fillRect(W*0.72, shelfY+H*0.05, W*0.2, 8);
    var scrollTitles = ['Halgannada Poem','Vedanta Verse','Published Author'];
    var scrollItems  = ['kala-poems','kala-poems','kala-author'];
    scrollTitles.forEach(function(s, i) {
      var sx2 = W*0.74 + i*W*0.062;
      drawScroll(sx2, shelfY, W*0.055, H*0.07, s, '');
      hotspots.push({ x:sx2-W*0.01, y:shelfY-H*0.01, w:W*0.065, h:H*0.1, label:s, action:'panel', data:scrollItems[i] });
    });

    /* Curtains on sides */
    drawCurtain(0, 0, W*0.12);
    drawCurtain(W*0.88, 0, W*0.12);
  }

  /* ── KITCHEN ── */
  function drawKitchen() {
    drawInteriorRoom('#C8A870', '#A88048', '#DFC898', '#A06820');
    ctx.fillStyle = '#C8A050'; ctx.font = 'bold '+(H*0.026)+'px serif'; ctx.textAlign='center';
    ctx.fillText('‖ Annapoorneshwari Prasanna ‖', W*0.5, H*0.09);

    /* Stone counter / chulha area */
    var ctrX = W*0.08, ctrY = H*0.5, ctrW = W*0.42, ctrH = H*0.1;
    ctx.fillStyle = '#6A5040'; ctx.fillRect(ctrX, ctrY, ctrW, ctrH+H*0.2);
    ctx.fillStyle = '#8A7060'; ctx.fillRect(ctrX, ctrY, ctrW, 8);
    /* Counter top surface */
    ctx.fillStyle = '#9A8070'; ctx.fillRect(ctrX, ctrY, ctrW, ctrH);

    /* Chulha (wood stove) */
    var chX = ctrX+W*0.05, chY = ctrY+ctrH*0.2;
    ctx.fillStyle = '#2A1A0A'; ctx.fillRect(chX, chY, W*0.14, ctrH*0.6);
    ctx.fillStyle = '#4A2A10'; ctx.fillRect(chX+4, chY+4, W*0.14-8, ctrH*0.6-8);
    /* Fire glow */
    var fireGrad = ctx.createRadialGradient(chX+W*0.07, chY+ctrH*0.4, 0, chX+W*0.07, chY, W*0.1);
    fireGrad.addColorStop(0,'rgba(255,120,0,0.9)'); fireGrad.addColorStop(0.4,'rgba(255,60,0,0.5)'); fireGrad.addColorStop(1,'rgba(255,60,0,0)');
    ctx.fillStyle = fireGrad; ctx.fillRect(chX-W*0.05, chY-H*0.1, W*0.24, H*0.2);
    /* Resume icon on stove */
    ctx.fillStyle = '#7C3AED'; ctx.font = 'bold '+(H*0.022)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('📄 Resume', chX+W*0.07, chY-H*0.03);
    hotspots.push({ x:chX-W*0.01, y:chY-H*0.06, w:W*0.16, h:H*0.16, label:'Click stove — open Resume PDF', action:'resume', data:{} });

    /* Pot / vessel on counter */
    drawPot(ctrX+W*0.28, ctrY-H*0.06);
    drawPot(ctrX+W*0.35, ctrY-H*0.04);

    /* Social link jars — right side */
    var jarDefs = [
      { label:'LinkedIn',  color:'#0077B5', url:'https://linkedin.com/in/sujaykulkarni-2211', x:W*0.62 },
      { label:'Instagram', color:'#E4405F', url:'https://instagram.com/sujay.vk.official',   x:W*0.74 },
      { label:'Email',     color:'#10B981', url:'mailto:sujaykulkarni2211@gmail.com',         x:W*0.86 },
    ];
    jarDefs.forEach(function(j) {
      drawJar(j.x, H*0.52, j.label, j.color);
      hotspots.push({ x:j.x-W*0.05, y:H*0.42, w:W*0.1, h:H*0.2, label:j.label, action:'social', data:j.url });
    });

    /* Calling bell near back */
    ctx.fillStyle = '#5C3010'; ctx.fillRect(W*0.5, H*0.28, 6, H*0.18);
    ctx.fillStyle = '#D4A017';
    ctx.beginPath(); ctx.ellipse(W*0.503, H*0.29, 14, 10, 0, 0, Math.PI); ctx.fill();
    hotspots.push({ x:W*0.48, y:H*0.26, w:W*0.05, h:H*0.12, label:'Calling Bell — Contact', action:'bell', data:{} });

    /* Opening to temple on right */
    drawDoorway(W*0.74, H*0.18, W*0.14, H*0.4, 'Temple →', 'Kuladevatha Prasanna', 'temple');
    /* Warm glow bleeding from temple */
    var tBleed = ctx.createRadialGradient(W, H*0.5, 0, W, H*0.5, W*0.5);
    tBleed.addColorStop(0,'rgba(255,200,60,0.28)'); tBleed.addColorStop(1,'rgba(255,200,60,0)');
    ctx.fillStyle = tBleed; ctx.fillRect(0, 0, W, H);
  }

  /* ── TEMPLE ── */
  function drawTemple() {
    /* Extra warm, bright, golden space */
    /* Ceiling */
    ctx.fillStyle = '#F0D870'; ctx.fillRect(0, 0, W, H*0.12);
    /* Back wall — cream white */
    var wGrad = ctx.createLinearGradient(0, H*0.12, 0, H*0.62);
    wGrad.addColorStop(0, '#F8F0D8'); wGrad.addColorStop(1, '#ECDCA8');
    ctx.fillStyle = wGrad; ctx.fillRect(0, H*0.12, W, H*0.5);
    /* Side walls */
    ctx.fillStyle = '#E8D498';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.14,H*0.12); ctx.lineTo(W*0.14,H*0.62); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#DCC888';
    ctx.beginPath(); ctx.moveTo(W,0); ctx.lineTo(W*0.86,H*0.12); ctx.lineTo(W*0.86,H*0.62); ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
    /* Floor — marble-like */
    var fGrad2 = ctx.createLinearGradient(0,H*0.62,0,H);
    fGrad2.addColorStop(0,'#F0E8C8'); fGrad2.addColorStop(1,'#D8C898');
    ctx.fillStyle = fGrad2; ctx.fillRect(0, H*0.62, W, H*0.38);
    /* Marble lines */
    ctx.strokeStyle = 'rgba(200,170,80,0.3)'; ctx.lineWidth = 1;
    for (var mi=1; mi<6; mi++) { ctx.beginPath(); ctx.moveTo(mi*W/6, H*0.62); ctx.lineTo(mi*W/6, H); ctx.stroke(); }

    /* Ornate arch */
    ctx.fillStyle = '#D4A017'; ctx.lineWidth = 6; ctx.strokeStyle = '#D4A017';
    ctx.beginPath(); ctx.arc(W*0.5, H*0.12, W*0.38, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(W*0.5, H*0.12, W*0.32, Math.PI, 0); ctx.stroke();
    /* Arch pillars */
    ctx.fillStyle = '#E8D090'; ctx.fillRect(W*0.12, H*0.12, W*0.06, H*0.5);
    ctx.fillRect(W*0.82, H*0.12, W*0.06, H*0.5);
    ctx.fillStyle = '#D4A017'; ctx.fillRect(W*0.1, H*0.1, W*0.08, 10); ctx.fillRect(W*0.82, H*0.1, W*0.08, 10);

    /* Altar platform */
    ctx.fillStyle = '#E8D890'; ctx.fillRect(W*0.18, H*0.56, W*0.64, H*0.07);
    ctx.fillStyle = '#F0E8B8'; ctx.fillRect(W*0.18, H*0.56, W*0.64, 8);

    /* Deities */
    var deities = [
      { name:'Saraswathi', color:'#F8C040', icon:'🪷', x:W*0.22 },
      { name:'Krishna',    color:'#4488FF', icon:'🦚', x:W*0.34 },
      { name:'Ganesha',    color:'#F0A030', icon:'🐘', x:W*0.46 },
      { name:'Lakshmi',    color:'#FFD040', icon:'🌸', x:W*0.58 },
      { name:'Hanuman',    color:'#FF8844', icon:'🌺', x:W*0.70 },
    ];
    deities.forEach(function(d) {
      drawDeityPanel(d.x, H*0.18, d.name, d.color, d.icon);
      hotspots.push({ x:d.x-W*0.05, y:H*0.14, w:W*0.1, h:H*0.44, label:d.name, action:'panel', data:'deity' });
    });

    /* Shiva linga center */
    ctx.fillStyle = '#555588'; ctx.beginPath(); ctx.ellipse(W*0.5, H*0.545, W*0.025, H*0.015, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4A4470'; ctx.fillRect(W*0.484, H*0.46, W*0.032, H*0.085);
    ctx.fillStyle = '#6655AA'; ctx.beginPath(); ctx.ellipse(W*0.5, H*0.46, W*0.025, H*0.02, 0, 0, Math.PI*2); ctx.fill();

    /* Flowers on altar */
    var flowers = ['#FF6688','#FFB030','#FF4466','#FFEE30','#FF88CC'];
    flowers.forEach(function(fc, i) {
      drawFlower(W*0.24 + i*W*0.14, H*0.59, fc);
      hotspots.push({ x:W*0.21+i*W*0.14, y:H*0.57, w:W*0.07, h:H*0.04, label:'Offer flower — Pushpanjali', action:'panel', data:'flower' });
    });

    /* Massive golden glow — core warmth */
    var auraGrad = ctx.createRadialGradient(W*0.5, H*0.4, 0, W*0.5, H*0.4, W*0.55);
    auraGrad.addColorStop(0,'rgba(255,210,60,0.35)'); auraGrad.addColorStop(0.5,'rgba(255,180,40,0.12)'); auraGrad.addColorStop(1,'rgba(255,180,40,0)');
    ctx.fillStyle = auraGrad; ctx.fillRect(0, 0, W, H);

    /* Diyas on altar */
    drawDiya(W*0.3, H*0.575); drawDiya(W*0.5, H*0.575); drawDiya(W*0.7, H*0.575);

    /* Prasanna */
    ctx.fillStyle = '#CC2200'; ctx.font = 'bold '+(H*0.024)+'px serif'; ctx.textAlign='center';
    ctx.fillText('‖ Kuladevatha Prasanna ‖', W*0.5, H*0.08);

    /* Incense smoke particles */
    drawIncenseSmoke(W*0.42, H*0.57); drawIncenseSmoke(W*0.58, H*0.57);
  }

  /* ═══════════════════════════════════════════════════
     DRAWING HELPERS
  ═══════════════════════════════════════════════════ */

  function drawInteriorRoom(wallTop, wallBot, ceil) {
    var floorY = H*0.6;
    /* Ceiling */
    ctx.fillStyle = ceil; ctx.fillRect(0, 0, W, H*0.1);
    /* Beam on ceiling */
    ctx.fillStyle = '#8A5820'; ctx.fillRect(W*0.3, 0, W*0.08, H*0.1); ctx.fillRect(W*0.62, 0, W*0.08, H*0.1);
    /* Back wall */
    var wg = ctx.createLinearGradient(0, H*0.1, 0, floorY);
    wg.addColorStop(0, wallTop); wg.addColorStop(1, wallBot);
    ctx.fillStyle = wg; ctx.fillRect(0, H*0.1, W, floorY-H*0.1);
    /* Side walls */
    ctx.fillStyle = shadeColor(wallTop, -15);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.12,H*0.1); ctx.lineTo(W*0.12,floorY); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shadeColor(wallTop, -25);
    ctx.beginPath(); ctx.moveTo(W,0); ctx.lineTo(W*0.88,H*0.1); ctx.lineTo(W*0.88,floorY); ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
    /* Floor */
    var fg = ctx.createLinearGradient(0,floorY,0,H);
    fg.addColorStop(0,'#C8B888'); fg.addColorStop(1,'#A09060');
    ctx.fillStyle = fg; ctx.fillRect(0, floorY, W, H-floorY);
    /* Floor grid */
    ctx.strokeStyle = 'rgba(100,70,30,0.18)'; ctx.lineWidth = 1;
    for (var i2=1; i2<7; i2++) { ctx.beginPath(); ctx.moveTo(i2*W/7,floorY); ctx.lineTo(i2*W/7,H); ctx.stroke(); }
    for (var j2=1; j2<4; j2++) { ctx.beginPath(); ctx.moveTo(0,floorY+j2*(H-floorY)/4); ctx.lineTo(W,floorY+j2*(H-floorY)/4); ctx.stroke(); }
  }

  function drawDoorway(x, y, w, h, label, prasanna, room) {
    /* Door arch */
    ctx.fillStyle = '#2A1A08'; ctx.fillRect(x, y, w, h);
    /* Arch top */
    ctx.fillStyle = '#2A1A08';
    ctx.beginPath(); ctx.arc(x+w/2, y, w/2, Math.PI, 0); ctx.fill();
    /* Door frame */
    ctx.strokeStyle = '#C89030'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, y+h); ctx.lineTo(x, y); ctx.arc(x+w/2, y, w/2, Math.PI, 0); ctx.lineTo(x+w, y+h); ctx.stroke();
    /* Warm light bleeding through */
    var dg = ctx.createRadialGradient(x+w/2, y+h*0.5, 0, x+w/2, y+h*0.5, w);
    dg.addColorStop(0,'rgba(255,180,60,0.35)'); dg.addColorStop(1,'rgba(255,180,60,0)');
    ctx.fillStyle = dg; ctx.fillRect(x-w, y-h*0.2, w*3, h*1.4);
    /* Label inside doorway */
    ctx.fillStyle = 'rgba(255,220,120,0.9)'; ctx.font = 'bold '+(H*0.018)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText(label, x+w/2, y+h*0.6);
    /* Prasanna above door */
    ctx.fillStyle = '#CC2200'; ctx.font = 'bold '+(H*0.014)+'px serif'; ctx.textAlign='center';
    ctx.fillText('‖ '+prasanna+' ‖', x+w/2, y-8);
    hotspots.push({ x:x, y:y, w:w, h:h, label:label, action:'go', data:room });
  }

  function drawBook3D(x, y, w, h, title, color) {
    /* Shadow */
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x+5, y+5, w, h);
    /* Spine (front face) */
    ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
    /* Highlight edge */
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x, y, 5, h);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x+w-4, y, 4, h);
    /* Top face */
    ctx.fillStyle = shadeColor(color, 20);
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w+6,y-8); ctx.lineTo(x+6,y-8); ctx.closePath(); ctx.fill();
    /* Title on spine */
    ctx.save(); ctx.translate(x+w/2, y+h*0.5);
    ctx.rotate(-Math.PI/2);
    ctx.fillStyle = '#fff'; ctx.font = 'bold '+(w*0.28)+'px sans-serif'; ctx.textAlign='center';
    var words = title.split(' ');
    words.forEach(function(wd, wi) { ctx.fillText(wd, 0, -wi*w*0.32 + (words.length-1)*w*0.16); });
    ctx.restore();
  }

  function drawTulsiPlant(cx, baseY, height) {
    var h2 = height;
    /* Pot */
    ctx.fillStyle = '#B03010';
    ctx.beginPath(); ctx.moveTo(cx-W*0.04, baseY); ctx.lineTo(cx-W*0.03, baseY+H*0.07); ctx.lineTo(cx+W*0.03, baseY+H*0.07); ctx.lineTo(cx+W*0.04, baseY); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8A2008'; ctx.fillRect(cx-W*0.045, baseY-4, W*0.09, 8);
    /* Soil */
    ctx.fillStyle = '#2A1200'; ctx.beginPath(); ctx.ellipse(cx, baseY, W*0.035, 6, 0, 0, Math.PI*2); ctx.fill();
    /* Main trunk */
    ctx.strokeStyle = '#5A3A10'; ctx.lineWidth = H*0.018; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, baseY); ctx.bezierCurveTo(cx+W*0.01, baseY-h2*0.3, cx-W*0.01, baseY-h2*0.6, cx, baseY-h2); ctx.stroke();
    /* Left branch */
    ctx.lineWidth = H*0.01;
    ctx.beginPath(); ctx.moveTo(cx, baseY-h2*0.55); ctx.bezierCurveTo(cx-W*0.06, baseY-h2*0.65, cx-W*0.14, baseY-h2*0.72, cx-W*0.18, baseY-h2*0.78); ctx.stroke();
    /* Right branch */
    ctx.beginPath(); ctx.moveTo(cx, baseY-h2*0.55); ctx.bezierCurveTo(cx+W*0.06, baseY-h2*0.65, cx+W*0.14, baseY-h2*0.72, cx+W*0.18, baseY-h2*0.78); ctx.stroke();
    /* Leaves cluster — main canopy */
    var swayOff = Math.sin(swayT) * W*0.008;
    drawLeafCluster(cx + swayOff, baseY-h2, W*0.07, h2*0.28, '#1A6020', '#2A8030');
    drawLeafCluster(cx-W*0.18 + swayOff*0.5, baseY-h2*0.78, W*0.055, h2*0.22, '#1A5818', '#257025');
    drawLeafCluster(cx+W*0.18 + swayOff*0.5, baseY-h2*0.78, W*0.055, h2*0.22, '#1A5818', '#257025');
    /* Small leaf chips — identity labels */
    var leafLabels = [
      { text:'Tech', x:cx+W*0.19, y:baseY-h2*0.85, c:'#5B4AEE' },
      { text:'Music', x:cx-W*0.2, y:baseY-h2*0.85, c:'#E8A000' },
      { text:'Expression', x:cx, y:baseY-h2*1.08, c:'#38B95A' },
    ];
    leafLabels.forEach(function(l) {
      ctx.fillStyle = l.c + 'DD';
      roundRect(ctx, l.x-W*0.04, l.y-10, W*0.08, 20, 10);
      ctx.fillStyle = '#fff'; ctx.font = 'bold '+(H*0.018)+'px sans-serif'; ctx.textAlign='center';
      ctx.fillText(l.text, l.x, l.y+4);
    });
    /* "Dasa" at roots */
    ctx.fillStyle = '#FFCC00'; roundRect(ctx, cx-W*0.035, baseY-H*0.01, W*0.07, 20, 10);
    ctx.fillStyle = '#1A0A00'; ctx.font = 'bold '+(H*0.018)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('Dasa', cx, baseY+H*0.008);
  }

  function drawLeafCluster(cx, cy, rw, rh, dark, light) {
    ctx.fillStyle = dark; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = light; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.ellipse(cx-rw*0.3, cy-rh*0.2, rw*0.6, rh*0.5, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+rw*0.3, cy-rh*0.15, rw*0.55, rh*0.45, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawDeityPanel(x, y, name, color, icon) {
    var pw = W*0.1, ph = H*0.38;
    /* Frame */
    ctx.fillStyle = '#D4A017'; ctx.fillRect(x-pw/2-6, y-6, pw+12, ph+12);
    ctx.fillStyle = '#8A6010'; ctx.fillRect(x-pw/2-3, y-3, pw+6, ph+6);
    /* Background */
    var bg = ctx.createLinearGradient(x-pw/2, y, x+pw/2, y+ph);
    bg.addColorStop(0, '#FFF5E0'); bg.addColorStop(1, color+'44');
    ctx.fillStyle = bg; ctx.fillRect(x-pw/2, y, pw, ph);
    /* Glow halo */
    var halo = ctx.createRadialGradient(x, y+ph*0.3, 0, x, y+ph*0.3, pw*0.7);
    halo.addColorStop(0, color+'88'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo; ctx.fillRect(x-pw/2, y, pw, ph*0.6);
    /* Icon */
    ctx.font = (H*0.07)+'px serif'; ctx.textAlign='center';
    ctx.fillText(icon, x, y+ph*0.35);
    /* Name */
    ctx.fillStyle = '#4A2800'; ctx.font = 'bold '+(H*0.016)+'px serif'; ctx.textAlign='center';
    ctx.fillText(name, x, y+ph*0.88);
  }

  function drawScroll(x, y, w, h2, title, sub) {
    ctx.fillStyle = '#F5E6C8'; ctx.fillRect(x, y, w, h2);
    ctx.fillStyle = '#7A4A10'; ctx.fillRect(x, y, w, h2*0.15); ctx.fillRect(x, y+h2*0.85, w, h2*0.15);
    /* Shade */
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x+w-4, y, 4, h2);
    ctx.fillStyle = '#4A2800'; ctx.font = 'bold '+(h2*0.2)+'px serif'; ctx.textAlign='center';
    wrapTextC(ctx, title, x+w/2, y+h2*0.48, w-8, h2*0.22);
    if (sub) { ctx.fillStyle='#6A4820'; ctx.font=(h2*0.15)+'px sans-serif'; ctx.fillText(sub, x+w/2, y+h2*0.75); }
  }

  function drawTabla(x, y) {
    /* Bayan (large drum) */
    ctx.fillStyle = '#2A1208'; ctx.beginPath(); ctx.ellipse(x, y, W*0.062, H*0.055, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4A2210'; ctx.beginPath(); ctx.ellipse(x, y-H*0.05, W*0.062, H*0.018, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#8B5E30'; ctx.beginPath(); ctx.ellipse(x, y-H*0.05, W*0.055, H*0.014, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.ellipse(x, y-H*0.05, W*0.034, H*0.009, 0, 0, Math.PI*2); ctx.fill();
    /* Dayan (small drum) */
    var dx = x+W*0.16;
    ctx.fillStyle = '#5A2E0A'; ctx.beginPath(); ctx.ellipse(dx, y+H*0.01, W*0.048, H*0.045, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#7A4A20'; ctx.beginPath(); ctx.ellipse(dx, y-H*0.04, W*0.048, H*0.015, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#D4B896'; ctx.beginPath(); ctx.ellipse(dx, y-H*0.04, W*0.042, H*0.011, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.ellipse(dx, y-H*0.04, W*0.022, H*0.006, 0, 0, Math.PI*2); ctx.fill();
    /* Straps */
    ctx.strokeStyle = '#C89050'; ctx.lineWidth = 3;
    for (var si=0; si<6; si++) { var a=si*Math.PI/3; ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*W*0.062, y+Math.sin(a)*H*0.055); ctx.lineTo(x+Math.cos(a)*W*0.056, y-H*0.03+Math.sin(a)*H*0.015); ctx.stroke(); }
  }

  function drawHarmonium(x, y) {
    ctx.fillStyle = '#8B3A08'; ctx.fillRect(x, y-H*0.12, W*0.18, H*0.12);
    ctx.fillStyle = '#6A2A04'; ctx.fillRect(x, y-H*0.12, W*0.18, 6);
    /* Keys */
    ctx.fillStyle = '#F5F0E8';
    for (var ki=0; ki<10; ki++) { ctx.fillRect(x+4+ki*W*0.016, y-H*0.07, W*0.014, H*0.06); ctx.strokeStyle='#CCC'; ctx.lineWidth=0.5; ctx.strokeRect(x+4+ki*W*0.016, y-H*0.07, W*0.014, H*0.06); }
    /* Black keys */
    ctx.fillStyle = '#1A1A1A';
    [1,2,4,5,6].forEach(function(k) { ctx.fillRect(x+4+k*W*0.016+W*0.008, y-H*0.07, W*0.009, H*0.038); });
    /* Bellows */
    ctx.fillStyle = '#CC0000'; ctx.fillRect(x-W*0.04, y-H*0.1, W*0.04, H*0.08);
    for (var bi=0; bi<5; bi++) { ctx.strokeStyle='#880000'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x-W*0.04, y-H*0.1+bi*H*0.016); ctx.lineTo(x, y-H*0.1+bi*H*0.016); ctx.stroke(); }
  }

  function drawMic(x, y) {
    /* Stand */
    ctx.strokeStyle = '#888888'; ctx.lineWidth = W*0.008;
    ctx.beginPath(); ctx.moveTo(x, H*0.62); ctx.lineTo(x, y); ctx.stroke();
    /* Mic head */
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath(); ctx.ellipse(x, y, W*0.025, H*0.065, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#444';
    ctx.beginPath(); ctx.ellipse(x, y, W*0.022, H*0.058, 0, 0, Math.PI*2); ctx.fill();
    /* Mesh */
    ctx.strokeStyle = '#666'; ctx.lineWidth = 1;
    for (var m2i=0; m2i<5; m2i++) { ctx.beginPath(); ctx.moveTo(x-W*0.02, y-H*0.04+m2i*H*0.02); ctx.lineTo(x+W*0.02, y-H*0.04+m2i*H*0.02); ctx.stroke(); }
  }

  function drawPot(x, y) {
    ctx.fillStyle = '#8A4020';
    ctx.beginPath(); ctx.moveTo(x-14, y); ctx.bezierCurveTo(x-18, y+20, x-14, y+35, x-10, y+40); ctx.lineTo(x+10, y+40); ctx.bezierCurveTo(x+14, y+35, x+18, y+20, x+14, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#AA5828'; ctx.beginPath(); ctx.ellipse(x, y, 15, 5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#6A2810'; ctx.beginPath(); ctx.ellipse(x, y+38, 11, 4, 0, 0, Math.PI*2); ctx.fill();
  }

  function drawJar(x, y, label, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x-20, y); ctx.bezierCurveTo(x-22, y+30, x-18, y+50, x-14, y+58); ctx.lineTo(x+14, y+58); ctx.bezierCurveTo(x+18, y+50, x+22, y+30, x+20, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(x, y, 20, 6, 0, 0, Math.PI*2); ctx.fill();
    /* Label */
    ctx.fillStyle = '#fff'; ctx.font = 'bold '+(H*0.016)+'px sans-serif'; ctx.textAlign='center';
    wrapTextC(ctx, label, x, y+H*0.04, 44, H*0.018);
    /* Lid */
    ctx.fillStyle = shadeColor(color, -30); ctx.beginPath(); ctx.ellipse(x, y, 21, 7, 0, Math.PI, 0); ctx.fill();
  }

  function drawFlower(x, y, color) {
    for (var p2=0; p2<5; p2++) {
      var a2 = (p2/5)*Math.PI*2;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(x+Math.cos(a2)*10, y+Math.sin(a2)*10, 7, 5, a2, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = '#FFDD00'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
  }

  function drawDiya(x, y) {
    ctx.fillStyle = '#C07040';
    ctx.beginPath(); ctx.moveTo(x-12, y); ctx.bezierCurveTo(x-14, y+10, x-10, y+16, x, y+16); ctx.bezierCurveTo(x+10, y+16, x+14, y+10, x+12, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8A4820'; ctx.beginPath(); ctx.ellipse(x, y, 12, 5, 0, 0, Math.PI*2); ctx.fill();
    /* Flame */
    var flameGrad = ctx.createRadialGradient(x, y-10, 0, x, y-10, 14);
    flameGrad.addColorStop(0, '#FFFF80'); flameGrad.addColorStop(0.4, '#FF9900'); flameGrad.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath(); ctx.moveTo(x, y-3); ctx.bezierCurveTo(x-5, y-10, x-3, y-18, x, y-20); ctx.bezierCurveTo(x+3, y-18, x+5, y-10, x, y-3); ctx.fill();
  }

  function drawQuoteBoard(x, y) {
    var bw = W*0.2, bh = H*0.35;
    ctx.fillStyle = '#E8D8A0'; ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = '#7A4A10'; ctx.lineWidth = 5; ctx.strokeRect(x+3, y+3, bw-6, bh-6);
    ctx.fillStyle = '#4A2800'; ctx.font = 'italic '+(H*0.018)+'px serif'; ctx.textAlign='center';
    wrapTextC(ctx, 'क्षणशः कणशश्चैव विद्यामर्थं च साधयेत्', x+bw/2, y+H*0.07, bw-16, H*0.022);
    ctx.font = (H*0.014)+'px sans-serif';
    wrapTextC(ctx, 'Gain knowledge moment by moment.', x+bw/2, y+H*0.18, bw-16, H*0.018);
    ctx.fillStyle = '#7A4A10'; ctx.font = 'italic '+(H*0.014)+'px serif';
    ctx.fillText('— Sanskrit Subhashita', x+bw/2, y+H*0.26);
    ctx.fillStyle = '#5A3A10'; ctx.font = (H*0.013)+'px sans-serif';
    wrapTextC(ctx, 'Researcher · Tabla · Founder', x+bw/2, y+H*0.3, bw-16, H*0.016);
  }

  function drawTree(x, y, scale) {
    ctx.fillStyle = '#5C3010'; ctx.fillRect(x-5*scale, y, 10*scale, 50*scale);
    ctx.fillStyle = '#2A5E20'; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(x, y-20*scale, 28*scale, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3A7030'; ctx.globalAlpha = 0.75;
    ctx.beginPath(); ctx.arc(x-14*scale, y-30*scale, 20*scale, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+14*scale, y-25*scale, 18*scale, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawCurtain(x, y, w) {
    var cGrad = ctx.createLinearGradient(x, y, x+w, y);
    cGrad.addColorStop(0, '#8B1A10CC'); cGrad.addColorStop(0.5, '#6B0A08AA'); cGrad.addColorStop(1, '#8B1A10CC');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    /* Wavy curtain edge */
    var waveH = H*0.7;
    ctx.moveTo(x, y);
    for (var ci=0; ci<=8; ci++) {
      var cy2 = y + ci*(waveH/8);
      var cx2 = x + (ci%2===0 ? 0 : w*0.85);
      ctx.lineTo(cx2, cy2);
    }
    ctx.lineTo(x+w, y+waveH); ctx.lineTo(x+w, y); ctx.closePath(); ctx.fill();
    /* Gold trim */
    ctx.strokeStyle = '#D4A017CC'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x+w-2, y);
    for (var ci2=0; ci2<=8; ci2++) {
      var cy3 = y + ci2*(waveH/8);
      var cx3 = x + (ci2%2===0 ? 0 : w*0.85);
      ctx.lineTo(cx3+w-2, cy3);
    }
    ctx.stroke();
  }

  function drawArrowBtn(x, y, label) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#FFE080'; ctx.font = 'bold '+(H*0.032)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText(label, x, y + H*0.012);
  }

  function drawIncenseSmoke(x, y) {
    for (var si=0; si<6; si++) {
      var sy2 = y - si*H*0.04 - (swayT * H*0.008) % (H*0.3);
      var sa = (Math.sin(swayT + si) * W*0.015);
      ctx.globalAlpha = 0.12 + (6-si)*0.04;
      ctx.fillStyle = '#E8D8B0';
      ctx.beginPath(); ctx.ellipse(x + sa, sy2, W*0.008+si*2, H*0.012, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawParticles() {
    if (currentRoom !== 'temple' && currentRoom !== 'aangan') return;
    particles.forEach(function(p) {
      var a = 1 - p.life/p.maxLife;
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = '#FFCC44';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawHoverLabel() {
    if (labelFade <= 0 || !hoveredSpot) return;
    var lx = hoveredSpot.x + hoveredSpot.w/2, ly = hoveredSpot.y - 14;
    var text = hoveredSpot.label;
    ctx.font = 'bold '+(H*0.018)+'px sans-serif';
    var tw = ctx.measureText(text).width + 24;
    ctx.globalAlpha = labelFade;
    ctx.fillStyle = 'rgba(10,8,6,0.88)';
    roundRect(ctx, lx - tw/2, ly - H*0.028, tw, H*0.034, H*0.017);
    ctx.fillStyle = '#FFE080';
    ctx.textAlign = 'center'; ctx.fillText(text, lx, ly - H*0.006);
    ctx.globalAlpha = 1;
  }

  /* ── Utility ── */
  function roundRect(ctx2, x, y, w, h2, r) {
    ctx2.beginPath();
    ctx2.moveTo(x+r,y); ctx2.lineTo(x+w-r,y); ctx2.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx2.lineTo(x+w,y+h2-r); ctx2.quadraticCurveTo(x+w,y+h2,x+w-r,y+h2);
    ctx2.lineTo(x+r,y+h2); ctx2.quadraticCurveTo(x,y+h2,x,y+h2-r);
    ctx2.lineTo(x,y+r); ctx2.quadraticCurveTo(x,y,x+r,y); ctx2.closePath();
    ctx2.fill();
  }
  function wrapTextC(ctx2, text, x, y, maxW, lh) {
    var words = text.split(' '), line = '', lines = [];
    words.forEach(function(w2) {
      var test = line + w2 + ' ';
      if (ctx2.measureText(test).width > maxW && line) { lines.push(line.trim()); line = w2+' '; } else line = test;
    });
    lines.push(line.trim());
    lines.forEach(function(l2, i2) { ctx2.fillText(l2, x, y + i2*lh); });
  }
  function shadeColor(hex, pct) {
    var n = parseInt(hex.replace('#',''), 16), r = Math.min(255,Math.max(0, ((n>>16)&255)+pct)), g = Math.min(255,Math.max(0, ((n>>8)&255)+pct)), b = Math.min(255,Math.max(0, (n&255)+pct));
    return '#' + ((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
  }

  /* ── Interaction ── */
  function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top)  * (H / rect.height);
    var found = null;
    for (var i = hotspots.length-1; i >= 0; i--) {
      var h2 = hotspots[i];
      if (mx >= h2.x && mx <= h2.x+h2.w && my >= h2.y && my <= h2.y+h2.h) { found = h2; break; }
    }
    hoveredSpot = found;
    canvas.style.cursor = found ? 'pointer' : 'default';
  }

  function onClick(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top)  * (H / rect.height);
    for (var i = hotspots.length-1; i >= 0; i--) {
      var h2 = hotspots[i];
      if (mx >= h2.x && mx <= h2.x+h2.w && my >= h2.y && my <= h2.y+h2.h) {
        handleAction(h2.action, h2.data); return;
      }
    }
  }

  function handleAction(action, data) {
    switch (action) {
      case 'go':       navigateTo(data); break;
      case 'blog':     if (data.url === 'balcony.html') { window.location.href='balcony.html'; } else { showPanel('<h2>'+data.title+'</h2><p><a href="'+data.url+'" target="_blank" class="panel-link">Read post →</a></p>'); } break;
      case 'panel':    showPanel(getPanelContent(data)); break;
      case 'bell':     showContactModal(); break;
      case 'social':   window.open(data, '_blank'); break;
      case 'resume':   showResumeAnim(); break;
      case 'info':     break;
      case 'ach-prev': achIdx = (achIdx - 1 + ACH_IMGS.length) % ACH_IMGS.length; break;
      case 'ach-next': achIdx = (achIdx + 1) % ACH_IMGS.length; break;
    }
  }

  function showResumeAnim() {
    /* Orange flash overlay then open PDF */
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(255,100,0,0.35);z-index:9999;pointer-events:none;transition:opacity 0.6s';
    document.body.appendChild(overlay);
    setTimeout(function() { overlay.style.opacity='0'; setTimeout(function(){ overlay.remove(); window.open('master_resume.pdf','_blank'); }, 600); }, 200);
  }

  /* ── Navigation ── */
  function navigateTo(id) {
    if (!ROOMS[id] || transitioning) return;
    transitioning = true; transTarget = id; transDir = 1; transAlpha = 0;
  }

  function updateHUD() {
    var rd = ROOMS[currentRoom]; if (!rd) return;
    var ne = document.getElementById('hud-room-name'); if (ne) ne.textContent = rd.label;
    setHudBtn('hud-left-btn',  rd.left,  '← ');
    setHudBtn('hud-right-btn', rd.right, '',  ' →');
    var bb = document.getElementById('hud-back-btn');
    if (bb) {
      bb.style.display = rd.back ? 'inline-flex' : 'none';
      if (rd.back) { bb.textContent = '↩ '+ROOMS[rd.back].label; bb.onclick = function() { navigateTo(rd.back); }; }
    }
  }
  function setHudBtn(id, target, pre, suf) {
    var btn = document.getElementById(id); if (!btn) return;
    if (target) { btn.textContent = (pre||'')+ROOMS[target].label+(suf||''); btn.style.visibility='visible'; btn.onclick = function(){ navigateTo(target); }; }
    else btn.style.visibility = 'hidden';
  }

  /* ── Panels & Modal ── */
  function showPanel(html) {
    var p = document.getElementById('temple-panel'); if (!p) return;
    p.innerHTML = '<button class="panel-close" onclick="window.templeClosePanel()">✕</button><div class="panel-body">'+html+'</div>';
    p.classList.add('panel-open');
  }
  function closePanel() { var p=document.getElementById('temple-panel'); if(p) p.classList.remove('panel-open'); }
  function showContactModal() { var m=document.getElementById('house-contact-modal'); if(!m) return; m.style.display='flex'; m.style.opacity='0'; requestAnimationFrame(function(){ m.style.transition='opacity 0.3s'; m.style.opacity='1'; }); }

  /* ── Day/Night ── */
  function toggleDayNight() {
    isDay = !isDay;
    var btn = document.getElementById('house-light-btn');
    if (btn) btn.textContent = isDay ? '🌙' : '☀️';
  }

  /* ── Map (top-down text layout) ── */
  function toggleMapView() {
    showPanel('<div style="padding:1.5rem"><h2 style="margin-bottom:1rem">Home Map</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">' +
      Object.keys(ROOMS).map(function(k){ return '<button onclick="window.templeClosePanel();setTimeout(function(){window.templeGoRoom(\''+k+'\')},100)" style="padding:0.6rem 1rem;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);border-radius:8px;cursor:pointer;color:var(--text,#fff)">'+ROOMS[k].label+'</button>'; }).join('') +
      '</div></div>');
  }

  window.templeGoRoom = function(id) { navigateTo(id); };

  /* ── Normal mode switch ── */
  function switchNormal() {
    var me=document.getElementById('mentos-mode'), nm=document.getElementById('normal-mode');
    if(!me||!nm) return;
    me.style.transition='opacity 0.5s'; me.style.opacity='0';
    setTimeout(function(){ me.style.display='none'; nm.style.display='block'; nm.style.opacity='0'; nm.style.transition='opacity 0.5s'; requestAnimationFrame(function(){ nm.style.opacity='1'; }); }, 500);
  }

  /* ── HUD binding ── */
  function bindHUD() {
    var mb=document.getElementById('house-map-btn');    if(mb) mb.onclick = toggleMapView;
    var lb=document.getElementById('house-light-btn');  if(lb) lb.onclick = toggleDayNight;
    var nb=document.getElementById('house-normal-btn'); if(nb) nb.onclick = switchNormal;
  }

  /* ── Panel content ── */
  function getPanelContent(key) {
    var p = {
      quote:       '<div class="panel-quote"><p class="panel-shloka">क्षणशः कणशश्चैव विद्यामर्थं च साधयेत्</p><p class="panel-translation">Knowledge should be gained moment by moment.</p><p class="panel-source">— Sanskrit Subhashita</p><hr style="border-color:rgba(255,255,255,0.08);margin:1rem 0"><p>3rd year B.Tech CSE (AI-ML) · RV University · Bengaluru<br>Researcher · Tabla artist · Startup founder.</p></div>',
      tulsi:       '<h2>Identity Map</h2><p>This tulsi plant maps who I am. <strong>Dasa</strong> — servant, seeker — is the root. <em>Joy of Learning</em> is the thread through everything.</p><div class="panel-tags"><span style="background:#5B4AEE22;border:1px solid #5B4AEE">Tech</span><span style="background:#E8A00022;border:1px solid #E8A000">Music</span><span style="background:#38B95A22;border:1px solid #38B95A">Expression</span></div>',
      deity:       '<div style="text-align:center;padding:1.5rem"><div style="font-size:3rem">🙏</div><h2>Pushpanjali</h2><p>Offer flowers to the deity. <em>Saraswathi · Krishna · Ganesha · Lakshmi · Hanuman · Shiva</em></p></div>',
      flower:      '<div style="text-align:center;padding:2.5rem"><div style="font-size:3.5rem">🌸</div><p style="margin-top:1rem">Pushpanjali offered.</p><p style="font-size:0.85rem;color:var(--text-3);margin-top:0.4rem">May your work be blessed.</p></div>',
      'study-experience': '<h2>Experience</h2><ul class="panel-list"><li><strong>Goodwinsun</strong> — Founder & CEO, AI startup</li><li>FKCCI Manthan 2025 Finalist</li><li>13+ internship roles across AI, research, and development</li></ul><a href="swroom.html" class="panel-link" target="_blank">Full details →</a>',
      'study-research':   '<h2>Research</h2><ul class="panel-list"><li><strong>Best Paper Award</strong> — ICAICS 2025, Springer</li><li>3 research publications — AI & Quantum Computing</li><li>Patent filings in AI/ML</li></ul><a href="swroom.html" class="panel-link" target="_blank">Read papers →</a>',
      'study-projects':   '<h2>Projects</h2><ul class="panel-list"><li>AI-driven applications deployed to production</li><li>Web dev — dhwanimuzics.com and more</li><li>Startup product at Goodwinsun</li></ul><a href="swroom.html" class="panel-link" target="_blank">Explore →</a>',
      'study-skills':     '<h2>Skills</h2><div class="panel-tags"><span>Python</span><span>JavaScript</span><span>TensorFlow</span><span>PyTorch</span><span>AWS</span><span>React</span><span>Node.js</span><span>Qiskit</span></div><a href="swroom.html" class="panel-link" target="_blank">Full skills →</a>',
      'study-education':  '<h2>Education</h2><ul class="panel-list"><li><strong>B.Tech CSE (AI-ML)</strong> · RV University · CGPA 8.76</li><li>600+ GitHub contributions</li></ul><a href="swroom.html" class="panel-link" target="_blank">Details →</a>',
      'kala-tabla':       '<h2>Tabla & Harmonium</h2><p>Hindustani classical percussionist. Stage performances across Karnataka.</p><a href="persaudi.html" class="panel-link" target="_blank">Listen →</a>',
      'kala-vocal':       '<h2>Hindustani Vocal</h2><p>Classical vocal, harmonium-accompanied.</p><a href="persaudi.html" class="panel-link" target="_blank">More →</a>',
      'kala-poems':       '<h2>Halgannada Poetry</h2><p>Original poems in Halgannada — classical Kannada poetic tradition.</p><a href="persaudi.html" class="panel-link" target="_blank">Read poems →</a>',
      'kala-author':      '<h2>Published Author</h2><p><strong>The Adventures of Detective Sujay</strong> — published fiction.</p><a href="persaudi.html" class="panel-link" target="_blank">About the book →</a>',
      'jagali':           '<h2>Jagali</h2><p>The front platform of a Karnataka home — where guests are welcomed, stories told, bells ring.</p>',
    };
    if (key && key.startsWith('ach-')) {
      var idx2 = parseInt(key.replace('ach-',''));
      return '<h2>Achievement</h2><p style="margin-top:0.5rem">'+ACH_CAPS[idx2]+'</p><a href="svkachievements.html" class="panel-link" target="_blank">All achievements →</a>';
    }
    return p[key] || '<p>Coming soon.</p>';
  }

  /* ── Exports ── */
  window.templeClosePanel      = closePanel;
  window.closeContactModal     = function() { var m=document.getElementById('house-contact-modal'); if(!m) return; m.style.opacity='0'; setTimeout(function(){ m.style.display='none'; },320); };
  window.templeToggleMap       = toggleMapView;
  window.templeToggleLightMode = toggleDayNight;
  window.switchToNormalMode    = switchNormal;
  window.achNext               = function() { achIdx=(achIdx+1)%ACH_IMGS.length; };
  window.achPrev               = function() { achIdx=(achIdx-1+ACH_IMGS.length)%ACH_IMGS.length; };

  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('house-canvas')) init();
  });

})();
