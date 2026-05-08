/* achievement.js — Achievement Loka Tour section */
'use strict';

const CosmosAchievement = (() => {

  let _sliderInterval = null;

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
    { img: 'images/karujayasooraward.jpeg', title: 'Award from Former Speaker of Sri Lanka', caption: 'Received by Deshabandu Karu Jayasuriya for tabla solo performance' },
    { img: 'images/perfostagesl.jpeg',      title: 'Performance in Sri Lanka',   caption: 'Indo-Sri Lanka cultural delegation — a great experience' },
    { img: 'images/slaward.jpeg',           title: 'Award for Performance',      caption: 'Recognition and support from the Sri Lanka program' },
    { img: 'images/saiabhiaward.jpeg',      title: 'Memento — Balamuri Sidhi Vinayaka Temple', caption: 'Thank you Sai Abhiram for the opportunity' },
  ];

  function _buildSlider(root) {
    let current = 0;
    const imgEl    = root.querySelector('.ach-slide-img');
    const titleEl  = root.querySelector('.ach-slide-title');
    const captionEl= root.querySelector('.ach-slide-caption');
    const dotsEl   = root.querySelectorAll('.ach-dot');

    function go(n) {
      current = (n + _slides.length) % _slides.length;
      imgEl.style.opacity = '0';
      setTimeout(() => {
        imgEl.src        = _slides[current].img;
        titleEl.textContent   = _slides[current].title;
        captionEl.textContent = _slides[current].caption;
        dotsEl.forEach((d, i) => d.classList.toggle('ach-dot-active', i === current));
        imgEl.style.opacity = '1';
      }, 250);
    }

    root.querySelector('.ach-prev').addEventListener('click', () => { go(current - 1); resetTimer(); });
    root.querySelector('.ach-next').addEventListener('click', () => { go(current + 1); resetTimer(); });
    dotsEl.forEach((d, i) => d.addEventListener('click', () => { go(i); resetTimer(); }));

    function resetTimer() {
      clearInterval(_sliderInterval);
      _sliderInterval = setInterval(() => go(current + 1), 3800);
    }
    go(0);
    resetTimer();
  }

  function build(container) {
    container.innerHTML = `
<div class="ach-root">
  <div class="ach-header">
    <span class="ach-title">🏆 Achievement Loka Tour</span>
    <button class="ach-back-btn" onclick="Cosmossections.returnToOrbit()">← Return to Orbit</button>
  </div>

  <div class="ach-layout">

    <!-- LEFT: Image Slider -->
    <div class="ach-slider-wrap">
      <img class="ach-slide-img" src="images/webdevwin2cropped.jpeg" alt="Achievement">
      <div class="ach-slide-caption-wrap">
        <div class="ach-slide-title">This Website led me here!</div>
        <div class="ach-slide-caption">Coded overnight for Intro to Web Dev Hackathon at RV University</div>
      </div>
      <div class="ach-slider-controls">
        <button class="ach-prev">‹</button>
        <div class="ach-dots">
          ${_slides.map((_, i) => `<span class="ach-dot${i===0?' ach-dot-active':''}"></span>`).join('')}
        </div>
        <button class="ach-next">›</button>
      </div>
    </div>

    <!-- RIGHT: 3 text panels -->
    <div class="ach-panels">

      <div class="ach-panel">
        <div class="ach-panel-label">KEY ACHIEVEMENTS</div>
        <ul class="ach-list">
          <li>Best Paper Award — ICAICS 2025, Springer (Quantum Entropy Temperature Scaling)</li>
          <li>Patent Filing — TAARA Cybersecurity Framework</li>
          <li>FKCCI Manthan 2025 Finalist — granty</li>
          <li>Karnataka Elevate 2024 Finalist</li>
          <li>Hackathon Winner — waruna project</li>
          <li>Indo-Sri Lanka Cultural Delegate — tabla solo performance</li>
          <li>Sangeeta Prabhakar National Award (Tabla)</li>
          <li>Chamundeshwari National Award</li>
          <li>Global Economic Forum Lifetime Member</li>
          <li>Runners Up — Analytica Data Analysis Contest, RV University</li>
          <li>Best Game — Structured Innovation (Nirvana)</li>
          <li>8th Rank — Intercollege Coding Club Programme</li>
        </ul>
      </div>

      <div class="ach-panel">
        <div class="ach-panel-label">ACADEMIC HONOURS</div>
        <ul class="ach-list">
          <li>Performance award in 2nd PU from RV PU College</li>
          <li>Performance award in 10th from Shree Bharathi Vidyalaya</li>
          <li>Performance in 2nd PU Board Exam from Chidambar Seva Samiti Rajajinagar</li>
          <li>Performance in SSLC Boards from Chidambar Seva Samiti Rajajinagar</li>
          <li>Multiple awards for science exhibition experiments</li>
          <li>Poems published in magazine "Pranava" by RV PU College</li>
          <li>Ranked 32nd — Wiz Spell Bee National Level Competition</li>
          <li>Recognized for excellence in tabla, singing, creative writing, story writing, and poetry by various organisations</li>
        </ul>
      </div>

      <div class="ach-panel">
        <div class="ach-panel-label">POSITIONS OF RESPONSIBILITY</div>
        <ul class="ach-list">
          <li>Founder &amp; President — RUDRA (RVU Data Science Club)</li>
          <li>Vice Chairperson — IEEE Student Branch, RV University</li>
          <li>Founder — IDeathon RVU</li>
          <li>Founder &amp; Vice Chair — VYAASA</li>
          <li>CEO &amp; Founder — Goodwinsun</li>
          <li>Nobel Delegate — Model United Nations (MUN), thrice</li>
          <li>Chaired RV MUN 2022</li>
          <li>Organised competitions in public speaking, debates, MUNs and trained participants</li>
          <li>Awards in public speaking contests, debates, and pick-and-speak competitions</li>
        </ul>
      </div>

    </div>
  </div>
</div>
`;
    _buildSlider(container);
  }

  return { build, enter };

})();
