/* auditorium.js — Milky Way Auditorium section */
'use strict';

const CosmosAuditorium = (() => {

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
    container.innerHTML = `
<div class="au-root">
  <div class="au-header">
    <span class="au-title">🎭 Milky Way Auditorium</span>
    <button class="au-back-btn" onclick="Cosmossections.returnToOrbit()">← Return to Orbit</button>
  </div>

  <div class="au-grid">

    <!-- POETRY SYSTEM -->
    <div class="au-panel">
      <div class="au-panel-label">POETRY SYSTEM</div>

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

    <!-- TABLA & MUSIC SYSTEM -->
    <div class="au-panel">
      <div class="au-panel-label">TABLA &amp; MUSIC SYSTEM</div>

      <div class="au-card-desc au-music-bio">
        International Tabla Artist · Intermediate Hindustani Vocalist · Harmonium · Music Composer.<br>
        Recipient of Sangeeta Prabhakar National Award and Chamundeshwari National Award.
      </div>

      <div class="au-video-wrap">
        <div class="au-video-label">Tabla Cover — Alaipayuthey</div>
        <div class="au-video-desc">Tabla cover played with Sai Abhiram (Orig: Dhwani YouTube)</div>
        <div class="au-video-frame">
          <iframe src="https://www.youtube.com/embed/ocED1h7Uc0E" title="Tabla Cover Alaipayuthey"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      </div>

      <div class="au-video-wrap">
        <div class="au-video-label">Shree Saraswathi</div>
        <div class="au-video-desc">Singing and playing tabla for his own composition — Shree Saraswati</div>
        <div class="au-video-frame">
          <iframe src="https://www.youtube.com/embed/dJVO5uHhcsU" title="Shree Saraswathi"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      </div>
    </div>

    <!-- SPEECHES SYSTEM -->
    <div class="au-panel">
      <div class="au-panel-label">SPEECHES SYSTEM</div>

      <div class="au-card">
        <div class="au-card-title">Farewell Speech at RVPU</div>
        <div class="au-card-desc">A poem delivered as a farewell speech — on how a mother bird tells its child that it has gained wings and it is time to fly.</div>
        <a class="au-link" href="https://photos.app.goo.gl/u4hDgDfNpSjpdNd37" target="_blank">Watch Speech ↗</a>
      </div>
    </div>

    <!-- OTHERS -->
    <div class="au-panel">
      <div class="au-panel-label">OTHERS</div>

      <div class="au-card">
        <div class="au-card-title">The Enlightening Influence of Daily Saraswathi Puja</div>
        <div class="au-card-desc">Nurturing Mind, Body, and Spirit — a blog on Vedantic practice and daily ritual.</div>
        <a class="au-link" href="saraswatipoojablog.html" target="_blank">Read Blog ↗</a>
      </div>

      <div class="au-card">
        <div class="au-card-title">VYAASA</div>
        <div class="au-card-desc">Founder &amp; Vice Chair of VYAASA — an organisation rooted in Vedantic philosophy, Sanskrit, and classical literature.</div>
      </div>

      <div class="au-card">
        <div class="au-card-title">Vedantic Philosophy</div>
        <div class="au-card-desc">Deep engagement with Advaita Vedanta, Mahakavyas, Sanskrit literature, and Kannada classical traditions.</div>
      </div>
    </div>

  </div>
</div>
`;
  }

  return { build, enter };

})();
