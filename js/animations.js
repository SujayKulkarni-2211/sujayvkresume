/* animations.js — Intersection Observer reveal + particle hero canvas */
(function () {
  'use strict';

  /* ── Hero particle canvas ── */
  function initParticleCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];
    const COUNT = 80;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Particle() {
      this.reset = function () {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r  = Math.random() * 1.8 + 0.5;
        this.a  = Math.random() * 0.5 + 0.1;
      };
      this.reset();
    }

    for (let i = 0; i < COUNT; i++) {
      particles.push(new Particle());
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) p.reset();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.a})`;
        ctx.fill();
      });

      /* Draw connections */
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  /* ── Typed.js hero text ── */
  function initHeroTyped() {
    const el = document.getElementById('hero-typed');
    if (!el || typeof Typed === 'undefined') return;

    new Typed('#hero-typed', {
      strings: [
        'AI Researcher',
        'Quantum Researcher',
        'Tabla Artist',
        'Startup Founder',
        'Halgannada Poet',
        'Learner',
      ],
      typeSpeed:    50,
      backSpeed:    30,
      backDelay:    1800,
      startDelay:   400,
      loop:         true,
      showCursor:   true,
      cursorChar:   '|',
    });
  }

  /* ── Animated metric counters (research page) ── */
  function initCounters() {
    const counters = document.querySelectorAll('.metric-value[data-value]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el  = entry.target;
        const raw = el.dataset.value;          /* e.g. "26.7%" or "178.6%" */
        const num = parseFloat(raw);
        const suffix = raw.replace(/[\d.]/g, '');
        const dur  = 1400;
        const step = 16;
        const steps = dur / step;
        let current = 0;
        const inc = num / steps;

        const timer = setInterval(() => {
          current += inc;
          if (current >= num) { current = num; clearInterval(timer); }
          el.textContent = current.toFixed(1) + suffix;
        }, step);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => obs.observe(el));
  }

  document.addEventListener('DOMContentLoaded', function () {
    initParticleCanvas();
    initHeroTyped();
    initCounters();
  });
})();
