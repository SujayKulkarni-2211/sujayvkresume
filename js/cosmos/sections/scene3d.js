/* scene3d.js — Shared per-section 3D framework.
 *
 * Each cosmos section can register a "3D destination": a THREE.Group of real
 * objects placed far from the orbit, plus a camera anchor (where to fly the
 * camera) and an optional per-frame animation. Section HTML then renders as
 * transparent floating glass over this live 3D scene.
 *
 * Reuses the single shared renderer/scene/camera from CosmosWorld — no second
 * WebGL context. Driven each frame from app.js's main loop via tick().
 */
'use strict';

const CosmosScene3D = (() => {
  let _scene  = null;
  let _camera = null;

  // The currently active section destination descriptor:
  // { group, anchor:{pos:Vector3, look:Vector3}, animate(t,dt), savedCam }
  let _active = null;

  // Camera-flight state
  let _flight = null; // { fromPos, toPos, fromLook, toLook, t0, dur, onDone }
  let _curLook = null; // track current lookAt target for smooth handoff

  function _ensure() {
    if (_scene)  return true;
    if (typeof CosmosWorld === 'undefined' || !CosmosWorld.getScene) return false;
    _scene  = CosmosWorld.getScene();
    _camera = CosmosWorld.getCamera();
    return !!_scene;
  }

  function _easeInOut(x) { return x < 0.5 ? 2*x*x : -1 + (4 - 2*x) * x; }

  // ── Fly the camera from its current pose to a target pose ──
  function flyTo(pos, look, durSec, onDone) {
    if (!_ensure()) { if (onDone) onDone(); return; }
    _flight = {
      fromPos:  _camera.position.clone(),
      toPos:    pos.clone(),
      fromLook: (_curLook ? _curLook.clone() : new THREE.Vector3(0, 0, CosmosWorld.getNEBULA_Z())),
      toLook:   look.clone(),
      t0:       performance.now(),
      dur:      durSec * 1000,
      onDone,
    };
  }

  // ── Enter a section's 3D destination ──────────────────────
  // descriptor: { group, anchor:{pos,look}, animate?(t,dt) }
  function enter(descriptor, flySec, onArrive) {
    if (!_ensure()) { if (onArrive) onArrive(); return; }

    // Stop the orbit camera; we take manual control.
    if (CosmosWorld.pauseOrbit) CosmosWorld.pauseOrbit();

    // Remove any previous destination.
    _clearActive();

    _active = descriptor;
    if (descriptor.group) _scene.add(descriptor.group);

    const a = descriptor.anchor;
    flyTo(a.pos, a.look, flySec != null ? flySec : 1.1, onArrive);
  }

  // ── Leave the current destination, fly back to orbit ──────
  function exitToOrbit(flySec, onDone) {
    if (!_ensure()) { if (onDone) onDone(); return; }

    const RING_R   = CosmosWorld.getRING_R();
    const NEBULA_Z = CosmosWorld.getNEBULA_Z();
    const backPos  = new THREE.Vector3(RING_R, 20, NEBULA_Z);
    const backLook = new THREE.Vector3(0, 0, NEBULA_Z);

    flyTo(backPos, backLook, flySec != null ? flySec : 1.1, () => {
      _clearActive();
      if (CosmosWorld.resumeOrbit) CosmosWorld.resumeOrbit();
      if (onDone) onDone();
    });
  }

  function _clearActive() {
    if (_active && _active.group && _scene) {
      _scene.remove(_active.group);
      _disposeGroup(_active.group);
    }
    _active = null;
  }

  function _disposeGroup(group) {
    group.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
  }

  // ── Per-frame, called from the main loop ──────────────────
  function tick(t, dt) {
    if (!_camera) return;

    // Drive camera flight
    if (_flight) {
      const elapsed = performance.now() - _flight.t0;
      const raw = Math.min(elapsed / _flight.dur, 1);
      const e = _easeInOut(raw);
      _camera.position.lerpVectors(_flight.fromPos, _flight.toPos, e);
      const look = new THREE.Vector3().lerpVectors(_flight.fromLook, _flight.toLook, e);
      _camera.lookAt(look);
      _curLook = look;
      if (raw >= 1) {
        const done = _flight.onDone;
        _flight = null;
        if (done) done();
      }
    }

    // Animate active section objects
    if (_active && _active.animate) {
      _active.animate(t, dt);
    }
  }

  function hasActive() { return !!_active; }

  function getCamera() { return _camera; }

  // Project a world-space THREE.Vector3 to screen pixels.
  // Returns { x, y, visible } where visible=false if behind camera.
  function project(worldVec) {
    if (!_camera) return { x: 0, y: 0, visible: false };
    const v = worldVec.clone().project(_camera);
    const visible = v.z < 1;
    return {
      x: (v.x * 0.5 + 0.5) * window.innerWidth,
      y: (-v.y * 0.5 + 0.5) * window.innerHeight,
      visible,
    };
  }

  return { enter, exitToOrbit, flyTo, tick, hasActive, getCamera, project };
})();
