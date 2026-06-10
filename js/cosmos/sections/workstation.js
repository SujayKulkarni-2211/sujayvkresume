/* workstation.js — Space Work Station section
 *
 * A 3D modular space station: a central hull with docked module-nodes
 * (Profile, Key Areas, Research, Experience, Projects, Certs, Education,
 * Interests). Each node glows with a label + preview. Clicking a node slides
 * its full content in as a mission-control console panel.
 */
'use strict';

const CosmosWorkstation = (() => {

  // ── Module content. Each module = one docked node + one console panel. ──
  const MODULES = [
    {
      id: 'profile', icon: '🧑‍🚀', label: 'Commander Profile', theme: 0xa78bfa,
      preview: 'Sujay V Kulkarni · AI · Quantum · Security',
      html: `
        <div class="ws-profile-name">Sujay V Kulkarni</div>
        <div class="ws-profile-tag">Builder at the intersection of AI · Quantum Computing · Cybersecurity · Systems Engineering</div>
        <div class="ws-profile-flow">idea → implementation → deployment → impact</div>
        <div class="ws-focus-row">
          <span class="ws-focus-chip">Generative AI</span>
          <span class="ws-focus-chip">Quantum Computing</span>
          <span class="ws-focus-chip">Cybersecurity</span>
          <span class="ws-focus-chip">Distributed Systems</span>
          <span class="ws-focus-chip">Applied Research</span>
          <span class="ws-focus-chip">Production Engineering</span>
        </div>`,
    },
    {
      id: 'areas', icon: '🛠', label: 'Key Areas', theme: 0x60a5fa,
      preview: 'AI/ML · Quantum · Backend · DevOps · Security …',
      html: `
        <div class="ws-areas-grid">
          <div class="ws-area-block ws-area-blue"><div class="ws-area-title">AI &amp; ML</div><div class="ws-area-tags">LLMs · RAG · Agents · Computer Vision · Deep Learning · Autoencoders · Generative AI · Affect Sensing · VLMs · Prompt Engineering · Claude Code · Codex · Antigravity · Vellum AI · dify.ai · Google AI Workspace · Google AI Studio</div></div>
          <div class="ws-area-block ws-area-purple"><div class="ws-area-title">Quantum Computing</div><div class="ws-area-tags">Qiskit · Q# · QASM · Quantum Algorithms · PQC · Hybrid Quantum-Classical · Microsoft Azure Quantum</div></div>
          <div class="ws-area-block ws-area-blue"><div class="ws-area-title">Backend &amp; Systems</div><div class="ws-area-tags">Python · Flask · APIs · MySQL · PostgreSQL · SQLite · System Design · Production Systems</div></div>
          <div class="ws-area-block ws-area-green"><div class="ws-area-title">Frontend</div><div class="ws-area-tags">ReactJS · HTML · CSS · JavaScript · Material UI · UX Design</div></div>
          <div class="ws-area-block ws-area-orange"><div class="ws-area-title">DevOps &amp; Cloud</div><div class="ws-area-tags">Docker · Podman · CI/CD · GitHub Actions · Linux · Server Management · Cockpit · Fail2ban</div></div>
          <div class="ws-area-block ws-area-red"><div class="ws-area-title">Security</div><div class="ws-area-tags">Cybersecurity · Web Security · Database Security · Threat Detection · Shell Scripting</div></div>
          <div class="ws-area-block ws-area-teal"><div class="ws-area-title">Research</div><div class="ws-area-tags">Technical Writing · Patent Drafting · Optimization · Model Evaluation · LaTeX · SHAP Interpretability</div></div>
          <div class="ws-area-block ws-area-gray"><div class="ws-area-title">Languages</div><div class="ws-area-tags">Python · Java · C · JavaScript · Q# · SQL · HTML/CSS</div></div>
        </div>`,
    },
    {
      id: 'research', icon: '🔬', label: 'Research Lab', theme: 0xc084fc,
      preview: '🏆 Best Paper · ICAICS 2025 + 2 more',
      html: `
        <div class="ws-papers">
          <div class="ws-paper-card">
            <div class="ws-paper-award">🏆 Best Paper Award</div>
            <div class="ws-paper-title">Quantum Entropy-Driven Temperature Scaling for Hallucination Mitigation in Generative Models</div>
            <div class="ws-paper-venue">ICAICS 2025 · Springer · Dec 2025 · 6 Authors</div>
            <div class="ws-paper-metrics">
              <span class="ws-metric">26.7% hallucination reduction (58%→42.5%)</span>
              <span class="ws-metric">178.6% entropy calibration improvement</span>
              <span class="ws-metric">27.4% reduction in overconfident predictions</span>
            </div>
            <div class="ws-paper-tags">AIML · Quantum Computing</div>
          </div>
          <div class="ws-paper-card">
            <div class="ws-paper-title">Quantum Circuit of the Elitzur-Vaidman Bomb Tester</div>
            <div class="ws-paper-venue">Quantum Information Processing Journal · 7 Authors</div>
            <div class="ws-paper-metrics">
              <span class="ws-metric">Only 2 qubits irrespective of circuit depth</span>
              <span class="ws-metric">Scalable via Quantum Zeno effect</span>
              <span class="ws-metric">Immediately executable on near-term processors</span>
            </div>
            <div class="ws-paper-tags">Quantum Computing · Python · QASM</div>
          </div>
          <div class="ws-paper-card">
            <div class="ws-paper-title">Metric Driven Adaptive Temperature Scaling: A Regression Based Approach</div>
            <div class="ws-paper-venue">IMED Conference Malaysia · IEEE Xplore · 6 Authors</div>
            <div class="ws-paper-metrics">
              <span class="ws-metric">XGBoost: +10.9% ROUGE-L F1 for GPT-2 poetry</span>
              <span class="ws-metric">+5.7% BERTScore F1</span>
              <span class="ws-metric">Statistically significant via paired t-tests</span>
            </div>
            <div class="ws-paper-tags">AIML · Generative AI · LLMs · Deep Learning</div>
          </div>
        </div>`,
    },
    {
      id: 'experience', icon: '🛰', label: 'Experience Deck', theme: 0x38bdf8,
      preview: '13 roles · DevOps · AI Research · Quantum …',
      html: `
        <div class="ws-timeline">
          ${_role('blue','Software Developer & DevOps Intern (Semester Long)','Sri Aranea Technologies · Jan 2026–Present · ₹10k/month','Building and maintaining possibleclients.com — production B2B SaaS. Managing production VPS: Podman containerization, CI/CD via GitHub Actions, DKIM/SPF, Fail2ban, database backup pipelines.','Database · Shell Scripting · Vellum · JIRA · MySQL · Linux · Flask · Git · LLMs · Docker · Podman · GitHub · Agile · Agents · Dify')}
          ${_role('gold','Director & CEO','Goodwinsun AI Research Startup · Sep 2025–Present','Founded and lead Goodwinsun — AI research startup driving VAMANA (edge LLM), TAARA (cybersecurity), granty (grant-tech). End-to-end research lifecycle: ideation → implementation → benchmarking → publication.','AIML · Quantum Computing · Generative AI · Research · Security')}
          ${_role('blue','Software Developer (Winter Internship)','Sri Aranea Technologies · Dec 2025–Jan 2026 · ₹10k/month','Built a fingerprint scanner mobile app using camera and image processing; captured accurate fingerprints and obtained payment from client.','Python · Flutter · Image Processing · Mobile App')}
          ${_role('blue','Software Developer (Semester Long)','Sri Aranea Technologies · Sep–Nov 2025 · ₹10k/month','Built possibleclients.com version 2 and aided in deployment on production server.','MySQL · Linux · ReactJS · UX Design · Material UI')}
          ${_role('blue','Linux Server Administrator','Sri Aranea Technologies · Jul–Aug 2025 · ₹10k/month','Managed production server hosting the application; administered production database, application, and basic security.','Servers · Cockpit · Containerization · Database Security · Firewalls')}
          ${_role('blue','DevOps Engineer (Summer Internship)','Sri Aranea Technologies · Jun–Jul 2025 · ₹10k/month','DevOps engineering for possibleclients.com platform.','MySQL · GitHub Actions · CI · Docker · Podman · Linux')}
          ${_role('green','Full Stack Developer','Cortex Craft · Jun–Jul 2025','Built full-stack generative AI applications for clients.','Python · Flask · PostgreSQL · Gemini · JavaScript · Generative AI')}
          ${_role('purple','Patent Drafting & IPO Intern','Ethical Rhythms Pvt. Ltd. (karunyamusicals.com) · Feb–Apr 2025 · ₹8k/month','Patent drafting for Ethical Rhythms Pvt. Ltd.','Technical Writing · Patents · IP · Music · Physics')}
          ${_role('teal','Frontend Web Developer (Winter Internship)','CIE, RV University · Dec 2024–Jan 2025 · ₹8k/month','Frontend development for the BVB × RVU Patent Workshop platform.','ReactJS · HTML · CSS · JavaScript · UX Design')}
          ${_role('purple','Quantum Computing Intern (Summer)','CQST, RV University · Jun–Aug 2024','Foundational quantum computing research at CQST; enhanced fundamentals and promoted writing of multiple research papers on quantum computing and quantum mechanics.','Quantum Computing · Q# · Qiskit · Microsoft Azure Quantum · Python')}
          ${_role('green','Machine Learning Intern (Summer)','DAPMRVDC · Jun–Jul 2024','Classification of dental X-ray images for teeth classification and identification of anomalies.','Computer Vision · YOLO · Python · Image Processing')}
          ${_role('green','Database Administrator (Summer)','DAPMRVDC · Jun 2024','Built and managed database systems for DAPM RV Dental College NAAC accreditation-related event management.','HTML · MySQL · JavaScript · SQL · Databases · Flask · SQLite · CSS')}
          ${_role('teal','Frontend Web Developer','JK Expertrons · Mar–Apr 2024 · ₹5k/month','Built the platform for JK Expertrons.','JavaScript · CSS · HTML · Data Analysis')}
        </div>`,
    },
    {
      id: 'projects', icon: '🚀', label: 'Projects Bay', theme: 0x34d399,
      preview: 'VAMANA · TAARA · SankaRAGamana · granty …',
      html: `
        <div class="ws-projects-grid">
          ${_proj('VAMANA',"VAmana's a Model that Attends Narrows and Amplifies",'Edge LLM with FireAttention and squeeze-expand bottleneck for aggressive compression. Research paper targeting ACL 2026 Industry Track.','Python · Deep Learning · LLMs · Edge Computing · Quantization · LoRA · FireAttention','https://github.com/SujayKulkarni-2211/vamana','github.com/SujayKulkarni-2211/vamana')}
          ${_proj('TAARA','Threat Aware Autonomous Response Agent','Behavioral anomaly detection using reconstruction-based novelty detection and quantum validation via PennyLane. Production-deployed, patent filing in progress. Pitched at Elevate NxT 2026.','Autoencoders · Cybersecurity · AIML · Python · Quantum · Patent','https://github.com/SujayKulkarni-2211/taaraiepd','github.com/SujayKulkarni-2211/taaraiepd')}
          ${_proj('SankaRAGamana','Multi-agent RAG','Production multi-agent RAG grounding Adi Shankaracharya’s Advaita Vedanta teachings in a 2000+ verse Sanskrit corpus, with parallel retrieval agents, seeker-adaptive profiling, RL feedback, live SSE streaming, Supabase pgvector, Groq LLMs, Google OAuth, and Hugging Face Spaces deployment.','RAG · LLMs · Python · Agents · Vector DBs · React · Vite · OAuth','','')}
          ${_proj('granty','AI-Powered Grant Writing Platform','Flask + GenAI + LangChain platform serving 5+ clients; benefited 3 users in achieving their grants. FKCCI Manthan 2025 Finalist.','Flask · Gemini API · LangChain · Frontend · Backend','https://granty.onrender.com','granty.onrender.com')}
          ${_proj('naimisharanya','Dharmic Mental Wellness App','LLM-based mental health support system with narrative-driven context modeling using Hindu scriptures (Puranas, Upanishads) for dharmic storytelling and emotional grounding.','RAG · LLMs · Agents · VLM · Affective Computing · Python','','')}
          ${_proj('Lessgogrover',"Grover's Algorithm Simulator","Interactive simulation and explanation of Grover's Algorithm. Deployed on HuggingFace Spaces.",'Quantum Computing · Algorithms · Streamlit · Python · Simulation','https://huggingface.co/sujayvk-btech23','HuggingFace')}
          ${_proj('possibleclients.com','Production B2B SaaS Platform','Live production platform built and maintained at Sri Aranea Technologies.','Flask · ReactJS · MySQL · Podman · CI/CD · Linux','https://possibleclients.com','possibleclients.com')}
          ${_proj('dhwanimuzics.com','Music Platform','Web platform for Dhwani Muzics.','','https://dhwanimuzics.com','dhwanimuzics.com')}
          ${_proj('Fingerprint Scanner App','Mobile Fingerprint Capture','Fingerprint scanner mobile app using camera and image processing; accurate fingerprint capture with payment received from client.','Flutter · Python · Image Processing · Mobile','','')}
        </div>`,
    },
    {
      id: 'certs', icon: '📡', label: 'Certifications', theme: 0xfbbf24,
      preview: 'NPTEL Elite 90% · HackerRank 5★ · GitHub 600+',
      html: `
        <div class="ws-certs">
          <div class="ws-cert-row"><span class="ws-cert-icon">🏅</span><span>Affective Computing — NPTEL · Elite score: 90% · Emotion recognition, HCI, AI, ML, behavior analysis</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">📜</span><span>Design &amp; Implementation of Human Computer Interfaces — NPTEL</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">📜</span><span>Open Source Models with Hugging Face</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">📜</span><span>Transformer Models and BERT</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">📜</span><span>Introduction to LangGraph</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">⭐⭐⭐⭐⭐</span><span>HackerRank Problem Solving</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">⭐⭐⭐⭐⭐</span><span>HackerRank Python</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">⭐⭐⭐</span><span>HackerRank Java</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">⭐</span><span>HackerRank C</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">🟡</span><span>LeetCode — 66+ problems solved · Contest qualifier (Codeverse)</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">🐙</span><span>GitHub — 600+ contributions across 3 years</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">🔬</span><span>Open Source — Microsoft Q# · Microsoft QDK · scikit-learn</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">🏆</span><span>Best Paper Award — ICAICS 2025, Springer</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">🧪</span><span>Patent filing in progress — AI cybersecurity and quantum-enhanced systems</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">🚀</span><span>Finalist — FKCCI Manthan 2025 (granty) · Karnataka Elevate 2024</span></div>
          <div class="ws-cert-row"><span class="ws-cert-icon">⚡</span><span>Winner — Building Application Hackathon (waruna) · Delegate — Indo-Sri Lanka Economic Summit</span></div>
        </div>`,
    },
    {
      id: 'education', icon: '🎓', label: 'Old Records', theme: 0x7dd3fc,
      preview: 'B.Tech CSE (AI-ML) · CGPA 8.76',
      html: `
        <div class="ws-edu">
          <div class="ws-edu-row"><div class="ws-edu-deg">B.Tech(Hons) — CSE</div><div class="ws-edu-inst">RV University, Bengaluru · 2023–2027 expected · Major: AIML · Minor: Innovation, Entrepreneurship &amp; Product Development</div><div class="ws-edu-score">Aggregate CGPA 8.76 · Sem I 8.08 · Sem II 9.17 · Sem III 8.66 · Sem IV 8.59 · Sem V 9.3</div></div>
          <div class="ws-edu-row"><div class="ws-edu-deg">PUE 12th</div><div class="ws-edu-inst">RV PU College, Bengaluru · Karnataka Board · 2023 · English medium</div><div class="ws-edu-score">95.33 / 100</div></div>
          <div class="ws-edu-row"><div class="ws-edu-deg">SSLC 10th</div><div class="ws-edu-inst">Shree Bharathi Vidyalaya, Bengaluru · KSEEB · 2021 · English medium</div><div class="ws-edu-score">97.44 / 100</div></div>
        </div>`,
    },
    {
      id: 'interests', icon: '✨', label: 'Star Gazing', theme: 0xf472b6,
      preview: 'Leadership · Music · Languages · Interests',
      html: `
        <div class="ws-interests">
          ${['Founder & President — RUDRA, RVU','Chief Advisor / President Emeritus — RUDRA','Vice Chairperson — IEEE Student Branch, RVU','Technical Writing Officer — Chiptech','Founder of IDeathon, RVU','Founder & Vice Chair — VYAASA','International Tabla Artist','Sangeeta Prabhakar National Award','Chamundeshwari National Award','Published Author: The Adventures of Detective Sujay','English','Hindi','Kannada','Sanskrit','Marathi','Astrophysics','Astronomy & Space Science','Newtonian Physics','Quantum Physics','Calculus','Botany & Biophysics','Innovation & Entrepreneurship','Innovation & Geopolitics','Teaching','Spirituality & Metaphysics','Indology & Ancient Indian Philosophy','Old Kannada Literature & Poems','Sanskrit Literature & Epics','Nation Building','Swimming','Reading — literature to science to tech'].map(t => `<span class="ws-interest-tag">${t}</span>`).join('')}
        </div>`,
    },
  ];

  function _role(color, title, org, desc, tags) {
    return `<div class="ws-role"><div class="ws-role-dot ws-dot-${color}"></div><div class="ws-role-body">
      <div class="ws-role-title">${title}</div><div class="ws-role-org">${org}</div>
      <div class="ws-role-desc">${desc}</div><div class="ws-role-tags">${tags}</div></div></div>`;
  }
  function _proj(name, full, desc, tags, url, urlText) {
    const link = url ? `<a class="ws-proj-link" href="${url}" target="_blank">${urlText} ↗</a>` : '';
    const tagHtml = tags ? `<div class="ws-proj-tags">${tags}</div>` : '';
    return `<div class="ws-project-card"><div class="ws-proj-name">${name}</div><div class="ws-proj-full">${full}</div>
      <div class="ws-proj-desc">${desc}</div>${tagHtml}${link}</div>`;
  }

  // ── State shared between build() and build3D() ──
  let _nodes = [];          // [{ group, face, mat, frame, frameMat, lip, idx }]
  let _activeId = null;
  let _hoverIdx = -1;       // currently hovered module (-1 none)

  // ── 3D STATION (top-view floor plan) ────────────────────────────
  let _groupRef = null;
  let _station = null;
  let _stationEntryScale = 1.18;
  let _stationFocusX = -360;
  let _stationFocusScale = 0.68;
  let _camDefault = null, _camFocused = null;
  let _raycaster = null, _pointer = null, _onMove = null, _onClick = null;
  let _previewEl = null;
  let _openCb = null;          // build() registers how to open a module console

  // Paint a module's title + themed icon + grid pattern onto a canvas → texture.
  function _moduleTexture(m) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const x = c.getContext('2d');
    const col = '#' + new THREE.Color(m.theme).getHexString();

    x.fillStyle = 'rgba(8,12,26,0.92)'; x.fillRect(0, 0, 512, 256);
    const g = x.createLinearGradient(0, 0, 512, 256);
    g.addColorStop(0, col + '22'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 512, 256);

    x.strokeStyle = col + '33'; x.lineWidth = 1;
    for (let i = 24; i < 512; i += 36) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.stroke(); }
    for (let i = 24; i < 256; i += 36) { x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }

    x.strokeStyle = col + 'dd'; x.lineWidth = 7; x.strokeRect(8, 8, 496, 240);
    x.fillStyle = col;
    [[18,18],[494,18],[18,238],[494,238]].forEach(([px,py]) => { x.fillRect(px-6, py-6, 12, 12); });

    x.font = '80px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(m.icon, 88, 124);

    x.fillStyle = '#eaf0ff';
    x.font = 'bold 39px "Courier New", monospace';
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillText(m.label.toUpperCase(), 188, 108);
    x.fillStyle = col; x.fillRect(188, 130, 276, 5);
    x.fillStyle = 'rgba(228,238,255,0.86)';
    x.font = '23px "Courier New", monospace';
    _wrap(x, m.preview, 188, 160, 282, 27);

    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    return tex;
  }
  function _wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(' '); let line = '', yy = y;
    for (const w of words) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w + ' '; yy += lh; }
      else line = test;
    }
    ctx.fillText(line, x, yy);
  }

  function build3D() {
    const NEBULA_Z = CosmosWorld.getNEBULA_Z();
    const ORIGIN = new THREE.Vector3(-100, 60, NEBULA_Z - 1100);

    const group = new THREE.Group();
    group.position.copy(ORIGIN);
    _groupRef = group;

    const steel = 0xaab7c9, gold = 0xe9b949;

    const station = new THREE.Group();
    group.add(station);
    _station = station;

    const trussMat = new THREE.MeshStandardMaterial({ color: steel, metalness: 0.85, roughness: 0.35 });

    // Top-view station floor plan: glass rooms connected by a central corridor.
    const COLS = 4, ROWS = 2, PW = 128, PH = 82, GX = 30, GY = 58;
    const gridW = COLS * PW + (COLS - 1) * GX;
    const gridH = ROWS * PH + (ROWS - 1) * GY;

    const corridorMat = new THREE.MeshStandardMaterial({
      color: 0x26354f, metalness: 0.62, roughness: 0.38,
      emissive: 0x071426, emissiveIntensity: 0.45,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x8db6ff, transparent: true, opacity: 0.16,
      metalness: 0.18, roughness: 0.18,
      emissive: 0x294c7a, emissiveIntensity: 0.18,
    });

    const spine = new THREE.Mesh(new THREE.BoxGeometry(gridW + 90, 12, 22), corridorMat);
    spine.position.y = -5; station.add(spine);
    [-1, 1].forEach(side => {
      const cross = new THREE.Mesh(new THREE.BoxGeometry(14, 10, gridH + 28), corridorMat);
      cross.position.set(side * (PW + GX) * 0.92, -4, 0); station.add(cross);
    });

    // Smaller external solar wings so the modules, not the panels, dominate.
    [-(gridW/2 + 96), gridW/2 + 96].forEach(px => {
      const mast = new THREE.Mesh(new THREE.BoxGeometry(66, 7, 7), trussMat);
      mast.position.set(px > 0 ? px - 58 : px + 58, -2, 0); station.add(mast);

      [-52, 52].forEach(z => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(92, 4, 54),
          new THREE.MeshStandardMaterial({ color: 0x6d5214, metalness: 0.45, roughness: 0.32,
            emissive: gold, emissiveIntensity: 0.16 }));
        wing.position.set(px, -3, z); station.add(wing);
        for (let i = -2; i <= 2; i++) {
          const line = new THREE.Mesh(new THREE.BoxGeometry(92, 5, 1.2),
            new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.22 }));
          line.position.set(px, 0, z + i * 10); station.add(line);
        }
      });
    });

    // Radiators and truss details.
    [-gridH/2 - 26, gridH/2 + 26].forEach(z => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(gridW + 36, 6, 5), trussMat);
      rail.position.set(0, -2, z); station.add(rail);
      for (let x = -gridW / 2; x <= gridW / 2; x += 48) {
        const brace = new THREE.Mesh(new THREE.BoxGeometry(5, 6, 42), trussMat);
        brace.position.set(x, -2, z > 0 ? z - 18 : z + 18);
        brace.rotation.y = z > 0 ? 0.55 : -0.55;
        station.add(brace);
      }
    });

    function addLine(x, z, sx, sz, color, opacity) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(sx, 2, sz),
        new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.22 }));
      line.material.color.setHex(color);
      line.material.opacity = opacity;
      line.position.set(x, 9, z);
      station.add(line);
    }

    // Module rooms. The title/theme texture is the room floor; the transparent
    // shell makes it read as a top-view station interior, not floating cards.
    _nodes = [];
    MODULES.forEach((m, i) => {
      const col = i % COLS, row = Math.floor(i / COLS);
      const px = -gridW/2 + PW/2 + col * (PW + GX);
      const pz = -gridH/2 + PH/2 + row * (PH + GY);

      const node = new THREE.Group();
      node.position.set(px, 3, pz);
      node.userData.idx = i;

      const shell = new THREE.Mesh(new THREE.BoxGeometry(PW, 26, PH), glassMat.clone());
      shell.position.y = 7; node.add(shell);

      const tex = _moduleTexture(m);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.94, side: THREE.DoubleSide });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(PW - 8, PH - 8), mat);
      face.rotation.x = -Math.PI / 2;
      face.position.y = 21;
      node.add(face);

      const frameMat = new THREE.MeshBasicMaterial({ color: m.theme, transparent: true,
        opacity: 0.45, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), frameMat);
      frame.rotation.x = -Math.PI / 2; frame.position.y = 22; node.add(frame);

      const color = m.theme;
      addLine(px - 33, pz - 20, 36, 2, color, 0.35);
      addLine(px + 33, pz + 18, 42, 2, color, 0.28);

      // invisible thick box = the raycast target
      const lip = new THREE.Mesh(new THREE.BoxGeometry(PW, 44, PH),
        new THREE.MeshBasicMaterial({ visible: false }));
      lip.position.y = 14;
      node.add(lip);

      station.add(node);
      _nodes.push({ group: node, face, mat, frame, frameMat, shell, shellMat: shell.material, lip, idx: i });
    });

    // Keep the floor plan mostly horizontal; the camera supplies the angle.
    station.rotation.x = 0;
    station.rotation.z = -0.03;
    station.scale.setScalar(_stationEntryScale);

    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(160, 420, 260); group.add(sun);
    group.add(new THREE.AmbientLight(0x3a4660, 2.0));
    group.add(Loka3D.starSprinkle(1200, 1100, 0xdfe9ff, 2.4));

    _camDefault = {
      pos:  ORIGIN.clone().add(new THREE.Vector3(0, 520, 430)),
      look: ORIGIN.clone().add(new THREE.Vector3(0, 0, 0)),
    };
    _camFocused = {
      pos:  ORIGIN.clone().add(new THREE.Vector3(0, 560, 500)),
      look: ORIGIN.clone().add(new THREE.Vector3(-155, 0, 0)),
    };
    const anchor = _camDefault;

    const animate = (t) => {
      const focused = !!_activeId;
      const targetX = focused ? _stationFocusX : 0;
      const targetScale = focused ? _stationFocusScale : _stationEntryScale;
      station.position.x += (targetX - station.position.x) * 0.08;
      station.scale.x += (targetScale - station.scale.x) * 0.08;
      station.scale.y += (targetScale - station.scale.y) * 0.08;
      station.scale.z += (targetScale - station.scale.z) * 0.08;
      station.rotation.z = -0.03 + Math.sin(t * 0.08) * 0.012;
      _nodes.forEach((nd, i) => {
        const lit = MODULES[i].id === _activeId || i === _hoverIdx;
        nd.frameMat.opacity += ((lit ? 0.95 : 0.42) - nd.frameMat.opacity) * 0.15;
        nd.mat.opacity += ((lit ? 1.0 : 0.9) - nd.mat.opacity) * 0.15;
        nd.shellMat.opacity += ((lit ? 0.28 : 0.14) - nd.shellMat.opacity) * 0.15;
        nd.shellMat.emissiveIntensity += ((lit ? 0.55 : 0.18) - nd.shellMat.emissiveIntensity) * 0.15;
        nd.group.position.y += ((lit ? 12 : 3) - nd.group.position.y) * 0.15;
      });
    };

    return { group, anchor, animate };
  }

  // Hover/click on 3D panels via raycasting against the lip meshes.
  function _setupRaycast() {
    _teardownRaycast();
    const cam = (typeof CosmosScene3D !== 'undefined') ? CosmosScene3D.getCamera() : null;
    if (!cam) {
      setTimeout(_setupRaycast, 120);
      return;
    }
    _raycaster = new THREE.Raycaster();
    _pointer = new THREE.Vector2();
    const targets = _nodes.map(n => n.lip);

    _onMove = (e) => {
      _pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      _pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      _raycaster.setFromCamera(_pointer, cam);
      const hit = _raycaster.intersectObjects(targets, false)[0];
      _hoverIdx = hit ? hit.object.parent.userData.idx : -1;
      document.body.style.cursor = hit ? 'pointer' : '';
      if (_previewEl) {
        if (hit) {
          const m = MODULES[_hoverIdx];
          _previewEl.innerHTML = `<div>${m.icon} ${m.label}</div><span>${m.preview}</span>`;
          _previewEl.style.left = Math.min(e.clientX + 18, window.innerWidth - 310) + 'px';
          _previewEl.style.top = Math.min(e.clientY + 18, window.innerHeight - 118) + 'px';
          _previewEl.classList.add('show');
        } else {
          _previewEl.classList.remove('show');
        }
      }
    };
    _onClick = (e) => {
      if (e.target && e.target.closest && e.target.closest('.ws-header, .ws-console')) return;
      if (_hoverIdx >= 0 && _openCb) _openCb(_hoverIdx);
    };
    window.addEventListener('pointermove', _onMove);
    window.addEventListener('click', _onClick);
  }
  function _teardownRaycast() {
    if (_onMove) window.removeEventListener('pointermove', _onMove);
    if (_onClick) window.removeEventListener('click', _onClick);
    _onMove = _onClick = null;
    if (_previewEl) _previewEl.classList.remove('show');
    document.body.style.cursor = '';
  }

  function enter() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [440, 660, 880].forEach((f, i) => {
        setTimeout(() => {
          try {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'sine'; o.frequency.value = f;
            o.connect(g); g.connect(ctx.destination);
            g.gain.setValueAtTime(0, ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
            o.start(); o.stop(ctx.currentTime + 0.22);
          } catch(e) {}
        }, i * 140);
      });
    } catch(e) {}
  }

  // ── HTML: just the sliding console panel. The station modules (titles,
  //    themes, hover, click) are all rendered/handled in 3D. ──
  function build(container) {
    _activeId = null;
    _hoverIdx = -1;

    container.innerHTML = `
<div class="ws-root ws-3d">
  <div class="ws-header">
    <span class="ws-title">🛰 Space Work Station</span>
    <span class="ws-hint">Hover a module to preview · click to open its console</span>
    <a class="ws-resume-btn ws-resume-top" href="master_resume.pdf" target="_blank">⬇ Resume</a>
    <button class="ws-back-btn" onclick="Cosmossections.returnToOrbit()">← Return to Orbit</button>
  </div>

  <div class="ws-console" id="ws-console">
    <div class="ws-console-head">
      <span class="ws-console-title" id="ws-console-title"></span>
      <button class="ws-console-close" id="ws-console-close">✕</button>
    </div>
    <div class="ws-console-body" id="ws-console-body"></div>
  </div>
  <div class="ws-hover-card" id="ws-hover-card"></div>
</div>`;

    const root    = container.querySelector('.ws-root');
    const console_ = container.querySelector('#ws-console');
    const cTitle = container.querySelector('#ws-console-title');
    const cBody  = container.querySelector('#ws-console-body');
    _previewEl = container.querySelector('#ws-hover-card');
    container.querySelector('#ws-console-close').addEventListener('click', closeModule);

    function openModule(i) {
      const m = MODULES[i];
      _activeId = m.id;
      _hoverIdx = -1;
      cTitle.textContent = m.icon + '  ' + m.label;
      cBody.innerHTML = m.html;
      cBody.scrollTop = 0;
      console_.setAttribute('data-theme', m.id);
      console_.classList.add('open');
      root.classList.add('ws-focused');
      if (_previewEl) _previewEl.classList.remove('show');
      if (typeof CosmosScene3D !== 'undefined' && _camFocused) {
        CosmosScene3D.flyTo(_camFocused.pos, _camFocused.look, 0.9);
      }
      try { enter(); } catch (e) {}
    }
    function closeModule() {
      _activeId = null;
      console_.classList.remove('open');
      root.classList.remove('ws-focused');
      if (typeof CosmosScene3D !== 'undefined' && _camDefault) {
        CosmosScene3D.flyTo(_camDefault.pos, _camDefault.look, 0.9);
      }
    }

    // Wire the 3D raycast click → open the console for that module.
    _openCb = openModule;
    setTimeout(_setupRaycast, 0);
  }

  return { build, enter, build3D };
})();
