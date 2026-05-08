/* telescope.js — Telescope of Thoughts section */
'use strict';

const CosmosteleSCOPE = (() => {

  function enter() {
    // Slow frequency sweep upward — sine 200→800Hz over 1.5s
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

  function build(container) {
    container.innerHTML = `
<div class="tl-root">
  <div class="tl-header">
    <span class="tl-title">🔭 Telescope of Thoughts</span>
    <button class="tl-back-btn" onclick="Cosmossections.returnToOrbit()">← Return to Orbit</button>
  </div>

  <div class="tl-grid">

    <!-- POSTS ZONE -->
    <div class="tl-zone">
      <div class="tl-zone-label">POSTS</div>

      <div class="tl-card">
        <img class="tl-img" src="https://media.licdn.com/dms/image/D5622AQFeifT7ZwBgyw/feedshare-shrink_800/0/1703356307709?e=1707350400&v=beta&t=Gh_ac4RtN6SBkdvGNs5ZrmlZ2nxHzl2zCW26J7MrsWw" alt="KANTI Circuitrix post">
        <div class="tl-card-body">
          <div class="tl-card-text">Presented the flip-flop project KANTI at RV University's Circuitrix event with team BHASWAT — gratitude to teachers like Chandramouleeswaran Sankaran for enriching basic electronics experience and acknowledging the collaborative effort in activity-based learning.</div>
          <a class="tl-link" href="https://linkedin.com/embed/feed/update/urn:li:share:7144394180490932225" target="_blank">See Post ↗</a>
        </div>
      </div>

      <div class="tl-card">
        <img class="tl-img" src="https://media.licdn.com/dms/image/D5622AQGxNfl6y-5qhA/feedshare-shrink_1280/0/1703353877907?e=1707350400&v=beta&t=5REGISwDD4PZ3Jg6-5EylFJOJxzVPOUuqpkIIMAPHl0" alt="Sri Lanka delegate post">
        <div class="tl-card-body">
          <div class="tl-card-text">Met the honourable former speaker of parliament of Sri Lanka, Deshabandu Karu Jayasuriya — thank you sir for your welcoming interaction and encouraging words!</div>
          <a class="tl-link" href="https://www.linkedin.com/posts/sujay-kulkarni-51391b286_thank-you-honourable-deshabandu-karu-jayasuriya-activity-7144385314168446976-w9uz?utm_source=share&utm_medium=member_desktop" target="_blank">Watch Introduction ↗</a>
        </div>
      </div>

      <div class="tl-card">
        <img class="tl-img" src="https://media.licdn.com/dms/image/D5622AQF8mm44dL8J7A/feedshare-shrink_2048_1536/0/1703350863704?e=1707350400&v=beta&t=6la-l5ewVCu8R6aeypdWPe3hHPly59nSntIvuhLPbGI" alt="Classical music show post">
        <div class="tl-card-body">
          <div class="tl-card-text">Gratitude to RV University for hosting a classical music show featuring Abhishek Raghuram, Thiruvarur Bhaktavatsalam, and Ghatam Giridhar Udupa in collaboration with SpicMacay APAC.</div>
          <a class="tl-link" href="https://www.linkedin.com/posts/sujay-kulkarni-51391b286_thank-you-rv-university-for-organising-the-activity-7144371344359501824-DjFG?utm_source=share&utm_medium=member_desktop" target="_blank">See Post ↗</a>
        </div>
      </div>

      <div class="tl-card">
        <img class="tl-img" src="https://media.licdn.com/dms/image/D5622AQE0EtLZ2VNPCQ/feedshare-shrink_800/0/1703354593572?e=1707350400&v=beta&t=L4K5Hb3Oe87wdmvs-Ou9LVLHrCvCmWkV3oL76XmOWJk" alt="Navarathri concert post">
        <div class="tl-card-body">
          <div class="tl-card-text">A wonderful concert featuring maestros Raghavendra (mridangist) and Govinda Swamy (violinist), accompanied by Anuj Srinivas K — on the third day of Navarathri in the presence of Sri Balamuri Vinayaka.</div>
          <a class="tl-link" href="https://www.linkedin.com/posts/sujay-kulkarni-51391b286_wonderful-concert-with-the-maestros-raghavendra-activity-7144386991655202816-xAfm?utm_source=share&utm_medium=member_desktop" target="_blank">See Post ↗</a>
        </div>
      </div>

    </div>

    <!-- BLOGS ZONE -->
    <div class="tl-zone">
      <div class="tl-zone-label">BLOGS</div>

      <div class="tl-card tl-blog-card">
        <img class="tl-img" src="images/laptop1.jpeg" alt="Web Development Blog">
        <div class="tl-card-body">
          <div class="tl-card-title">The Transformative Power of Web Development</div>
          <div class="tl-card-text">Thoughts on how web development transforms ideas into accessible, living experiences — and what that means for builders like us.</div>
          <a class="tl-link" href="webdevtransform.html" target="_blank">Read Blog ↗</a>
        </div>
      </div>

      <div class="tl-card tl-blog-card">
        <img class="tl-img" src="saraswathi.jpeg" alt="Saraswathi Puja Blog">
        <div class="tl-card-body">
          <div class="tl-card-title">The Enlightening Influence of Daily Saraswathi Puja</div>
          <div class="tl-card-text">Nurturing Mind, Body, and Spirit — on the Vedantic significance of daily Saraswathi Puja and its effect on creativity and learning.</div>
          <a class="tl-link" href="saraswatipoojablog.html" target="_blank">Read Blog ↗</a>
        </div>
      </div>

    </div>

  </div>
</div>
`;
  }

  return { build, enter };

})();
