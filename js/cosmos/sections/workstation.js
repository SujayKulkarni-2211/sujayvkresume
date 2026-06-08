/* workstation.js — Space Work Station section */
'use strict';

const CosmosWorkstation = (() => {

  function enter() {
    // Radar ping — 3 ascending blips
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

  function build(container) {
    container.innerHTML = `
<div class="ws-root">
  <div class="ws-header">
    <span class="ws-title">🛰 Space Work Station</span>
    <button class="ws-back-btn" onclick="Cosmossections.returnToOrbit()">← Return to Orbit</button>
  </div>

  <div class="ws-grid">

    <!-- PROFILE -->
    <div class="ws-panel ws-full" data-tip="Who is at the helm">
      <div class="ws-panel-label">COMMANDER PROFILE</div>
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
      </div>
    </div>

    <!-- KEY AREAS -->
    <div class="ws-panel ws-full" data-tip="Core technical domains">
      <div class="ws-panel-label">KEY AREAS</div>
      <div class="ws-areas-grid">
        <div class="ws-area-block ws-area-blue">
          <div class="ws-area-title">AI &amp; ML</div>
          <div class="ws-area-tags">LLMs · RAG · Agents · Computer Vision · Deep Learning · Autoencoders · Generative AI · Affect Sensing · VLMs · Prompt Engineering · Claude Code · Codex · dify.ai · Google AI Studio</div>
        </div>
        <div class="ws-area-block ws-area-purple">
          <div class="ws-area-title">Quantum Computing</div>
          <div class="ws-area-tags">Qiskit · Q# · QASM · Quantum Algorithms · PQC · Hybrid Quantum-Classical · Microsoft Azure Quantum</div>
        </div>
        <div class="ws-area-block ws-area-blue">
          <div class="ws-area-title">Backend &amp; Systems</div>
          <div class="ws-area-tags">Python · Flask · APIs · MySQL · PostgreSQL · SQLite · System Design · Production Systems</div>
        </div>
        <div class="ws-area-block ws-area-green">
          <div class="ws-area-title">Frontend</div>
          <div class="ws-area-tags">ReactJS · HTML · CSS · JavaScript · Material UI · UX Design</div>
        </div>
        <div class="ws-area-block ws-area-orange">
          <div class="ws-area-title">DevOps &amp; Cloud</div>
          <div class="ws-area-tags">Docker · Podman · CI/CD · GitHub Actions · Linux · Server Management · Cockpit · Fail2ban</div>
        </div>
        <div class="ws-area-block ws-area-red">
          <div class="ws-area-title">Security</div>
          <div class="ws-area-tags">Cybersecurity · Web Security · Database Security · Threat Detection · Shell Scripting</div>
        </div>
        <div class="ws-area-block ws-area-teal">
          <div class="ws-area-title">Research</div>
          <div class="ws-area-tags">Technical Writing · Patent Drafting · Optimization · Model Evaluation · LaTeX · SHAP Interpretability</div>
        </div>
        <div class="ws-area-block ws-area-gray">
          <div class="ws-area-title">Languages</div>
          <div class="ws-area-tags">Python · Java · C · JavaScript · Q# · SQL · HTML/CSS</div>
        </div>
      </div>
    </div>

    <!-- RESEARCH LAB -->
    <div class="ws-panel ws-full" data-tip="Published research">
      <div class="ws-panel-label">RESEARCH LAB</div>
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

      </div>
    </div>

    <!-- EXPERIENCE BOARD -->
    <div class="ws-panel ws-full" data-tip="Professional timeline">
      <div class="ws-panel-label">EXPERIENCE BOARD</div>
      <div class="ws-timeline">

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-blue"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Software Developer &amp; DevOps Intern</div>
            <div class="ws-role-org">Sri Aranea Technologies · Jan 2026–Present · ₹10k/month</div>
            <div class="ws-role-desc">Building and maintaining possibleclients.com — production B2B SaaS. Managing production VPS: Podman containerization, CI/CD via GitHub Actions, DKIM/SPF, Fail2ban, database backup pipelines.</div>
            <div class="ws-role-tags">Database · Shell Scripting · MySQL · Linux · Flask · Docker · Podman · LLMs · Dify · Agents</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-gold"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Director &amp; CEO</div>
            <div class="ws-role-org">Goodwinsun AI Research Startup · Sep 2025–Present</div>
            <div class="ws-role-desc">Founded and lead Goodwinsun — AI research startup driving VAMANA (edge LLM), TAARA (cybersecurity), granty (grant-tech). End-to-end research lifecycle: ideation → implementation → benchmarking → publication.</div>
            <div class="ws-role-tags">AIML · Quantum Computing · Generative AI · Research · Security</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-blue"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Software Developer (Winter Internship)</div>
            <div class="ws-role-org">Sri Aranea Technologies · Dec 2025–Jan 2026 · ₹10k/month</div>
            <div class="ws-role-desc">Built a fingerprint scanner mobile app using camera and image processing; captured accurate fingerprints and obtained payment from client.</div>
            <div class="ws-role-tags">Python · Flutter · Image Processing · Mobile App</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-blue"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Software Developer (Semester Long)</div>
            <div class="ws-role-org">Sri Aranea Technologies · Sep–Nov 2025 · ₹10k/month</div>
            <div class="ws-role-desc">Built possibleclients.com version 2 and aided in deployment on production server.</div>
            <div class="ws-role-tags">MySQL · Linux · ReactJS · UX Design · Material UI</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-blue"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Linux Server Administrator</div>
            <div class="ws-role-org">Sri Aranea Technologies · Jul–Aug 2025 · ₹10k/month</div>
            <div class="ws-role-desc">Managed production server hosting the application; administered production database, application, and basic security.</div>
            <div class="ws-role-tags">Servers · Cockpit · Containerization · Database Security · Firewalls</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-blue"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">DevOps Engineer (Summer Internship)</div>
            <div class="ws-role-org">Sri Aranea Technologies · Jun–Jul 2025 · ₹10k/month</div>
            <div class="ws-role-desc">DevOps engineering for possibleclients.com platform.</div>
            <div class="ws-role-tags">MySQL · GitHub Actions · CI · Docker · Podman · Linux</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-green"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Full Stack Developer</div>
            <div class="ws-role-org">Cortex Craft · Jun–Jul 2025</div>
            <div class="ws-role-desc">Built full-stack generative AI applications for clients.</div>
            <div class="ws-role-tags">Python · Flask · PostgreSQL · Gemini · JavaScript · Generative AI</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-purple"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Patent Drafting &amp; IPO Intern</div>
            <div class="ws-role-org">Ethical Rhythms Pvt. Ltd. (karunyamusicals.com) · Feb–Apr 2025 · ₹8k/month</div>
            <div class="ws-role-desc">Patent drafting for Ethical Rhythms Pvt. Ltd.</div>
            <div class="ws-role-tags">Technical Writing · Patents · IP · Music · Physics</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-teal"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Frontend Web Developer (Winter Internship)</div>
            <div class="ws-role-org">CIE, RV University · Dec 2024–Jan 2025 · ₹8k/month</div>
            <div class="ws-role-desc">Frontend development for the BVB × RVU Patent Workshop platform.</div>
            <div class="ws-role-tags">ReactJS · HTML · CSS · JavaScript · UX Design</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-purple"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Quantum Computing Intern (Summer)</div>
            <div class="ws-role-org">CQST, RV University · Jun–Aug 2024</div>
            <div class="ws-role-desc">Foundational quantum computing research at CQST; enhanced fundamentals and promoted writing of multiple research papers on quantum computing and quantum mechanics.</div>
            <div class="ws-role-tags">Quantum Computing · Q# · Qiskit · Microsoft Azure Quantum · Python</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-green"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Machine Learning Intern (Summer)</div>
            <div class="ws-role-org">DAPMRVDC · Jun–Jul 2024</div>
            <div class="ws-role-desc">Classification of dental X-ray images for teeth classification and identification of anomalies.</div>
            <div class="ws-role-tags">Computer Vision · YOLO · Python · Image Processing</div>
          </div>
        </div>

        <div class="ws-role">
          <div class="ws-role-dot ws-dot-teal"></div>
          <div class="ws-role-body">
            <div class="ws-role-title">Frontend Web Developer</div>
            <div class="ws-role-org">JK Expertrons · Mar–Apr 2024 · ₹5k/month</div>
            <div class="ws-role-desc">Built the platform for JK Expertrons.</div>
            <div class="ws-role-tags">JavaScript · CSS · HTML · Data Analysis</div>
          </div>
        </div>

      </div>
    </div>

    <!-- PROJECTS -->
    <div class="ws-panel ws-full" data-tip="Things built">
      <div class="ws-panel-label">PROJECTS</div>
      <div class="ws-projects-grid">

        <div class="ws-project-card">
          <div class="ws-proj-name">VAMANA</div>
          <div class="ws-proj-full">VAmana's a Model that Attends Narrows and Amplifies</div>
          <div class="ws-proj-desc">Edge LLM with FireAttention and squeeze-expand bottleneck for aggressive compression. Research paper targeting ACL 2026 Industry Track.</div>
          <div class="ws-proj-tags">Python · Deep Learning · LLMs · Edge Computing · Quantization · LoRA · FireAttention</div>
          <a class="ws-proj-link" href="https://github.com/SujayKulkarni-2211/vamana" target="_blank">github.com/SujayKulkarni-2211/vamana ↗</a>
        </div>

        <div class="ws-project-card">
          <div class="ws-proj-name">TAARA</div>
          <div class="ws-proj-full">Threat Aware Autonomous Response Agent</div>
          <div class="ws-proj-desc">Behavioral anomaly detection using reconstruction-based novelty detection and quantum validation via PennyLane. Production-deployed, patent filing in progress. Pitched at Elevate NxT 2026.</div>
          <div class="ws-proj-tags">Autoencoders · Cybersecurity · AIML · Python · Quantum · Patent</div>
          <a class="ws-proj-link" href="https://github.com/SujayKulkarni-2211/taaraiepd" target="_blank">github.com/SujayKulkarni-2211/taaraiepd ↗</a>
        </div>

        <div class="ws-project-card">
          <div class="ws-proj-name">granty</div>
          <div class="ws-proj-full">AI-Powered Grant Writing Platform</div>
          <div class="ws-proj-desc">Flask + GenAI + LangChain platform serving 5+ clients; benefited 3 users in achieving their grants. FKCCI Manthan 2025 Finalist.</div>
          <div class="ws-proj-tags">Flask · Gemini API · LangChain · Frontend · Backend</div>
          <a class="ws-proj-link" href="https://granty.onrender.com" target="_blank">granty.onrender.com ↗</a>
        </div>

        <div class="ws-project-card">
          <div class="ws-proj-name">naimisharanya</div>
          <div class="ws-proj-full">Dharmic Mental Wellness App</div>
          <div class="ws-proj-desc">LLM-based mental health support system with narrative-driven context modeling using Hindu scriptures (Puranas, Upanishads) for dharmic storytelling and emotional grounding.</div>
          <div class="ws-proj-tags">RAG · LLMs · Agents · VLM · Affective Computing · Python</div>
        </div>

        <div class="ws-project-card">
          <div class="ws-proj-name">Lessgogrover</div>
          <div class="ws-proj-full">Grover's Algorithm Simulator</div>
          <div class="ws-proj-desc">Interactive simulation and explanation of Grover's Algorithm. Deployed on HuggingFace Spaces.</div>
          <div class="ws-proj-tags">Quantum Computing · Algorithms · Streamlit · Python · Simulation</div>
          <a class="ws-proj-link" href="https://huggingface.co/sujayvk-btech23" target="_blank">HuggingFace ↗</a>
        </div>

        <div class="ws-project-card">
          <div class="ws-proj-name">possibleclients.com</div>
          <div class="ws-proj-full">Production B2B SaaS Platform</div>
          <div class="ws-proj-desc">Live production platform built and maintained at Sri Aranea Technologies.</div>
          <div class="ws-proj-tags">Flask · ReactJS · MySQL · Podman · CI/CD · Linux</div>
          <a class="ws-proj-link" href="https://possibleclients.com" target="_blank">possibleclients.com ↗</a>
        </div>

        <div class="ws-project-card">
          <div class="ws-proj-name">dhwanimuzics.com</div>
          <div class="ws-proj-full">Music Platform</div>
          <div class="ws-proj-desc">Web platform for Dhwani Muzics.</div>
          <a class="ws-proj-link" href="https://dhwanimuzics.com" target="_blank">dhwanimuzics.com ↗</a>
        </div>

        <div class="ws-project-card">
          <div class="ws-proj-name">Fingerprint Scanner App</div>
          <div class="ws-proj-full">Mobile Fingerprint Capture</div>
          <div class="ws-proj-desc">Fingerprint scanner mobile app using camera and image processing; accurate fingerprint capture with payment received from client.</div>
          <div class="ws-proj-tags">Flutter · Python · Image Processing · Mobile</div>
        </div>

      </div>
    </div>

    <!-- CERTIFICATIONS -->
    <div class="ws-panel" data-tip="Certifications and assessments">
      <div class="ws-panel-label">CERTIFICATIONS &amp; ASSESSMENTS</div>
      <div class="ws-certs">
        <div class="ws-cert-row"><span class="ws-cert-icon">⭐⭐⭐⭐⭐</span><span>HackerRank Problem Solving</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">⭐⭐⭐⭐⭐</span><span>HackerRank Python</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">⭐⭐⭐</span><span>HackerRank Java</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">⭐</span><span>HackerRank C</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">🟡</span><span>LeetCode — 66+ problems solved · Contest qualifier (Codeverse)</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">🐙</span><span>GitHub — 600+ contributions across 3 years</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">🔬</span><span>Open Source — Microsoft Q# · Microsoft QDK · scikit-learn</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">📜</span><span>Design &amp; Implementation of HCI — NPTEL</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">📜</span><span>Open Source Models with Hugging Face</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">📜</span><span>Transformer Models and BERT — Coursera</span></div>
        <div class="ws-cert-row"><span class="ws-cert-icon">📜</span><span>Introduction to LangGraph</span></div>
      </div>
    </div>

    <!-- EDUCATION -->
    <div class="ws-panel" data-tip="Academic records">
      <div class="ws-panel-label">OLD RECORDS</div>
      <div class="ws-edu">
        <div class="ws-edu-row">
          <div class="ws-edu-deg">B.Tech — CSE (AI-ML)</div>
          <div class="ws-edu-inst">RV University, Bengaluru · 2023–2027</div>
          <div class="ws-edu-score">CGPA 8.76 · Sem V: 9.3</div>
        </div>
        <div class="ws-edu-row">
          <div class="ws-edu-deg">PUE 12th</div>
          <div class="ws-edu-inst">RV PU College, Bengaluru · Karnataka Board · 2023</div>
          <div class="ws-edu-score">95.33 / 100</div>
        </div>
        <div class="ws-edu-row">
          <div class="ws-edu-deg">SSLC 10th</div>
          <div class="ws-edu-inst">Shree Bharathi Vidyalaya, Bengaluru · KSEEB · 2021</div>
          <div class="ws-edu-score">97.44 / 100</div>
        </div>
      </div>
    </div>

    <!-- STAR GAZING PLACE -->
    <div class="ws-panel ws-full" data-tip="Other worlds of curiosity">
      <div class="ws-panel-label">STAR GAZING PLACE · Other Areas of Interest</div>
      <div class="ws-interests">
        <span class="ws-interest-tag">Astrophysics</span>
        <span class="ws-interest-tag">Astronomy &amp; Space Science</span>
        <span class="ws-interest-tag">Newtonian Physics</span>
        <span class="ws-interest-tag">Quantum Physics</span>
        <span class="ws-interest-tag">Calculus</span>
        <span class="ws-interest-tag">Botany &amp; Biophysics</span>
        <span class="ws-interest-tag">Innovation &amp; Entrepreneurship</span>
        <span class="ws-interest-tag">Innovation &amp; Geopolitics</span>
        <span class="ws-interest-tag">Teaching</span>
        <span class="ws-interest-tag">Spirituality &amp; Metaphysics</span>
        <span class="ws-interest-tag">Indology &amp; Ancient Indian Philosophy</span>
        <span class="ws-interest-tag">Old Kannada Literature &amp; Poems</span>
        <span class="ws-interest-tag">Sanskrit Literature &amp; Epics</span>
        <span class="ws-interest-tag">Nation Building</span>
        <span class="ws-interest-tag">Swimming</span>
        <span class="ws-interest-tag">Reading — literature to science to tech</span>
      </div>
    </div>

  </div><!-- end ws-grid -->

  <div class="ws-resume-bar">
    <a class="ws-resume-btn" href="master_resume.pdf" target="_blank">⬇ Download Resume</a>
  </div>
</div>`;
  }

  return { build, enter };
})();
