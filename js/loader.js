/* loader.js — House-silhouette build animation, then fade to 3D scene */
(function () {
  'use strict';

  /*
   * Animation timeline (all CSS-driven except final fade):
   *   0.1s  — compound walls appear
   *   0.1s  — foundation draws
   *   0.7s  — left wall draws
   *   0.9s  — right wall draws
   *   1.35s — left roof slope draws
   *   1.55s — right roof slope draws
   *   2.0s  — ridge cap
   *   2.25s — door arc draws (opens)
   *   2.8s  — temple glow radiates, golden spread overlay
   *   3.3s  — sun rises (day) / moon rises (night)
   *   4.0s  — loader begins to exit (JS)
   *   4.7s  — loader fully hidden, 3D scene visible
   */

  var TOTAL_MS = 4000;
  var FADE_MS  = 700;

  document.addEventListener('DOMContentLoaded', function () {
    var loader = document.getElementById('loader');
    if (!loader) return;

    document.body.style.overflow = 'hidden';

    /* Night mode: hide sun, show moon instead */
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      var sun  = loader.querySelector('.lh-sun');
      var moon = loader.querySelector('.lh-moon');
      if (sun)  sun.style.display  = 'none';
      if (moon) moon.classList.add('visible');
    }

    /* Exit after house animation completes */
    setTimeout(function () {
      loader.classList.add('exit');
      setTimeout(function () {
        loader.style.display = 'none';
        document.body.style.overflow = '';
      }, FADE_MS);
    }, TOTAL_MS);
  });
})();
