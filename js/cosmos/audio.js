/* audio.js — cinematic audio engine using real ambience */
'use strict';

const CosmosAudio = (() => {

  let ctx = null;
  let master = null;
  let muted = false;

  // REAL AUDIO FILES
  let ambientAudio = null;
  let enterAudio = null;
  let warpAudio = null;
  let commsAudio = null;
  let whooshAudio = null;

  function init() {

    if (ctx) return;

    ctx = new (window.AudioContext || window.webkitAudioContext)();

    master = ctx.createGain();
    master.gain.value = 1.0;

    master.connect(ctx.destination);

    // ── AMBIENT LOOP ─────────────────────────────
    ambientAudio = new Audio('audio/space-ambience.mp3');
    ambientAudio.loop = true;
    ambientAudio.volume = 0.34;

    // ── ENTRY SOUND ──────────────────────────────
    enterAudio = new Audio('audio/enter-cinematic.mp3');
    enterAudio.volume = 0.72;

    // ── WARP TRAVEL SOUND ────────────────────────
    warpAudio = new Audio('audio/warp-travel.mp3');
    warpAudio.volume = 0.85;

    // ── COMMS SIGNAL SOUND ───────────────────────
    commsAudio = new Audio('audio/communication-sound.mp3');
    commsAudio.volume = 0.8;

    // ── WHOOSH (achievement flythrough advance) ──
    whooshAudio = new Audio('audio/whoosh.mp3');
    whooshAudio.volume = 0.7;
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  // ── START AMBIENT ─────────────────────────────
  function startAmbient() {

    if (muted || !ambientAudio) return;

    ambientAudio.currentTime = 0;

    ambientAudio.play().catch(err => {
      console.log('Ambient play blocked:', err);
    });
  }

  // ── STOP AMBIENT ──────────────────────────────
  function stopAmbient() {

    if (!ambientAudio) return;

    ambientAudio.pause();
  }

  // ── ENTRY SOUND ───────────────────────────────
  function playEnterHorn() {

    if (muted || !enterAudio) return;

    enterAudio.currentTime = 0;

    enterAudio.play().catch(err => {
      console.log('Enter sound blocked:', err);
    });
  }

  // ── BUILD COMPLETE ────────────────────────────
  function playBuildComplete() {

    if (muted || !ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 220;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(master);

    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  }

  // ── UI CLICK ──────────────────────────────────
  function playClick() {

    if (muted || !ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 140;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(master);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // ── WARP TRAVEL SOUND ────────────────────────
  function playWarp() {
    if (muted || !warpAudio) return;
    warpAudio.currentTime = 0;
    warpAudio.play().catch(err => {
      console.log('Warp sound blocked:', err);
    });
  }

  // ── COMMS SIGNAL ──────────────────────────────
  function playCommsSignal() {
    if (muted || !commsAudio) return;
    commsAudio.currentTime = 0;
    commsAudio.play().catch(err => {
      console.log('Comms sound blocked:', err);
    });
  }

  // ── WHOOSH (flythrough advance) ───────────────
  function playWhoosh() {
    if (muted || !whooshAudio) return;
    whooshAudio.currentTime = 0;
    whooshAudio.play().catch(err => {
      console.log('Whoosh sound blocked:', err);
    });
  }

  // ── MUTE TOGGLE ───────────────────────────────
  function toggleMute() {

    muted = !muted;

    if (ambientAudio) {
      ambientAudio.muted = muted;
    }

    if (enterAudio) {
      enterAudio.muted = muted;
    }

    if (warpAudio) {
      warpAudio.muted = muted;
    }

    if (commsAudio) {
      commsAudio.muted = muted;
    }

    if (whooshAudio) {
      whooshAudio.muted = muted;
    }

    return muted;
  }

  return {
    init,
    resume,
    startAmbient,
    stopAmbient,
    playEnterHorn,
    playBuildComplete,
    playClick,
    playWarp,
    playCommsSignal,
    playWhoosh,
    toggleMute
  };

})();