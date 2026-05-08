/* ship.js — Spaceship model + build-from-nothing assembly animation */
'use strict';

const CosmosShip = (() => {
  let shipGroup = null;
  let parts = [];        // [{mesh, threshold}] — threshold = build progress 0..1 to reveal
  let smokeSystem = null;
  let sparkSystem = null;
  let smokeOn = false;
  let smokeClearing = false;
  let smokeClearTimer = 0;
  let scene = null;
  let orbitAngle = Math.PI; // start on OPPOSITE side so it's not in camera's face
  let orbitRadius = 280;    // matches RING_R in world.js
  let orbitCenterZ = -500;  // matches NEBULA_Z in world.js
  let orbitSpeed = 0.08;    // radians/sec — same as camera so they stay roughly apart
  let isOrbiting = false;

  const SMOKE_COUNT = 1000;
  const SPARK_COUNT = 400;

  // ── PUBLIC: BUILD SHIP IN SCENE ───────────────────────────
  function create(threeScene) {
    scene = threeScene;
    parts = [];

    shipGroup = new THREE.Group();
    shipGroup.position.set(0, 0, 0);
    scene.add(shipGroup);

    _buildParts();
    _buildSmoke();
    _buildSparks();

    return shipGroup;
  }

  // ── SHIP PARTS ────────────────────────────────────────────
  function _addPart(mesh, threshold) {
    mesh.visible = false;
    shipGroup.add(mesh);
    parts.push({ mesh, threshold });
  }

  function _buildParts() {
    // ── Hull disc (main saucer body)
    const hullGeo = new THREE.CylinderGeometry(16, 20, 5.5, 64, 1);
    _scaleGeo(hullGeo, 1, 0.5, 1);
    _addPart(new THREE.Mesh(hullGeo, _mat(0x1e0a4a, 0.38, 0.72, 0x0d0028, 0.35)), 0.08);

    // ── Rim band (structural ring)
    _addPart(new THREE.Mesh(
      new THREE.TorusGeometry(18.2, 0.75, 12, 90),
      _mat(0x6d28d9, 0.22, 0.88, 0x3b0764, 0.55)
    ), 0.16);

    // ── Rim emissive glow line
    _addPart(new THREE.Mesh(
      new THREE.TorusGeometry(18.2, 0.2, 8, 90),
      _emissiveMat(0xc4b5fd, 1.4)
    ), 0.20);

    // ── Under-hull accent ring
    _addPart(new THREE.Mesh(
      new THREE.TorusGeometry(13.5, 0.28, 8, 64),
      _emissiveMat(0x7c3aed, 0.55)
    ), 0.23);

    // ── Dome base ring
    const domeBaseRing = new THREE.Mesh(
      new THREE.TorusGeometry(9.4, 0.5, 8, 56),
      _mat(0x5b21b6, 0.22, 0.82, 0x3b0764, 0.65)
    );
    domeBaseRing.position.y = 2.8;
    _addPart(domeBaseRing, 0.26);

    // ── Glass dome
    const domeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(9.4, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.52),
      new THREE.MeshPhysicalMaterial({
        color: 0x88aaff,
        roughness: 0.0,
        metalness: 0.0,
        transmission: 0.88,
        transparent: true,
        opacity: 0.68,
        emissive: 0x2233aa,
        emissiveIntensity: 0.45,
        side: THREE.DoubleSide,
      })
    );
    domeMesh.position.y = 2.8;
    _addPart(domeMesh, 0.30);

    // ── 3 Engine pods
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const podGeo = new THREE.CylinderGeometry(2.0, 2.6, 7.5, 16);
      _scaleGeo(podGeo, 1, 0.48, 1);
      const pod = new THREE.Mesh(podGeo, _mat(0x1a0840, 0.42, 0.82, 0x0d0028, 0.28));
      pod.position.set(Math.cos(angle) * 14.8, -2.2, Math.sin(angle) * 14.8);
      _addPart(pod, 0.34 + i * 0.04);

      // Engine cone glow
      const coneGeo = new THREE.ConeGeometry(1.9, 6.5, 12, 1, true);
      const cone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.52,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      cone.rotation.x = Math.PI;
      cone.position.set(Math.cos(angle) * 14.8, -6.2, Math.sin(angle) * 14.8);
      _addPart(cone, 0.38 + i * 0.04);

      // Engine inner glow point
      const glowSph = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 12, 12),
        _emissiveMat(0xddd6fe, 2.0)
      );
      glowSph.position.set(Math.cos(angle) * 14.8, -2.8, Math.sin(angle) * 14.8);
      _addPart(glowSph, 0.42 + i * 0.02);
    }

    // ── Rim accent lights (12 nodes)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const col = i % 3 === 0 ? 0xfbbf24 : (i % 3 === 1 ? 0xc4b5fd : 0x60a5fa);
      const lm = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 8, 8),
        _emissiveMat(col, 1.8)
      );
      lm.position.set(Math.cos(angle) * 18.2, -0.1, Math.sin(angle) * 18.2);
      _addPart(lm, 0.50 + i * 0.015);
    }

    // ── Antenna
    const ant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 6.5, 8),
      _mat(0xc4b5fd, 0.1, 0.9, 0xc4b5fd, 0.5)
    );
    ant.position.y = 12.5;
    _addPart(ant, 0.70);

    const antTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 8, 8),
      _emissiveMat(0xff4444, 2.0)
    );
    antTip.position.y = 15.8;
    _addPart(antTip, 0.72);

    // ── Hull panel detail lines
    [-1.4, 1.4].forEach((y, idx) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(11.5, 0.12, 6, 64),
        _emissiveMat(0x4c1d95, 0.4)
      );
      ring.position.y = y;
      ring.rotation.x = Math.PI / 2;
      _addPart(ring, 0.24 + idx * 0.02);
    });

    // ── Nose window (front viewport in hull)
    const window1 = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0xaaccff,
        transparent: true,
        opacity: 0.75,
        emissive: 0x3366ff,
        emissiveIntensity: 0.6,
        roughness: 0,
      })
    );
    window1.position.set(0, 2.8, 9.2);
    window1.lookAt(0, 3, 20);
    _addPart(window1, 0.32);
  }

  function _mat(color, rough, metal, emissive, emissInt) {
    return new THREE.MeshStandardMaterial({
      color, roughness: rough, metalness: metal,
      emissive, emissiveIntensity: emissInt,
    });
  }
  function _emissiveMat(color, intensity) {
    return new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: intensity,
      roughness: 0.1, metalness: 0.8,
    });
  }
  function _scaleGeo(geo, x, y, z) {
    geo.applyMatrix4(new THREE.Matrix4().makeScale(x, y, z));
  }

  // ── SMOKE SYSTEM ──────────────────────────────────────────
  function _buildSmoke() {
    const pos = new Float32Array(SMOKE_COUNT * 3);
    for (let i = 0; i < SMOKE_COUNT; i++) {
      pos[i*3] = 0; pos[i*3+1] = -600; pos[i*3+2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x9b6dff,
      size: 4.0,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    smokeSystem = {
      points: new THREE.Points(geo, mat),
      particles: Array.from({ length: SMOKE_COUNT }, () => ({
        active: false, life: 0, maxLife: 0,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
      })),
    };
    scene.add(smokeSystem.points);
  }

  function _spawnSmoke() {
    const p = smokeSystem.particles.find(s => !s.active);
    if (!p) return;
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.random() * 20;
    p.active = true; p.life = 0;
    p.maxLife = 80 + Math.random() * 120;
    p.x = Math.cos(angle) * rad;
    p.y = -3 + Math.random() * 2;
    p.z = Math.sin(angle) * rad;
    p.vx = (Math.random() - 0.5) * 0.12;
    p.vy = 0.04 + Math.random() * 0.22;
    p.vz = (Math.random() - 0.5) * 0.12;
  }

  function updateSmoke(buildProgress) {
    if (!smokeSystem) return;
    const mat = smokeSystem.points.material;

    if (buildProgress > 0.04 && buildProgress < 0.95 && !smokeClearing) {
      for (let n = 0; n < 10; n++) _spawnSmoke();
    }
    if (buildProgress >= 0.95 && !smokeClearing) {
      smokeClearing = true;
      smokeClearTimer = 0;
    }
    if (smokeClearing) smokeClearTimer += 0.014;

    const pos = smokeSystem.points.geometry.attributes.position;
    let anyAlive = false;
    smokeSystem.particles.forEach((p, i) => {
      if (!p.active) return;
      anyAlive = true;
      p.life++;
      if (smokeClearing) {
        p.vx += p.x > 0 ? 0.025 : -0.025;
        p.vz += p.z > 0 ? 0.025 : -0.025;
        p.vy += 0.04;
      }
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      pos.setXYZ(i, p.x, p.y, p.z);
      const dead = smokeClearing ? (p.life > p.maxLife * 0.3) : (p.life >= p.maxLife);
      if (dead) {
        p.active = false;
        pos.setXYZ(i, 0, -600, 0);
      }
    });
    pos.needsUpdate = true;

    if (smokeClearing) {
      mat.opacity = Math.max(0, 0.55 - smokeClearTimer * 0.55);
    } else {
      mat.opacity = Math.min(0.55, buildProgress * 1.8);
    }

    if (mat.opacity <= 0 && !anyAlive) smokeOn = false;
  }

  // ── SPARK SYSTEM ──────────────────────────────────────────
  function _buildSparks() {
    const pos = new Float32Array(SPARK_COUNT * 3);
    for (let i = 0; i < SPARK_COUNT; i++) {
      pos[i*3] = 0; pos[i*3+1] = -600; pos[i*3+2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    sparkSystem = {
      points: new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xfbbf24,
        size: 1.0,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })),
      particles: Array.from({ length: SPARK_COUNT }, () => ({
        active: false, life: 0, maxLife: 0,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
      })),
    };
    scene.add(sparkSystem.points);
  }

  function spawnSpark(px, py, pz) {
    const p = sparkSystem.particles.find(s => !s.active);
    if (!p) return;
    p.active = true; p.life = 0;
    p.maxLife = 18 + Math.floor(Math.random() * 40);
    p.x = px + (Math.random() - 0.5) * 0.8;
    p.y = py + (Math.random() - 0.5) * 0.8;
    p.z = pz + (Math.random() - 0.5) * 0.8;
    p.vx = (Math.random() - 0.5) * 0.22;
    p.vy = 0.06 + Math.random() * 0.28;
    p.vz = (Math.random() - 0.5) * 0.22;
  }

  function updateSparks() {
    if (!sparkSystem) return;
    const pos = sparkSystem.points.geometry.attributes.position;
    sparkSystem.particles.forEach((p, i) => {
      if (!p.active) return;
      p.life++;
      p.vy -= 0.012;
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      pos.setXYZ(i, p.x, p.y, p.z);
      if (p.life >= p.maxLife) {
        p.active = false;
        pos.setXYZ(i, 0, -600, 0);
      }
    });
    pos.needsUpdate = true;
  }

  // ── APPLY BUILD PROGRESS ──────────────────────────────────
  // progress: 0..1
  function applyBuildProgress(progress) {
    let lastRevealedPart = null;
    parts.forEach(({ mesh, threshold }) => {
      const wasVisible = mesh.visible;
      mesh.visible = progress >= threshold;
      if (mesh.visible && !wasVisible) {
        lastRevealedPart = mesh;
      }
    });
    if (lastRevealedPart) {
      const pos = lastRevealedPart.position;
      for (let s = 0; s < 6; s++) spawnSpark(pos.x, pos.y + 2, pos.z);
    }
    updateSmoke(progress);
    updateSparks();
  }

  // ── ORBIT AROUND NEBULA ───────────────────────────────────
  function snapToOrbitStart() {
    if (!shipGroup) return;
    // Camera IS the ship — hide the mesh entirely during orbit
    shipGroup.visible = false;
  }

  function startOrbit() {
    isOrbiting = true;
  }

  function stopOrbit() {
    isOrbiting = false;
  }

  function updateOrbit(dt) {
    if (!isOrbiting || !shipGroup) return;
    orbitAngle += orbitSpeed * dt;
    shipGroup.position.x = Math.cos(orbitAngle) * orbitRadius;
    shipGroup.position.y = Math.sin(orbitAngle * 0.3) * 5; // gentle up-down drift
    shipGroup.position.z = Math.sin(orbitAngle) * orbitRadius + orbitCenterZ;

    // Ship faces forward along orbit tangent
    const tangentX = -Math.sin(orbitAngle);
    const tangentZ =  Math.cos(orbitAngle);
    shipGroup.rotation.y = Math.atan2(tangentX, tangentZ);
    // Slight bank into the turn
    shipGroup.rotation.z = Math.sin(orbitAngle) * 0.12;
  }

  function shrinkToOrbitScale() {
    // Camera IS the ship — nothing to scale
  }

  function getGroup() { return shipGroup; }
  function getSmokeOn() { return smokeOn; }
  function setSmokeOn(v) { smokeOn = v; }

  return {
    create,
    applyBuildProgress,
    snapToOrbitStart,
    startOrbit,
    stopOrbit,
    updateOrbit,
    shrinkToOrbitScale,
    spawnSpark,
    updateSparks,
    updateSmoke,
    getGroup,
    getSmokeOn,
    setSmokeOn,
  };
})();
