/* loader.js — Build sequence state machine + UI text */
'use strict';

const CosmosLoader = (() => {
  const BUILD_SPEED = 0.0028;   // progress units per ms

  const STATUS_LABELS = [
    [0.00, 'INITIALISING COSMOS...'],
    [0.08, 'HULL ASSEMBLY...'],
    [0.20, 'COCKPIT DOME FORMING...'],
    [0.34, 'ENGINE PODS IGNITING...'],
    [0.50, 'RIM LIGHTS ACTIVATING...'],
    [0.70, 'ANTENNA CALIBRATING...'],
    [0.86, 'VENTING THRUSTERS...'],
    [0.96, 'SPACECRAFT READY · CLICK TO ENTER'],
  ];

  let progress = 0;
  let started = false;
  let complete = false;
  let startTime = null;
  let lastTime = null;

  let statusEl = null;
  let enterBtn = null;
  let onCompleteCb = null;
  let onEnterCb = null;

  function init(statusElement, enterBtnElement) {
    statusEl = statusElement;
    enterBtn = enterBtnElement;
  }

  function onComplete(cb) { onCompleteCb = cb; }
  function onEnter(cb)    { onEnterCb = cb; }

  function start() {
    started = true;
    startTime = performance.now();
    lastTime = startTime;
  }

  function _getLabel(p) {
    let label = STATUS_LABELS[0][1];
    for (const [threshold, text] of STATUS_LABELS) {
      if (p >= threshold) label = text;
    }
    return label;
  }

  // Called every frame with current timestamp
  function tick(now) {
    if (!started || complete) return;

    const dt = now - lastTime;
    lastTime = now;

    progress = Math.min(progress + BUILD_SPEED * dt, 1.0);

    // Update status text
    if (statusEl) {
      statusEl.textContent = _getLabel(progress);
    }

    // Trigger complete
    if (progress >= 1.0 && !complete) {
      complete = true;
      if (onCompleteCb) onCompleteCb();
      // Show enter button
      if (enterBtn) {
        enterBtn.style.display = 'flex';
        enterBtn.addEventListener('click', _handleEnter, { once: true });
      }
    }

    return progress;
  }

  function _handleEnter() {
    if (onEnterCb) onEnterCb();
    // Hide enter btn
    if (enterBtn) enterBtn.style.display = 'none';
    if (statusEl) statusEl.style.display = 'none';
  }

  function getProgress() { return progress; }
  function isComplete()   { return complete; }

  return { init, start, tick, onComplete, onEnter, getProgress, isComplete };
})();
